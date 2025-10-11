# ===========================================
# 🖱️ WorkDoc360 - Manual Cloudflare Sync Runner
# ===========================================
# Automatically:
#  1. Sets your Cloudflare API Token
#  2. Runs update-cloudflare-local.ps1
#  3. Logs all output to /manual-run/logs/
# ===========================================

\Continue = "Stop"

# --- Config ---
\ = "C:\Users\Paul WD360\Projects\WorkDoc360v3\manual-run\logs"
\ = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
\ = "\\\\-cloudflare-sync.log"

# --- Start Logging ---
Start-Transcript -Path \ -Append | Out-Null

Write-Host "
🚀 Starting WorkDoc360 Cloudflare manual sync..." -ForegroundColor Cyan

# --- Set API Token ---
\B8LEHA3lDYY1kYBJOb1QZlG3SgKG0l55FNJpUpqD = "YOUR_TOKEN_HERE"

# --- Move to scripts folder ---
Set-Location "C:\Users\Paul WD360\Projects\WorkDoc360v3\scripts"

# --- Run main updater ---
Write-Host "🔧 Running update-cloudflare-local.ps1 ..." -ForegroundColor Yellow
.\update-cloudflare-local.ps1

Write-Host "
✅ Cloudflare sync completed successfully." -ForegroundColor Green
Write-Host "🗂️ Log file saved to: \" -ForegroundColor Gray

# --- End Logging ---
Stop-Transcript | Out-Null
pause
