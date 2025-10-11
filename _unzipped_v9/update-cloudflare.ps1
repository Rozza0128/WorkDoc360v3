# ===============================
# WorkDoc360 Cloudflare Auto Updater
# ===============================

$ErrorActionPreference = "Stop"

# --- Configuration ---
$zoneName = "workdoc360.com"
$apiToken = $env:CLOUDFLARE_API_TOKEN
$apiBase = "https://api.cloudflare.com/client/v4"
$headers = @{
  Authorization = "Bearer $apiToken"
  "Content-Type" = "application/json"
}

Write-Host "?? Fetching Zone ID for $zoneName ..."
$zoneResp = Invoke-RestMethod -Method GET -Uri "$apiBase/zones?name=$zoneName" -Headers $headers
$zoneId = $zoneResp.result[0].id
Write-Host "? Zone ID: $zoneId"

# --- Ensure A record for root ---
$rootRecord = @{
  type = "A"
  name = $zoneName
  content = "194.56.239.102"
  proxied = $true
}

$existingRoot = Invoke-RestMethod -Method GET -Uri "$apiBase/zones/$zoneId/dns_records?name=$zoneName" -Headers $headers
if ($existingRoot.result.Count -gt 0) {
  $recId = $existingRoot.result[0].id
  Write-Host "?? Updating root A record..."
  Invoke-RestMethod -Method PUT -Uri "$apiBase/zones/$zoneId/dns_records/$recId" -Headers $headers -Body ($rootRecord | ConvertTo-Json)
} else {
  Write-Host "? Creating root A record..."
  Invoke-RestMethod -Method POST -Uri "$apiBase/zones/$zoneId/dns_records" -Headers $headers -Body ($rootRecord | ConvertTo-Json)
}

# --- Force HTTPS ---
Write-Host "?? Enabling Always Use HTTPS ..."
Invoke-RestMethod -Method PATCH -Uri "$apiBase/zones/$zoneId/settings/always_use_https" -Headers $headers -Body '{"value":"on"}'

# --- Set SSL Mode to FULL ---
Write-Host "?? Setting SSL Mode to FULL ..."
Invoke-RestMethod -Method PATCH -Uri "$apiBase/zones/$zoneId/settings/ssl" -Headers $headers -Body '{"value":"full"}'

# --- Redirect root ? www ---
Write-Host "?? Ensuring redirect (http://workdoc360.com ? https://www.workdoc360.com) ..."
$redirectRule = @{
  targets = @(@{ target = "url"; constraint = @{ operator = "matches"; value = "http://workdoc360.com/*" } })
  actions = @(@{ id = "redirect"; value = @{ status_code = 301; url = "https://www.workdoc360.com/$1"; preserve_query_string = $true } })
  enabled = $true
  description = "Root to WWW redirect"
}

$redirectUri = "$apiBase/zones/$zoneId/rulesets/phases/http_request_redirect/entrypoint"
try {
  Invoke-RestMethod -Method POST -Uri $redirectUri -Headers $headers -Body ($redirectRule | ConvertTo-Json -Depth 5)
  Write-Host "? Redirect rule applied."
} catch {
  Write-Host "?? Redirect rule already exists or not supported on your plan."
}

Write-Host "?? Cloudflare update complete for $zoneName"
