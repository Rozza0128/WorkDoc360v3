#!/bin/bash

echo "🚀 Quick DNS Fix for workdoc360.com"
echo "====================================="

# Get zone ID for workdoc360.com
echo "1️⃣ Finding workdoc360.com zone..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

echo "Zone response: $ZONE_RESPONSE"

# Extract zone ID (simplified - would need jq for proper parsing)
if [[ $ZONE_RESPONSE == *"workdoc360.com"* ]]; then
  echo "✅ Found workdoc360.com in zones"
  
  # For now, provide manual instructions since we need jq to parse JSON
  echo ""
  echo "📋 Manual DNS Fix Instructions:"
  echo "==============================="
  echo ""
  echo "Add this record in Cloudflare Dashboard → DNS → Records:"
  echo ""
  echo "Type: A"
  echo "Name: @ (or workdoc360.com)"
  echo "Content: 34.117.33.233"
  echo "TTL: Auto"
  echo "Proxy: Enabled (orange cloud)"
  echo ""
  echo "Result: https://workdoc360.com will work (currently shows 'Not Found')"
  echo ""
  echo "Optional - Customer Portal Subdomains:"
  echo "Add these for the £65/month system:"
  echo "• company1 → 34.117.33.233"
  echo "• business1 → 34.117.33.233"
  echo "• construction1 → 34.117.33.233"
  echo "• scaffolding1 → 34.117.33.233"
  echo "• plastering1 → 34.117.33.233"
  echo "(Add 15-20 more as needed)"
  
else
  echo "❌ workdoc360.com zone not found or API error"
  echo ""
  echo "📋 Manual DNS Setup Required:"
  echo "=============================="
  echo ""
  echo "1. Log into Cloudflare Dashboard"
  echo "2. Select workdoc360.com domain"
  echo "3. Go to DNS → Records"
  echo "4. Add record:"
  echo "   Type: A"
  echo "   Name: @"
  echo "   Content: 34.117.33.233"
  echo "   Proxy: Enabled"
  echo ""
  echo "This fixes the 'Not Found' error on https://workdoc360.com"
fi