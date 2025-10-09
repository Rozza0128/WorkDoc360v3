<#
Create ACM DNS validation CNAMEs in Cloudflare and poll until the certificate is ISSUED.

Usage:
.
PS> .\scripts\create-acm-validation-cnames.ps1 \
    -CertificateArn "arn:aws:acm:us-east-1:596797809171:certificate/6b3790f1-fe00-494d-b469-ec17a267b99d" \
    -CloudflareZoneId "<your-cloudflare-zone-id>" \
    -CloudflareApiToken "<your-api-token>" \
    -MaxAttempts 60 -PollIntervalSeconds 30

Options:
-CertificateArn (required) : ACM certificate ARN (must be in us-east-1 for CloudFront)
-CloudflareZoneId (required) : Cloudflare Zone ID for the domain
-CloudflareApiToken (required) : Cloudflare API token with Zone.DNS permission
-DryRun (switch) : don't actually create DNS records, just print them
-MaxAttempts (int) : how many times to poll ACM (default 40)
-PollIntervalSeconds (int) : seconds between polls (default 30)

Notes:
- Records are created with proxied=false (DNS-only). This is required for ACM DNS validation to work.
- You can also add the printed records manually in Cloudflare UI if you prefer.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$CertificateArn,

    [Parameter(Mandatory = $true)]
    [string]$CloudflareZoneId,

    [Parameter(Mandatory = $true)]
    [string]$CloudflareApiToken,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [int]$MaxAttempts = 40,

    [Parameter(Mandatory = $false)]
    [int]$PollIntervalSeconds = 30
)

function ExitWithError($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

Write-Host "Fetching ACM validation records for $CertificateArn..."
$desc = aws acm describe-certificate --region us-east-1 --certificate-arn $CertificateArn 2>$null | ConvertFrom-Json
if (-not $desc) { ExitWithError "Failed to describe certificate. Ensure AWS CLI is configured and the ARN is correct." }

$domain = $desc.Certificate.DomainName
Write-Host "Certificate domain: $domain"

$validationOptions = $desc.Certificate.DomainValidationOptions
if (-not $validationOptions) { ExitWithError "No DomainValidationOptions found on the certificate." }

# Build simple list of ResourceRecord objects
$records = @()
foreach ($v in $validationOptions) {
    if ($null -eq $v.ResourceRecord) { Write-Host "Skipping validation option without ResourceRecord: $($v)"; continue }
    $records += [PSCustomObject]@{
        Name  = $v.ResourceRecord.Name.TrimEnd('.')
        Value = $v.ResourceRecord.Value.TrimEnd('.')
        Type  = $v.ResourceRecord.Type
    }
}

Write-Host "Found $($records.Count) validation record(s):"
$records | ForEach-Object { Write-Host " - $($_.Name) -> $($_.Value) ($($_.Type))" }

if ($DryRun) {
    Write-Host "DryRun mode: not creating DNS records. Add these CNAMEs to Cloudflare (DNS-only / grey cloud)." -ForegroundColor Yellow
    exit 0
}

# Create each record in Cloudflare
foreach ($r in $records) {
    $body = @{
        type    = $r.Type
        name    = $r.Name
        content = $r.Value
        ttl     = 120
        proxied = $false
    } | ConvertTo-Json

    Write-Host "Creating DNS record: $($r.Name) -> $($r.Value)"
    try {
        $uri = "https://api.cloudflare.com/client/v4/zones/$CloudflareZoneId/dns_records"
        $resp = Invoke-RestMethod -Method Post -Uri $uri -Headers @{ "Authorization" = "Bearer $CloudflareApiToken"; "Content-Type" = "application/json" } -Body $body
    }
    catch {
        Write-Host "Failed to call Cloudflare API: $_" -ForegroundColor Yellow
        ExitWithError "Cloudflare API call failed. Check token and zone id." 
    }

    if ($resp.success -ne $true) {
        Write-Host "Cloudflare API returned success=false. Full response:" -ForegroundColor Yellow
        $resp | ConvertTo-Json -Depth 5 | Write-Host
        ExitWithError "Failed to create DNS record for $($r.Name)."
    }

    Write-Host "Created record id: $($resp.result.id)" -ForegroundColor Green
}

# Poll ACM until ISSUED
Write-Host "Polling ACM for certificate status (max $MaxAttempts attempts, $PollIntervalSeconds seconds interval)..."
$attempt = 0
$status = $null
while ($attempt -lt $MaxAttempts) {
    $attempt++
    $status = (aws acm describe-certificate --region us-east-1 --certificate-arn $CertificateArn | ConvertFrom-Json).Certificate.Status
    Write-Host "[$(Get-Date -Format o)] Attempt $attempt/$MaxAttempts - ACM status: $status"
    if ($status -eq 'ISSUED') {
        Write-Host "Certificate ISSUED." -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds $PollIntervalSeconds
}

if ($status -ne 'ISSUED') {
    Write-Host "Certificate still not issued after $MaxAttempts attempts. Check ACM console and DNS records." -ForegroundColor Yellow
    exit 2
}

Write-Host "Done. Certificate is ISSUED. You can now run scripts/update-cloudfront_and_cloudflare.ps1 to attach the cert to CloudFront and create additional DNS records (www, apex redirect)." -ForegroundColor Green
exit 0
