# ========================================================================
# WorkDoc360 AWS Elastic Beanstalk — Replit Plugin Cleanup & Deployment Fix
# Author: Paul Roscoe / WorkDoc360
# Purpose: Remove Replit-only Vite plugins, fix build format, and redeploy
# ========================================================================

Write-Host "`n🧹 Starting WorkDoc360 Cleanup + Redeploy Script..." -ForegroundColor Cyan

# --- SETTINGS ---
$AppName = "workdoc360-api"
$EnvName = "workdoc"
$Region = "eu-west-2"
$Bucket = "elasticbeanstalk-eu-west-2-596797809171"
$Version = "v" + (Get-Date -Format "yyMMddHHmm")
$ZipFile = "app-$Version.zip"

# --- STEP 1: CLEAN vite.config.ts ---
$vitePath = ".\vite.config.ts"
if (Test-Path $vitePath) {
    Write-Host "`n🧩 Cleaning vite.config.ts (removing Replit-only imports)..." -ForegroundColor Yellow
    $viteContent = Get-Content $vitePath -Raw
    $viteContent = $viteContent -replace 'import\s+runtimeErrorOverlay.*', ''
    $viteContent = $viteContent -replace 'await\s+import\("@replit/vite-plugin-cartographer"\).*', ''
    $viteContent = $viteContent -replace '@replit/vite-plugin-runtime-error-modal', ''
    $viteContent = $viteContent -replace '@replit/vite-plugin-cartographer', ''
    Set-Content -Path $vitePath -Value $viteContent -Encoding UTF8
    Write-Host "✅ vite.config.ts cleaned." -ForegroundColor Green
} else {
    Write-Host "⚠️ vite.config.ts not found — skipping cleanup." -ForegroundColor DarkYellow
}

# --- STEP 2: FIX package.json BUILD SCRIPT ---
Write-Host "`n🧾 Fixing package.json build script..." -ForegroundColor Yellow
$packagePath = ".\package.json"
if (Test-Path $packagePath) {
    $package = Get-Content $packagePath -Raw | ConvertFrom-Json
    $correctBuild = "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist"
    $correctStart = "NODE_ENV=production node dist/index.js"

    if ($package.scripts.build -ne $correctBuild) {
        $package.scripts.build = $correctBuild
        Write-Host "✅ Updated build script for AWS (ESM → CJS)." -ForegroundColor Green
    }

    if ($package.scripts.start -ne $correctStart) {
        $package.scripts.start = $correctStart
        Write-Host "✅ Updated start script to: $correctStart" -ForegroundColor Green
    }

    $package | ConvertTo-Json -Depth 10 | Out-File $packagePath -Encoding UTF8
} else {
    Write-Host "❌ package.json not found! Cannot continue." -ForegroundColor Red
    exit
}

# --- STEP 3: ENSURE PROCFILE ---
Write-Host "`n🧾 Ensuring Procfile exists..." -ForegroundColor Yellow
$procfilePath = ".\Procfile"
$procfileContent = "web: npm start"
if (-not (Test-Path $procfilePath)) {
    Set-Content -Path $procfilePath -Value $procfileContent -Encoding UTF8
    Write-Host "✅ Created Procfile." -ForegroundColor Green
} else {
    $existing = Get-Content $procfilePath -Raw
    if ($existing -ne $procfileContent) {
        Set-Content -Path $procfilePath -Value $procfileContent -Encoding UTF8
        Write-Host "✅ Updated Procfile content." -ForegroundColor Green
    } else {
        Write-Host "✔️ Procfile already correct." -ForegroundColor Green
    }
}

# --- STEP 4: BUILD PROJECT ---
Write-Host "`n🏗️ Building project..." -ForegroundColor Yellow
try {
    npm run build | Out-Null
    Write-Host "✅ Build completed successfully." -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed! Check vite.config.ts and dependencies." -ForegroundColor Red
    exit
}

# --- STEP 5: CREATE ZIP PACKAGE ---
Write-Host "`n📦 Creating deployment archive..." -ForegroundColor Yellow
if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
$Include = @("package.json", "package-lock.json", "Procfile", ".ebextensions", "dist", "server")
Compress-Archive -Path $Include -DestinationPath $ZipFile -Force
$sizeMB = "{0:N1}" -f ((Get-Item $ZipFile).Length / 1MB)
Write-Host "✅ Created $ZipFile ($sizeMB MB)" -ForegroundColor Green

# --- STEP 6: UPLOAD TO S3 ---
Write-Host "`n☁️ Uploading $ZipFile to S3 bucket..." -ForegroundColor Yellow
aws s3 cp ".\$ZipFile" "s3://$Bucket/$ZipFile" --region $Region | Out-Null
Write-Host "✅ Upload complete." -ForegroundColor Green

# --- STEP 7: REGISTER NEW VERSION ---
Write-Host "`n🆕 Registering new Elastic Beanstalk version..." -ForegroundColor Yellow
aws elasticbeanstalk create-application-version `
  --application-name $AppName `
  --version-label $Version `
  --source-bundle S3Bucket=$Bucket,S3Key=$ZipFile `
  --region $Region | Out-Null
Write-Host "✅ Version $Version registered successfully." -ForegroundColor Green

# --- STEP 8: DEPLOY NEW VERSION ---
Write-Host "`n🚢 Deploying version $Version to environment $EnvName..." -ForegroundColor Yellow
aws elasticbeanstalk update-environment `
  --environment-name $EnvName `
  --version-label $Version `
  --region $Region | Out-Null
Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Cyan

# --- STEP 9: VERIFY DEPLOYMENT ---
Start-Sleep -Seconds 20
Write-Host "`n🔍 Checking environment status..." -ForegroundColor Yellow
$envInfo = aws elasticbeanstalk describe-environments --region $Region | ConvertFrom-Json
$env = $envInfo.Environments | Where-Object { $_.EnvironmentName -eq $EnvName }
Write-Host ("Current version: " + $env.VersionLabel)
Write-Host ("Status: " + $env.Status)
Write-Host ("Health: " + $env.Health)
Write-Host ("CNAME: " + $env.CNAME)
Write-Host "`n✅ All done! Check your EB dashboard for live status." -ForegroundColor Green
