# Confluence API Integration - Complete Setup Guide

## Quick Setup Instructions

I've created a complete Confluence API integration system for WorkDoc360. Here's how to set it up:

### Step 1: Get Your Confluence API Token

1. **Go to Atlassian Account Settings**:
   - Visit: https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Label it "WorkDoc360 Documentation Sync"
   - Copy the generated token (you won't see it again!)

2. **Find Your Confluence Details**:
   - **Base URL**: Your Confluence URL (e.g., `https://your-company.atlassian.net/wiki`)
   - **Email**: The email address for your Atlassian account
   - **Space Key**: Create or use existing space (e.g., `WORKDOC360`)

### Step 2: Configure the Integration

1. **Update the configuration file**:
   ```bash
   # Edit scripts/confluence-config.js
   vim scripts/confluence-config.js
   ```

2. **Replace the placeholder values**:
   ```javascript
   const config = {
     baseUrl: 'https://your-actual-domain.atlassian.net/wiki',
     auth: 'your-email@domain.com:your-actual-api-token',
     spaceKey: 'WORKDOC360'
   };
   ```

### Step 3: Test the Connection

```bash
# Test your Confluence connection
node scripts/test-confluence.js
```

### Step 4: Run Full Documentation Sync

```bash
# Sync all WorkDoc360 documentation to Confluence
node scripts/sync-to-confluence.js
```

## What Gets Created in Confluence

The system automatically creates a complete documentation structure:

### 📋 Main Page Structure
```
WorkDoc360 Documentation (Home)
├── 📋 System Overview
│   ├── WorkDoc360 Platform Overview (README.md)
│   ├── Complete Documentation Package
│   └── Architecture Overview
├── 🚀 Getting Started
│   ├── Installation Guide
│   ├── Production Deployment Guide
│   └── Quick Start Tutorial
├── 👥 User Guides
│   ├── Getting Started Guide
│   ├── CSCS Card Verification Guide
│   ├── Personnel Management Guide
│   └── Dashboard Navigation
├── 🔧 Technical Documentation
│   ├── Technical Architecture (replit.md)
│   ├── API Reference
│   ├── Database Schema
│   ├── Mobile Application Integration
│   └── Testing and Validation Results
├── 🏗️ CSCS System
│   ├── CSCS Card Verification System
│   ├── RPA Photo Extraction
│   ├── Personnel Records
│   └── Workforce Management
├── 🤖 AI Document Generation
│   ├── AI Document Generation Examples
│   ├── Claude Integration
│   ├── Document Templates
│   └── UK Compliance Rules
├── 🔐 Administration
│   ├── System Backup and Recovery Procedures
│   ├── Confluence Integration Setup
│   ├── Quality Assurance Procedures
│   └── User Management
└── 🆘 Support
    ├── Troubleshooting
    ├── FAQ
    └── Contact Information
```

### 🔧 API Documentation Pages
- Authentication API endpoints
- Company Management API
- CSCS Verification API endpoints
- Personnel Management API

### 👥 User Guide Pages
- Complete getting started guide
- Step-by-step CSCS verification process
- Personnel management procedures
- Dashboard navigation instructions

## Features of the Integration

### ✅ Automated Sync
- Converts Markdown files to Confluence format
- Preserves code blocks with syntax highlighting
- Maintains document hierarchy and relationships
- Updates existing pages instead of duplicating

### ✅ Content Processing
- Markdown to Confluence storage format conversion
- Code syntax highlighting preservation
- Table formatting maintenance
- Link and image processing

### ✅ Error Handling
- Connection testing before sync
- Detailed error messages and troubleshooting
- Partial sync capability (continues on individual failures)
- Comprehensive logging and reporting

### ✅ Automation Ready
- Environment variable support
- Command-line interface
- Scriptable for CI/CD integration
- Cron job compatible

## Advanced Usage

### Automated Daily Sync
```bash
# Add to crontab for daily sync at 6 AM
0 6 * * * cd /path/to/workdoc360 && node scripts/sync-to-confluence.js >> confluence-sync.log 2>&1
```

### Environment Variables
```bash
# Set environment variables instead of editing config
export CONFLUENCE_URL="https://your-domain.atlassian.net/wiki"
export CONFLUENCE_AUTH="email@domain.com:api_token"
export CONFLUENCE_SPACE="WORKDOC360"

# Run sync
node scripts/sync-to-confluence.js
```

### Custom Configuration
```javascript
// Modify scripts/confluence-config.js for custom mappings
documentMappings: [
  {
    file: 'YOUR_CUSTOM_FILE.md',
    title: 'Custom Documentation',
    parentTitle: 'Technical Documentation'
  }
]
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your email and API token are correct
   - Check if API token has expired
   - Ensure account has Confluence access

2. **Space Not Found**
   - Verify space key is correct (case-sensitive)
   - Check if you have access to the space
   - Create the space if it doesn't exist

3. **Permission Denied**
   - Ensure account has page creation permissions
   - Check space permissions settings
   - Verify admin access if needed

### Getting Help

1. **Test Connection**: `node scripts/test-confluence.js`
2. **Check Logs**: Review error messages in console output
3. **Verify Configuration**: Double-check all URLs and credentials
4. **Contact Support**: Provide error logs and configuration details

## Security Best Practices

### 🔒 Protect Your API Token
- Never commit API tokens to version control
- Use environment variables or secure config files
- Rotate tokens regularly
- Limit token permissions to necessary scopes

### 🔒 Network Security
- Use HTTPS for all Confluence connections
- Consider IP restrictions for API access
- Monitor API usage and access logs
- Implement rate limiting if needed

## Next Steps

1. **Set up your Confluence space**
2. **Configure the integration with your credentials**
3. **Test the connection**
4. **Run the full documentation sync**
5. **Set up automated daily syncing**
6. **Share the Confluence space with your team**

Your WorkDoc360 documentation will be automatically organized and maintained in Confluence with professional formatting and navigation!