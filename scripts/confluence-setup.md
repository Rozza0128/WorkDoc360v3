# Confluence Integration Setup Guide

## Overview
This guide helps you set up automatic synchronization between WorkDoc360 and Atlassian Confluence for documentation management.

## Prerequisites
1. Atlassian Confluence Cloud account
2. Admin access to your Confluence space
3. API token generation capability

## Step 1: Create Confluence API Token

1. **Log into Atlassian Account**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"

2. **Generate Token**
   - Label: "WorkDoc360 Backup System"
   - Copy the generated token (you won't see it again)

3. **Note Your Details**
   - Base URL: `https://your-domain.atlassian.net`
   - Username: Your Atlassian email address
   - API Token: The generated token

## Step 2: Configure Environment Variables

Add these variables to your environment:

```bash
# Confluence Configuration
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_USERNAME=your-email@domain.com
CONFLUENCE_API_TOKEN=your_generated_api_token
CONFLUENCE_SPACE_KEY=WORKDOC360
```

## Step 3: Create Confluence Space (Optional)

1. **Create New Space**
   - Go to your Confluence instance
   - Create a new space called "WorkDoc360"
   - Set space key to "WORKDOC360"

2. **Set Permissions**
   - Ensure your API user has write permissions
   - Configure appropriate access for your team

## Step 4: Test Integration

Run the backup and sync system:

```bash
# Test backup only
node scripts/backup-system.js backup

# Test Confluence sync only
node scripts/backup-system.js sync

# Full backup and sync
node scripts/backup-system.js full
```

## Step 5: Set Up Automated Sync

### Option A: Cron Job (Linux/Mac)
```bash
# Add to crontab for daily sync at 2 AM
0 2 * * * cd /path/to/workdoc360 && node scripts/backup-system.js full
```

### Option B: GitHub Actions (if using Git)
```yaml
name: Backup and Sync
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/backup-system.js full
        env:
          CONFLUENCE_BASE_URL: ${{ secrets.CONFLUENCE_BASE_URL }}
          CONFLUENCE_USERNAME: ${{ secrets.CONFLUENCE_USERNAME }}
          CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}
          CONFLUENCE_SPACE_KEY: ${{ secrets.CONFLUENCE_SPACE_KEY }}
```

### Option C: Replit Scheduled Task
1. Create a new file in `.replit` directory
2. Add scheduled task configuration
3. Set environment variables in Replit secrets

## Documentation Structure in Confluence

The sync system will create this page hierarchy:

```
WorkDoc360 Documentation/
├── Project Overview (from replit.md)
├── Technical Documentation/
│   ├── Domain Setup Guide
│   ├── Mobile App Integration Guide
│   ├── Testing Results
│   └── API Documentation
└── Database Documentation/
    └── Database Structure
```

## Features

### Automatic Backup
- **Source Code**: Complete client, server, shared directories
- **Database Schema**: Drizzle schema and configuration
- **Documentation**: All markdown files and guides
- **Configuration**: Build and deployment settings
- **Assets**: Uploaded files and static resources

### Confluence Sync
- **Smart Updates**: Only updates changed content
- **Version Management**: Maintains Confluence page versions
- **Markdown Conversion**: Converts MD to Confluence markup
- **Error Handling**: Graceful failure with detailed logging

### Backup Features
- **Timestamped Archives**: Each backup is uniquely identified
- **Compression**: Automatic ZIP compression
- **Manifest**: Detailed backup contents and restoration notes
- **Statistics**: File counts and size tracking

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify API token is correct
   - Check username matches Atlassian account
   - Ensure account has Confluence access

2. **Space Not Found**
   - Verify CONFLUENCE_SPACE_KEY exists
   - Check space permissions
   - Ensure space is accessible to API user

3. **Page Creation Failed**
   - Check space write permissions
   - Verify page title doesn't conflict
   - Review Confluence storage format

### Debug Mode
Enable detailed logging:
```bash
DEBUG=true node scripts/backup-system.js full
```

## Security Considerations

1. **API Token Security**
   - Store in environment variables only
   - Never commit tokens to version control
   - Rotate tokens regularly

2. **Access Control**
   - Use dedicated service account if possible
   - Apply least-privilege access
   - Monitor API usage

3. **Backup Security**
   - Store backups in secure location
   - Consider encryption for sensitive data
   - Implement retention policies

## Customization

### Adding Custom Documentation
Modify the `prepareConfluenceContent()` method to include additional files:

```javascript
// Add custom documentation
const customDocs = [
  { file: 'CUSTOM_GUIDE.md', title: 'Custom Guide' }
];
```

### Custom Page Templates
Override the `convertMarkdownToConfluence()` method for advanced formatting:

```javascript
convertMarkdownToConfluence(markdown) {
  // Add custom conversion rules
  return markdown
    .replace(/custom-pattern/g, '<custom-confluence-macro>')
    // ... existing conversions
}
```

## Support

For issues with:
- **Backup System**: Check backup logs and permissions
- **Confluence API**: Review Atlassian API documentation
- **Integration**: Verify environment variables and network access

## Next Steps

1. Set up automated daily backups
2. Configure team access to Confluence space
3. Customize documentation structure as needed
4. Monitor backup success and storage usage
5. Consider implementing backup retention policies

The backup and Confluence sync system ensures your WorkDoc360 project documentation and code are safely preserved and easily accessible to your team.