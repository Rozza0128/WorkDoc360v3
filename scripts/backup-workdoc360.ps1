# =======================================
# WorkDoc360 — Local Project Backup Script
# =======================================

$ErrorActionPreference = "Stop"

# Go to project root
Set-Location "C:\Users\Paul WD360\Projects"

# Create a timestamped backup folder
$timestamp = (Get-Date).ToString("yyyy-MM-dd_HHmm")
$backupFolder = "C:\Users\Paul WD360\Backups\WorkDoc360_$timestamp"
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

Write-Host "🗂 Creating backup folder: $backupFolder" -ForegroundColor Cyan

# Copy project using robust mode (handles long paths + skips locked files)
$source = "C:\Users\Paul WD360\Projects\WorkDoc360v3"
Write-Host "📦 Copying from: $source"
Write-Host "➡️  To: $backupFolder"

Get-ChildItem -Path $source -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $target = $_.FullName.Replace($source, $backupFolder)
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Force -Path $target -ErrorAction SilentlyContinue | Out-Null
    } else {
        try {
            Copy-Item -Path $_.FullName -Destination $target -Force -ErrorAction Stop
        } catch {
            Write-Host "⚠️ Skipped file: $($_.FullName)" -ForegroundColor Yellow
        }
    }
}

Write-Host "✅ Local backup complete → $backupFolder" -ForegroundColor Green
