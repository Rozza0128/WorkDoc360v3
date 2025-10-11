# ============================================================
# WorkDoc360 Cloudflare DNS & Redirect Updater (Safe Version)
# ============================================================

$ErrorActionPreference = "Stop"

# --- Cloudflare API Config ---
$apiToken = "B8LEHA3lDYY1kYBJOb1QZlG3SgKG0l55FNJpUpqD"
$zoneName = "workdoc360.com"
$apiBase = "https://api.cloudflare.com/client/v4"

Write-Host "Fetching zone ID for $zoneName ..."
$zoneUri = "$apiBase/zones?name=$zoneName"
$zoneResult = Invoke-RestMethod -Method GET -Uri $zoneUri -Headers @{
    Authorization = "Bearer $apiToken"
    "Content-Type" = "application/json"
}
$zoneId = $zoneResult.result[0].id

if (-not $zoneId) {
    Write-Error "Zone not found. Check domain or API token."
    exit 1
}

Write-Host "Connected to Cloudflare zone: $zoneName ($zoneId)"
Write-Host ""

# --- DNS Records ---
$records = @(
    @{ type="A"; name="$zoneName"; content="20.90.133.0"; proxied=$true },
    @{ type="CNAME"; name="www"; content="$zoneName"; proxied=$true }
)

foreach ($record in $records) {
    Write-Host "Processing DNS record $($record.name) ..."
    $recordNameEscaped = [uri]::EscapeDataString($record.name)
    $typeEscaped = [uri]::EscapeDataString($record.type)
    $queryUri = "$apiBase/zones/$zoneId/dns_records?type=$typeEscaped`&name=$recordNameEscaped"

    $existing = (Invoke-RestMethod -Method GET -Uri $queryUri -Headers @{
        Authorization = "Bearer $apiToken"
        "Content-Type" = "application/json"
    }).result

    if ($existing) {
        $recordId = $existing[0].id
        Invoke-RestMethod -Method PUT -Uri "$apiBase/zones/$zoneId/dns_records/$recordId" `
            -Headers @{Authorization="Bearer $apiToken"; "Content-Type"="application/json"} `
            -Body ($record | ConvertTo-Json)
        Write-Host "Updated record: $($record.name)"
    }
    else {
        Invoke-RestMethod -Method POST -Uri "$apiBase/zones/$zoneId/dns_records" `
            -Headers @{Authorization="Bearer $apiToken"; "Content-Type"="application/json"} `
            -Body ($record | ConvertTo-Json)
        Write-Host "Created record: $($record.name)"
    }
}
Write-Host ""

# --- Redirect rule (root → www) ---
Write-Host "Ensuring redirect rule (root → www)..."

$redirectBody = @{
    description = "Redirect root to www"
    rules = @(
        @{
            expression = "(http.host eq `"$zoneName`")"
            action = @{
                type = "redirect"
                parameters = @{
                    from_value = @{
                        status_code = 301
                        target_url = "https://www.$zoneName/$1"
                        preserve_query_string = $true
                    }
                }
            }
        }
    )
}

$redirectJson = $redirectBody | ConvertTo-Json -Depth 6
Invoke-RestMethod -Method POST -Uri "$apiBase/zones/$zoneId/rulesets/phases/http_request_dynamic_redirect/entrypoint" `
    -Headers @{Authorization="Bearer $apiToken"; "Content-Type"="application/json"} `
    -Body $redirectJson
Write-Host "Redirect created or verified."
Write-Host ""

# --- Enable Always Use HTTPS ---
Write-Host "Enabling Always Use HTTPS..."
$httpsBody = @{ value = "on" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "$apiBase/zones/$zoneId/settings/always_use_https" `
    -Headers @{Authorization="Bearer $apiToken"; "Content-Type"="application/json"} `
    -Body $httpsBody
Write-Host "Always Use HTTPS enabled."

# --- Set SSL Mode to Full ---
Write-Host "Setting SSL mode to Full..."
$sslBody = @{ value = "full" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "$apiBase/zones/$zoneId/settings/ssl" `
    -Headers @{Authorization="Bearer $apiToken"; "Content-Type"="application/json"} `
    -Body $sslBody
Write-Host "SSL mode set to Full."

Write-Host ""
Write-Host "All Cloudflare settings updated successfully!"


