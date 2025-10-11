#!/bin/bash

# WorkDoc360 Confluence Integration Setup Script

echo "🚀 WorkDoc360 Confluence Integration Setup"
echo "==========================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"
echo

# Install required packages if not already installed
echo "📦 Installing required npm packages..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Check if axios is available
if ! npm list axios &> /dev/null; then
    echo "Installing axios for HTTP requests..."
    npm install axios
fi

echo "✅ Dependencies installed"
echo

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Make scripts executable
chmod +x scripts/confluence-sync.js
chmod +x scripts/sync-to-confluence.js
chmod +x scripts/test-confluence.js

echo "✅ Scripts made executable"
echo

# Create environment file template
if [ ! -f ".env.confluence" ]; then
    echo "📝 Creating Confluence environment template..."
    cat > .env.confluence << 'EOF'
# Confluence Configuration
# Copy these values to your environment or update confluence-config.js

# Your Confluence instance URL (e.g., https://your-company.atlassian.net/wiki)
CONFLUENCE_URL=https://your-domain.atlassian.net/wiki

# Your email and API token (format: email@domain.com:api_token)
# Get API token from: https://id.atlassian.com/manage-profile/security/api-tokens
CONFLUENCE_AUTH=your-email@domain.com:your-api-token

# Your Confluence space key (e.g., WORKDOC360)
CONFLUENCE_SPACE=WORKDOC360
EOF
    echo "✅ Environment template created: .env.confluence"
else
    echo "⚠️  Environment file already exists: .env.confluence"
fi

echo
echo "🔧 Configuration Instructions:"
echo "=============================="
echo
echo "1. Get your Confluence API token:"
echo "   • Go to https://id.atlassian.com/manage-profile/security/api-tokens"
echo "   • Click 'Create API token'"
echo "   • Copy the generated token"
echo
echo "2. Update configuration:"
echo "   • Edit scripts/confluence-config.js"
echo "   • Or set environment variables in .env.confluence"
echo "   • Update baseUrl, auth (email:token), and spaceKey"
echo
echo "3. Create Confluence space:"
echo "   • Go to your Confluence instance"
echo "   • Create a new space with key 'WORKDOC360'"
echo "   • Ensure you have admin permissions"
echo
echo "4. Test the connection:"
echo "   node scripts/test-confluence.js"
echo
echo "5. Run full sync:"
echo "   node scripts/sync-to-confluence.js"
echo

# Test if configuration looks valid
echo "🧪 Quick Configuration Check:"
echo "=============================="

if [ -f "scripts/confluence-config.js" ]; then
    if grep -q "your-domain.atlassian.net" scripts/confluence-config.js; then
        echo "⚠️  Default configuration detected - please update confluence-config.js"
    else
        echo "✅ Configuration file appears to be customized"
    fi
else
    echo "❌ Configuration file not found: scripts/confluence-config.js"
fi

echo
echo "📚 Available Commands:"
echo "====================="
echo "• Test connection:     node scripts/test-confluence.js"
echo "• Full sync:          node scripts/sync-to-confluence.js"
echo "• Backup system:      ./scripts/backup-system.sh"
echo
echo "📖 Documentation files that will be synced:"
echo "============================================"

docs=(
    "README.md"
    "replit.md"
    "CONFLUENCE_BACKUP_GUIDE.md"
    "CONFLUENCE_INTEGRATION.md"
    "SYSTEM_DOCUMENTATION_COMPLETE.md"
    "CSCS_INTEGRATION_GUIDE.md"
    "DOMAIN_SETUP_GUIDE.md"
    "MOBILE_APP_GUIDE.md"
    "LIVE_SAMPLE_DOCUMENT.md"
    "LIVE_TESTING_RESULTS.md"
    "WEBSITE_FUNCTIONALITY_CHECK.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "⚠️  $doc (not found)"
    fi
done

echo
echo "🎉 Setup complete! Update your configuration and run the test."
echo "==============================================="