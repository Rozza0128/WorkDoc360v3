<#
PowerShell script to attach an existing ACM certificate to a CloudFront distribution
and create DNS records in Cloudflare for a custom domain.

Prerequisites:
- AWS CLI v2 configured with credentials that can call ACM and CloudFront.
- Cloudflare API token with Zone.DNS and Zone.Workers (for page rules) permissions.
- PowerShell (Windows PowerShell or pwsh) available.

Usage:
.
.
PS> .\scripts\update-cloudfront_and_cloudflare.ps1 \
    -CertificateArn "arn:aws:acm:us-east-1:596797809171:certificate/6b3790f1-fe00-494d-b469-ec17a267b99d" \
    -Domain "workdoc360.com" \
    -CloudFrontDomain "d2sadixuwfssi6.cloudfront.net" \
    -CloudflareZoneId "<your-cloudflare-zone-id>" \
    -CloudflareApiToken "<your-api-token>" \
    -EnableApexRedirect

This will:
- Verify the ACM certificate is ISSUED
- Find the CloudFront distribution for the provided CloudFrontDomain
- Update the distribution to add aliases for www.DOMAIN (and DOMAIN if requested)
  and attach the ACM certificate (must be in us-east-1)
- Create a Cloudflare CNAME for www -> CloudFront domain (DNS only)
- Optionally create a Cloudflare Page Rule to redirect apex to www

Be careful: this updates a live CloudFront distribution and DNS.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$CertificateArn,

    [Parameter(Mandatory = $true)]
    [string]$Domain,

    [Parameter(Mandatory = $false)]
    [string]$CloudFrontDomain = "d2sadixuwfssi6.cloudfront.net",

    [Parameter(Mandatory = $false)]
    [string]$CloudflareZoneId,

    [Parameter(Mandatory = $false)]
    [string]$CloudflareApiToken,

    [Parameter(Mandatory = $false)]
    [switch]$AddApexAlias,

    [Parameter(Mandatory = $false)]
    [switch]$EnableApexRedirect
)

function ExitWithError($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

# 1) Ensure ACM certificate is ISSUED
Write-Host "Checking ACM certificate status for $CertificateArn..."
$certJson = aws acm describe-certificate --region us-east-1 --certificate-arn $CertificateArn | ConvertFrom-Json 2>$null
if (-not $certJson) { ExitWithError "Failed to describe ACM certificate. Ensure AWS CLI is configured and CertificateArn is correct." }

$certStatus = $certJson.Certificate.Status
Write-Host "Certificate status: $certStatus"
if ($certStatus -ne 'ISSUED') {
    ExitWithError "Certificate is not ISSUED. Status: $certStatus. Resolve validation in ACM (check DNS CNAMEs for validation)."
}

# 2) Find CloudFront distribution ID by domain
Write-Host "Finding CloudFront distribution for domain $CloudFrontDomain..."
$distId = aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='$CloudFrontDomain'].Id" --output text
if (-not $distId) { ExitWithError "CloudFront distribution with domain $CloudFrontDomain not found." }
Write-Host "Found distribution id: $distId"

# 3) Get distribution config and ETag
Write-Host "Fetching distribution config..."
$distRaw = aws cloudfront get-distribution-config --id $distId | ConvertFrom-Json
if (-not $distRaw) { ExitWithError "Failed to get distribution config for $distId" }

$etag = $distRaw.ETag
$distConfig = $distRaw.DistributionConfig

# 4) Patch distribution config: add Aliases and ViewerCertificate
$wwwName = "www.$Domain"
$aliasItems = @($wwwName)
if ($AddApexAlias.IsPresent) { $aliasItems += $Domain }

# Prepare Aliases structure
$distConfig.Aliases = @{ Quantity = $aliasItems.Count; Items = $aliasItems }

# Prepare ViewerCertificate structure
$distConfig.ViewerCertificate = @{
    ACMCertificateArn      = $CertificateArn
    SSLSupportMethod       = "sni-only"
    MinimumProtocolVersion = "TLSv1.2_2019"
}

# Important: remove fields that must not be present when calling update-distribution
# (the AWS CLI accepts the DistributionConfig JSON body). Convert to JSON file.
$tempFile = [System.IO.Path]::GetTempFileName() + ".json"
$distConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $tempFile -Encoding utf8
Write-Host "Wrote updated distribution config to $tempFile"

# 5) Update distribution
Write-Host "Updating CloudFront distribution (this will deploy a new distribution configuration)..."
$updateResult = aws cloudfront update-distribution --id $distId --if-match $etag --distribution-config file://$tempFile | ConvertFrom-Json
if (-not $updateResult) { ExitWithError "Failed to update distribution." }

Write-Host "Update initiated. Status: $($updateResult.Distribution.Status). Distribution InProgress: $($updateResult.Distribution.InProgress)"

# 6) Cloudflare DNS changes (optional)
if ($CloudflareZoneId -and $CloudflareApiToken) {
    if (-not (Get-Command Invoke-RestMethod -ErrorAction SilentlyContinue)) { ExitWithError "Invoke-RestMethod not available." }

    # Create or update CNAME for www -> CloudFrontDomain
    $dnsRecordBody = @{
        type    = "CNAME"
        name    = "www"
        content = $CloudFrontDomain
        ttl     = 1
        proxied = $false
    } | ConvertTo-Json

    Write-Host "Creating CNAME record www -> $CloudFrontDomain in Cloudflare zone $CloudflareZoneId (DNS only)..."
    $dnsResp = Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$CloudflareZoneId/dns_records" -Headers @{ "Authorization" = "Bearer $CloudflareApiToken"; "Content-Type" = "application/json" } -Body $dnsRecordBody
    if (-not $dnsResp.success) {
        Write-Host "Cloudflare DNS create response: $($dnsResp | ConvertTo-Json -Depth 5)" -ForegroundColor Yellow
        ExitWithError "Failed to create Cloudflare DNS record. Check your token and zone id." 
    }
    Write-Host "Created Cloudflare DNS record id: $($dnsResp.result.id)"

    # Optional: create page rule to redirect apex to www
    if ($EnableApexRedirect.IsPresent) {
        $ruleBody = @{
            targets  = @(
                @{ target = "url"; constraint = @{ operator = "matches"; value = "$Domain/*" } }
            )
            actions  = @(
                @{ id = "forwarding_url"; value = @{ url = "https://www.$Domain/$1"; status_code = 301 } }
            )
            priority = 1
            status   = "active"
        } | ConvertTo-Json -Depth 10

        Write-Host "Creating Page Rule to redirect $Domain/* -> https://www.$Domain/$1"
        $prResp = Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$CloudflareZoneId/pagerules" -Headers @{ "Authorization" = "Bearer $CloudflareApiToken"; "Content-Type" = "application/json" } -Body $ruleBody
        if (-not $prResp.success) {
            Write-Host "Cloudflare PageRule response: $($prResp | ConvertTo-Json -Depth 5)" -ForegroundColor Yellow
            ExitWithError "Failed to create Page Rule. You can create a redirect in Cloudflare UI instead." 
        }
        Write-Host "Created Page Rule id: $($prResp.result.id)"
    }
}
else {
    Write-Host "Cloudflare credentials not provided; skipping DNS changes. Provide CloudflareZoneId and CloudflareApiToken to enable DNS updates." -ForegroundColor Yellow
}

Write-Host 'Done. CloudFront update in progress — allow several minutes for changes to deploy.' -ForegroundColor Green
Write-Host ("Verify in CloudFront console that Alternate Domain Names include www.{0} and the certificate is set. Then confirm DNS in Cloudflare is pointing to the CloudFront domain (CNAME)." -f $Domain)

# cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue

exit 0
