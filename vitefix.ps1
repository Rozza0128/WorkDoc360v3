# ========================================================================
# WorkDoc360 vite.config.ts Cleanup Patch
# Fixes leftover parenthesis and re-runs build + deploy
# ========================================================================

Write-Host "`n🧩 Fixing vite.config.ts syntax..." -ForegroundColor Yellow

$vitePath = ".\vite.config.ts"
if (Test-Path $vitePath) {
    $viteContent = Get-Content $vitePath -Raw
    # Remove stray unmatched parentheses left behind by cleanup
    $viteContent = $viteContent -replace '\)\s*;', ';'
    $viteContent = $viteContent -replace '\)\s*\)', ')'
    $viteContent = $viteContent -replace '\)\s*\n', "`n"
    Set-Content -Path $vitePath -Value $viteContent -Encoding UTF8
    Write-Host "✅ Cleaned up vite.config.ts syntax." -ForegroundColor Green
} else {
    Write-Host "❌ vite.config.ts not found. Cannot fix." -ForegroundColor Red
    exit
}

Write-Host "`n🏗️ Rebuilding project..." -ForegroundColor Yellow
npm run build | Out-Null
Write-Host "✅ Build complete." -ForegroundColor Green

Write-Host "`n🚀 Redeploying to AWS..." -ForegroundColor Cyan
.\deploy-cleanbuild.ps1
