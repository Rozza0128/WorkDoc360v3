# Fix-NodeVersion.ps1
# Purpose: Remove deprecated NodeVersion settings from .ebextensions and ensure package.json targets Node 22.x

Write-Host "🔍 Checking for deprecated NodeVersion entries in .ebextensions..." -ForegroundColor Cyan

$ebPath = ".\.ebextensions"
$backupPath = ".\.ebextensions_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Step 1: Backup existing .ebextensions folder
if (Test-Path $ebPath) {
    Write-Host "📦 Backing up .ebextensions to $backupPath..." -ForegroundColor Yellow
    Copy-Item $ebPath $backupPath -Recurse -Force
} else {
    Write-Host "⚠️ No .ebextensions folder found. Skipping backup and config cleanup." -ForegroundColor DarkYellow
}

# Step 2: Remove NodeVersion lines from .ebextensions config files
if (Test-Path $ebPath) {
    Get-ChildItem $ebPath -Filter *.config -Recurse | ForEach-Object {
        $content = Get-Content $_.FullName
        $filtered = $content | Where-Object { $_ -notmatch "NodeVersion" }
        if ($content -ne $filtered) {
            Write-Host "🧹 Removing NodeVersion line from $($_.Name)..." -ForegroundColor Green
            $filtered | Set-Content $_.FullName -Encoding UTF8
        }
    }
} else {
    Write-Host "ℹ️ No config files found to modify." -ForegroundColor DarkYellow
}

# Step 3: Ensure package.json has correct Node engine version
$packageFile = ".\package.json"
if (Test-Path $packageFile) {
    Write-Host "🧩 Checking Node.js engine in package.json..." -ForegroundColor Cyan
    $package = Get-Content $packageFile -Raw | ConvertFrom-Json

    if (-not $package.engines) {
        $package | Add-Member -MemberType NoteProperty -Name "engines" -Value @{ node = "22.x" }
        Write-Host "✅ Added engines section with Node 22.x" -ForegroundColor Green
    } elseif ($package.engines.node -ne "22.x") {
        Write-Host "🔧 Updating Node engine version to 22.x" -ForegroundColor Yellow
        $package.engines.node = "22.x"
    } else {
        Write-Host "✔️ Node engine already set to 22.x" -ForegroundColor Green
    }

    # Save updated package.json
    $package | ConvertTo-Json -Depth 10 | Out-File $packageFile -Encoding utf8
} else {
    Write-Host "⚠️ No package.json found in this directory." -ForegroundColor DarkYellow
}

Write-Host "`n✅ Cleanup complete! You can now repackage and deploy your Elastic Beanstalk app safely." -ForegroundColor Cyan

