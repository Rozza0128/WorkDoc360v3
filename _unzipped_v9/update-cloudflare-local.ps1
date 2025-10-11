# =========================================
# 🌀 WorkDoc360 Cloudflare Dual-Domain Updater
# =========================================
# This script updates:
#   1. A record for workdoc360.com → your current public IP
#   2. CNAME record for www.workdoc360.com → workdoc360.com
#   3. Enables Always Use HTTPS + SSL Full
# =========================================

Continue = "Stop"

# --- Configuration ---
 = "workdoc360.com"
 = 
if (-not ) {
    Write-Host "❌ No API token found. Run:  $env:CLOUDFLARE_API_TOKEN = 'YOUR_TOKEN_HERE'" -ForegroundColor Red
    exit 1
}
 = "https://api.cloudflare.com/client/v4"
 = @{
    Authorization = "Bearer "
    "Content-Type" = "application/json"
}

# --- Detect your public IP ---
Write-Host "🌍 Detecting current public IP..."
 = (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip
Write-Host "🔎 Detected IP: "

# --- Fetch Zone ID ---
Write-Host "🔍 Fetching Zone ID for  ..."
 = (Invoke-RestMethod -Method GET -Uri "/zones?name=" -Headers ).result[0]
if (-not ) { Write-Host "❌ Zone not found. Check your token permissions."; exit 1 }
 = .id
Write-Host "✅ Zone ID: "

# --- A record for root domain ---
 = (Invoke-RestMethod -Method GET -Uri "/zones//dns_records?type=A&name=" -Headers ).result[0]
if ( -eq ) {
    Write-Host "➕ Creating A record for ..."
     = @{ type="A"; name=; content=; proxied=True } | ConvertTo-Json
    Invoke-RestMethod -Method POST -Uri "/zones//dns_records" -Headers  -Body 
} elseif (.content -ne ) {
    Write-Host "⚙️ Updating A record ( → )..."
     = @{ type="A"; name=; content=; proxied=True } | ConvertTo-Json
    Invoke-RestMethod -Method PUT -Uri "/zones//dns_records/" -Headers  -Body 
} else {
    Write-Host "👌 A record already up to date."
}

# --- CNAME record for www ---
 = (Invoke-RestMethod -Method GET -Uri "/zones//dns_records?name=www." -Headers ).result[0]
if ( -eq ) {
    Write-Host "➕ Creating CNAME for www → ..."
     = @{ type="CNAME"; name="www"; content=; proxied=True } | ConvertTo-Json
    Invoke-RestMethod -Method POST -Uri "/zones//dns_records" -Headers  -Body 
} elseif (.content -ne ) {
    Write-Host "⚙️ Updating www CNAME ( → )..."
     = @{ type="CNAME"; name="www"; content=; proxied=True } | ConvertTo-Json
    Invoke-RestMethod -Method PUT -Uri "/zones//dns_records/" -Headers  -Body 
} else {
    Write-Host "👌 CNAME www already correct."
}

# --- Enforce HTTPS + SSL Full ---
Write-Host "🔐 Enabling Always Use HTTPS ..."
Invoke-RestMethod -Method PATCH -Uri "/zones//settings/always_use_https" -Headers  -Body '{"value":"on"}' | Out-Null

Write-Host "🧩 Setting SSL Mode to FULL ..."
Invoke-RestMethod -Method PATCH -Uri "/zones//settings/ssl" -Headers  -Body '{"value":"full"}' | Out-Null

Write-Host "
🎉 Cloudflare sync complete for !" -ForegroundColor Green
