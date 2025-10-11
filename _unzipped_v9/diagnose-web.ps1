# =======================================
# WorkDoc360 - Environment Diagnostic Tool
# =======================================

Write-Host "`n🔍 1️⃣ Checking Elastic Beanstalk environment..." -ForegroundColor Cyan
$envData = aws elasticbeanstalk describe-environments --region eu-west-2 | ConvertFrom-Json | Select -ExpandProperty Environments | Where-Object { $_.EnvironmentName -eq 'workdoc' }
if (-not $envData) { Write-Host "❌ No environment found named 'workdoc'" -ForegroundColor Red; exit }

Write-Host "✅ Environment: $($envData.EnvironmentName) — IP: $($envData.EndpointURL)"
$instance = aws ec2 describe-instances --filters "Name=tag:elasticbeanstalk:environment-name,Values=workdoc" --region eu-west-2 | ConvertFrom-Json | Select -ExpandProperty Reservations | Select -ExpandProperty Instances | Select InstanceId, PublicIpAddress
Write-Host "🖥️ Instance: $($instance.InstanceId) | IP: $($instance.PublicIpAddress)"

Write-Host "`n🌐 Testing HTTP/HTTPS connectivity..." -ForegroundColor Cyan
Test-NetConnection workdoc360.com -Port 80 | Select ComputerName, RemoteAddress, TcpTestSucceeded | Format-Table
Test-NetConnection workdoc360.com -Port 443 | Select ComputerName, RemoteAddress, TcpTestSucceeded | Format-Table

Write-Host "`n📡 Testing direct access to EC2 instance (bypass Cloudflare)" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://13.41.209.222" -UseBasicParsing -TimeoutSec 10
  Write-Host "✅ HTTP: $($r.StatusCode) $($r.StatusDescription)"
} catch { Write-Host "❌ HTTP request failed: $($_.Exception.Message)" -ForegroundColor Red }

try {
  $r = Invoke-WebRequest -Uri "https://13.41.209.222" -UseBasicParsing -SkipCertificateCheck -TimeoutSec 10
  Write-Host "✅ HTTPS: $($r.StatusCode) $($r.StatusDescription)"
} catch { Write-Host "⚠️ HTTPS failed: $($_.Exception.Message)" -ForegroundColor Yellow }

Write-Host "`n📖 Retrieving latest Elastic Beanstalk logs..." -ForegroundColor Cyan
aws elasticbeanstalk request-environment-info --environment-name workdoc --info-type tail --region eu-west-2 | Out-Null
Start-Sleep -Seconds 10
$logs = aws elasticbeanstalk retrieve-environment-info --environment-name workdoc --info-type tail --region eu-west-2 | ConvertFrom-Json | Select -ExpandProperty EnvironmentInfo | Select -ExpandProperty Message
Write-Host "📄 Logs available at: $logs"
