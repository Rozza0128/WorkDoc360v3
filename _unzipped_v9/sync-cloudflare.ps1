# ==========================================
# WorkDoc360 — Auto AWS → Cloudflare Sync (Smart + Beanstalk Aware + Fixed Apex)
# ==========================================

$ErrorActionPreference = "Stop"

# --- Config ---
$zoneName = "workdoc360.com"
$apiToken = "B8LEHA3lDYY1kYBJOb1QZlG3SgKG0l55FNJpUpqD"
$apiBase = "https://api.cloudflare.com/client/v4"
$headers = @{
  Authorization = "Bearer $apiToken"
  "Content-Type" = "application/json"
}

Write-Host "`n🔍 Finding latest AWS CloudFormation stack ..." -ForegroundColor Cyan
$stacks = aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE | ConvertFrom-Json
$latestStack = $stacks.StackSummaries | Sort-Object -Property LastUpdatedTime -Descending | Select-Object -First 1

if (-not $latestStack) {
  Write-Host "❌ No valid CloudFormation stacks found!" -ForegroundColor Red
  exit
}

$stackName = $latestStack.StackName
Write-Host "✅ Latest stack detected: $stackName" -ForegroundColor Green

$stackOutput = aws cloudformation describe-stacks --stack-name $stackName | ConvertFrom-Json
$outputs = $stackOutput.Stacks[0].Outputs

$awsTarget = ($outputs | Where-Object { $_.OutputValue -match "amazonaws.com" }).OutputValue

if (-not $awsTarget) {
  Write-Host "🔁 No CloudFormation endpoint found — checking Elastic Beanstalk environments..." -ForegroundColor Yellow
  try {
    $beanstalkEnv = aws elasticbeanstalk describe-environments --query "Environments[?Status=='Ready'].CNAME" --output text
    if ($beanstalkEnv) {
      $awsTarget = $beanstalkEnv.Trim()
      Write-Host "✅ Found Elastic Beanstalk endpoint: $awsTarget" -ForegroundColor Green
    } else {
      Write-Host "❌ No active Beanstalk environments found!" -ForegroundColor Red
      exit
    }
  } catch {
    Write-Host "⚠️ Could not query Elastic Beanstalk — check AWS CLI config." -ForegroundColor Red
    exit
  }
}

$zoneId = (Invoke-RestMethod -Method GET -Uri "$apiBase/zones?name=$zoneName" -Headers $headers).result[0].id
Write-Host "🌐 Cloudflare Zone ID: $zoneId" -ForegroundColor Yellow

function Update-DNSRecord {
  param([string]$recordName, [string]$type)

  Write-Host "🔧 Processing DNS record: $recordName ($type)"
  $existing = (Invoke-RestMethod -Method GET -Uri "$apiBase/zones/$zoneId/dns_records?name=$recordName" -Headers $headers).result[0]

  if ($type -eq "A") {
    $body = @{
      type = "A"
      name = $zoneName
      content = "194.56.239.102" # Fallback public IP (Cloudflare flattening)
      proxied = $true
    } | ConvertTo-Json
  } else {
    $body = @{
      type = "CNAME"
      name = "www"
      content = $awsTarget
      proxied = $true
    } | ConvertTo-Json
  }

  if ($existing) {
    Write-Host "↻ Updating existing record ($recordName)"
    Invoke-RestMethod -Method PUT -Uri "$apiBase/zones/$zoneId/dns_records/$($existing.id)" -Headers $headers -Body $body | Out-Null
  } else {
    Write-Host "➕ Creating new record ($recordName)"
    Invoke-RestMethod -Method POST -Uri "$apiBase/zones/$zoneId/dns_records" -Headers $headers -Body $body | Out-Null
  }
}

# Update both records
Update-DNSRecord $zoneName "A"
Update-DNSRecord "www.$zoneName" "CNAME"

Start-Sleep -Seconds 5
Write-Host "`n🔎 Verifying DNS propagation..." -ForegroundColor Cyan
Resolve-DnsName $zoneName | Select Name, Type, IPAddress, NameHost
Resolve-DnsName "www.$zoneName" | Select Name, Type, IPAddress, NameHost

Write-Host "`n🎉 Done — Cloudflare now points to your AWS environment ($awsTarget)" -ForegroundColor Green
