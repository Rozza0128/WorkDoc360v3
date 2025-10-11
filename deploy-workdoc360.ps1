# ========================================================================
# WorkDoc360 Elastic Beanstalk Deployment Script
# Author: Paul Roscoe / WorkDoc360
# Purpose: Build, zip, upload, and deploy app automatically to AWS
# ========================================================================

Write-Host "`n🚀 Starting WorkDoc360 Deployment..." -ForegroundColor Cyan

# --- SETTINGS ---
$AppName = "workdoc360-api"
$EnvName = "workdoc"
$Region = "eu-west-2"
$Bucket = "elasticbeanstalk-eu-west-2-596797809171"
$Version = "v" + (Get-Date -Format "yyMMddHHmm")
$ZipFile = "app-$Version.zip"

# --- FIX package.json START SCRIPT ---
Write-Host "`n🧩 Checking package.json start script..." -ForegroundColor Yellow
$packagePath = ".\package.json"
if (Test-Path $packagePath) {
    $package = Get-Content $packagePath -Raw | ConvertFrom-Json
    $startScript = "NODE_ENV=production node dist/server/index.js"
    if ($package.scripts.start -ne $startScript) {
        $package.scripts.start = $startScript
        $package | ConvertTo-Json -Depth 10 | Out-File $packagePath -Encoding UTF8
        Write-Host "✅ Updated start script." -ForegroundColor Green
    } else {
        Write-Host "✔️ Start script already correct." -ForegroundColor Green
    }
} else {
    Write-Host "❌ package.json not found. Exiting." -ForegroundColor Red
    exit
}

# --- BUILD PROJECT ---
Write-Host "`n🏗️ Building project..." -ForegroundColor Yellow
try {
    npm run build | Out-Null
    Write-Host "✅ Build completed successfully." -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Please check errors above." -ForegroundColor Red
    exit
}

# --- CREATE ZIP PACKAGE ---
Write-Host "`n📦 Creating deployment archive..." -ForegroundColor Yellow
if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
$Include = @("package.json", "package-lock.json", "Procfile", ".ebextensions", "dist", "server")
Compress-Archive -Path $Include -DestinationPath $ZipFile -Force
$sizeMB = "{0:N1}" -f ((Get-Item $ZipFile).Length / 1MB)
Write-Host "✅ Created $ZipFile ($sizeMB MB)" -ForegroundColor Green

# --- UPLOAD TO S3 ---
Write-Host "`n☁️ Uploading $ZipFile to S3 bucket..." -ForegroundColor Yellow
aws s3 cp ".\$ZipFile" "s3://$Bucket/$ZipFile" --region $Region | Out-Null
Write-Host "✅ Upload complete." -ForegroundColor Green

# --- REGISTER NEW VERSION ---
Write-Host "`n🆕 Registering new Elastic Beanstalk version..." -ForegroundColor Yellow
aws elasticbeanstalk create-application-version `
  --application-name $AppName `
  --version-label $Version `
  --source-bundle S3Bucket=$Bucket,S3Key=$ZipFile `
  --region $Region | Out-Null
Write-Host "✅ Version $Version registered successfully." -ForegroundColor Green

# --- DEPLOY NEW VERSION ---
Write-Host "`n🚢 Deploying version $Version to environment $EnvName..." -ForegroundColor Yellow
aws elasticbeanstalk update-environment `
  --environment-name $EnvName `
  --version-label $Version `
  --region $Region | Out-Null
Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Cyan

# --- VERIFY DEPLOYMENT ---
Start-Sleep -Seconds 15
Write-Host "`n🔍 Checking environment status..." -ForegroundColor Yellow
$envInfo = aws elasticbeanstalk describe-environments --region $Region | ConvertFrom-Json
$env = $envInfo.Environments | Where-Object { $_.EnvironmentName -eq $EnvName }
Write-Host ("Current version: " + $env.VersionLabel)
Write-Host ("Status: " + $env.Status)
Write-Host ("Health: " + $env.Health)
Write-Host ("CNAME: " + $env.CNAME)
Write-Host "`n✅ All done! Check your EB dashboard if needed." -ForegroundColor Green
