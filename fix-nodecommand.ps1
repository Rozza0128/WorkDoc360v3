# ========================================================================
# fix-nodecommand.ps1
# Purpose: Remove deprecated NodeCommand settings from .ebextensions
# ========================================================================

Write-Host "`n🔍 Scanning for deprecated NodeCommand entries in .ebextensions..." -ForegroundColor Cyan

$ebPath = ".\.ebextensions"
$backupPath = ".\.ebextensions_backup_NodeCommand_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Step 1: Backup existing .ebextensions folder
if (Test-Path $ebPath) {
    Write-Host "📦 Backing up .ebextensions to $backupPath..." -ForegroundColor Yellow
    Copy-Item $ebPath $backupPath -Recurse -Force
} else {
    Write-Host "⚠️ No .ebextensions folder found. Exiting." -ForegroundColor DarkYellow
    exit
}

# Step 2: Remove NodeCommand lines from .config files
$files = Get-ChildItem $ebPath -Filter *.config -Recurse
if ($files.Count -eq 0) {
    Write-Host "ℹ️ No .config files found in .ebextensions." -ForegroundColor DarkYellow
} else {
    foreach ($file in $files) {
        $content = Get-Content $file.FullName
        $filtered = $content | Where-Object { $_ -notmatch "NodeCommand" }
        if ($content -ne $filtered) {
            Write-Host "🧹 Removing NodeCommand line from $($file.Name)..." -ForegroundColor Green
            $filtered | Set-Content $file.FullName -Encoding UTF8
        }
    }
}

Write-Host "`n✅ Cleanup complete! All NodeCommand entries removed safely." -ForegroundColor Cyan
Write-Host "📁 Backup stored at: $backupPath" -ForegroundColor Yellow
