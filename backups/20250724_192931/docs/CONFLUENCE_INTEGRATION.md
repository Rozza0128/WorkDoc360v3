# Confluence Integration Guide for WorkDoc360

## Overview

This guide provides step-by-step instructions for integrating WorkDoc360 documentation into Confluence, including automated content syndication, API integration, and documentation maintenance workflows.

## Prerequisites

### Confluence Setup Requirements
- Confluence Cloud or Server instance
- Admin access to create spaces and pages
- API access tokens or app passwords
- Space for WorkDoc360 documentation

### Required Tools
- Node.js and npm (for API scripts)
- curl or Postman (for API testing)
- Git (for version control)

## Confluence Space Structure

### 1. Create Main Space
**Space Key**: `WORKDOC360`  
**Space Name**: `WorkDoc360 - Construction Compliance Platform`

### 2. Page Hierarchy

```
WorkDoc360 Documentation (Home)
├── 📋 System Overview
│   ├── Architecture Overview
│   ├── Technology Stack
│   ├── Security Model
│   └── Business Value
├── 🚀 Getting Started
│   ├── Installation Guide
│   ├── Quick Start Tutorial
│   ├── Environment Setup
│   └── First Company Setup
├── 👥 User Guides
│   ├── Dashboard Navigation
│   ├── Company Management
│   ├── CSCS Card Verification
│   ├── Personnel Management
│   ├── Document Generation
│   └── Compliance Tracking
├── 🔧 Technical Documentation
│   ├── API Reference
│   ├── Database Schema
│   ├── Frontend Architecture
│   ├── Backend Services
│   └── Integration Guides
├── 🏗️ CSCS System
│   ├── RPA Photo Extraction
│   ├── Card Validation Process
│   ├── Personnel Records
│   └── Workforce Management
├── 🤖 AI Document Generation
│   ├── Claude Integration
│   ├── Document Templates
│   ├── Generation Workflows
│   └── UK Compliance Rules
├── 🔐 Administration
│   ├── User Management
│   ├── Security Configuration
│   ├── Backup Procedures
│   └── System Monitoring
└── 🆘 Support
    ├── Troubleshooting
    ├── FAQ
    ├── Contact Information
    └── Change Log
```

## Automated Documentation Sync

### 1. API Integration Script

```javascript
// confluence-sync.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ConfluenceSync {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
    this.spaceKey = config.spaceKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.auth).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createPage(title, content, parentId = null) {
    const pageData = {
      type: 'page',
      title: title,
      space: { key: this.spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      pageData.ancestors = [{ id: parentId }];
    }

    try {
      const response = await this.client.post('/rest/api/content', pageData);
      console.log(`Created page: ${title} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error(`Failed to create page ${title}:`, error.response?.data);
      throw error;
    }
  }

  async updatePage(pageId, title, content, version) {
    const pageData = {
      id: pageId,
      type: 'page',
      title: title,
      space: { key: this.spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      version: { number: version + 1 }
    };

    try {
      const response = await this.client.put(`/rest/api/content/${pageId}`, pageData);
      console.log(`Updated page: ${title} (Version: ${response.data.version.number})`);
      return response.data;
    } catch (error) {
      console.error(`Failed to update page ${title}:`, error.response?.data);
      throw error;
    }
  }

  async syncMarkdownFile(filePath, parentId = null) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.md').replace(/_/g, ' ');
    
    // Convert markdown to Confluence storage format
    const confluenceContent = this.markdownToConfluence(content);
    
    // Check if page exists
    const existingPage = await this.findPageByTitle(title);
    
    if (existingPage) {
      return await this.updatePage(
        existingPage.id, 
        title, 
        confluenceContent, 
        existingPage.version.number
      );
    } else {
      return await this.createPage(title, confluenceContent, parentId);
    }
  }

  async findPageByTitle(title) {
    try {
      const response = await this.client.get('/rest/api/content', {
        params: {
          spaceKey: this.spaceKey,
          title: title,
          expand: 'version'
        }
      });
      return response.data.results[0] || null;
    } catch (error) {
      console.error(`Failed to find page ${title}:`, error.response?.data);
      return null;
    }
  }

  markdownToConfluence(markdown) {
    // Basic markdown to Confluence conversion
    let confluence = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Wrap list items
    confluence = confluence.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return confluence;
  }
}

module.exports = ConfluenceSync;
```

### 2. Configuration File

```javascript
// confluence-config.js
const config = {
  baseUrl: 'https://your-domain.atlassian.net/wiki',
  auth: 'email@domain.com:api_token', // email:api_token
  spaceKey: 'WORKDOC360',
  
  // Documentation mapping
  documentMappings: [
    {
      file: 'README.md',
      title: 'WorkDoc360 Overview',
      parentTitle: null
    },
    {
      file: 'CONFLUENCE_BACKUP_GUIDE.md',
      title: 'System Backup Guide',
      parentTitle: 'Administration'
    },
    {
      file: 'replit.md',
      title: 'Technical Architecture',
      parentTitle: 'Technical Documentation'
    },
    {
      file: 'CSCS_INTEGRATION_GUIDE.md',
      title: 'CSCS Integration Guide',
      parentTitle: 'CSCS System'
    }
  ]
};

module.exports = config;
```

### 3. Sync Script

```javascript
// sync-to-confluence.js
const ConfluenceSync = require('./confluence-sync');
const config = require('./confluence-config');
const fs = require('fs');
const path = require('path');

async function main() {
  const sync = new ConfluenceSync(config);
  
  console.log('Starting Confluence documentation sync...');
  
  try {
    // Create main pages structure
    const mainPage = await sync.createPage(
      'WorkDoc360 Documentation',
      '<h1>WorkDoc360 - Construction Compliance Platform</h1><p>Complete documentation for the AI-powered construction compliance management system.</p>'
    );
    
    // Create section pages
    const sections = [
      'System Overview',
      'Getting Started', 
      'User Guides',
      'Technical Documentation',
      'CSCS System',
      'AI Document Generation',
      'Administration',
      'Support'
    ];
    
    const sectionPages = {};
    for (const section of sections) {
      sectionPages[section] = await sync.createPage(
        section,
        `<h1>${section}</h1><p>Documentation section for ${section.toLowerCase()}.</p>`,
        mainPage.id
      );
    }
    
    // Sync documentation files
    for (const mapping of config.documentMappings) {
      if (fs.existsSync(mapping.file)) {
        const parentId = mapping.parentTitle ? sectionPages[mapping.parentTitle]?.id : mainPage.id;
        await sync.syncMarkdownFile(mapping.file, parentId);
      }
    }
    
    console.log('Confluence sync completed successfully!');
    
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
```

## Manual Documentation Templates

### 1. API Endpoint Template

```xml
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">API Endpoint: [Endpoint Name]</ac:parameter>
  <ac:rich-text-body>
    <h3>Overview</h3>
    <p>Brief description of endpoint functionality.</p>
    
    <h3>Request Details</h3>
    <table>
      <tr><th>Method</th><td>GET/POST/PUT/DELETE</td></tr>
      <tr><th>URL</th><td>/api/endpoint-path</td></tr>
      <tr><th>Authentication</th><td>Required/Optional</td></tr>
      <tr><th>Permissions</th><td>Admin/Manager/User</td></tr>
    </table>
    
    <h3>Request Format</h3>
    <ac:structured-macro ac:name="code">
      <ac:parameter ac:name="language">json</ac:parameter>
      <ac:plain-text-body><![CDATA[
{
  "parameter": "value",
  "required_field": "string"
}
      ]]></ac:plain-text-body>
    </ac:structured-macro>
    
    <h3>Response Format</h3>
    <ac:structured-macro ac:name="code">
      <ac:parameter ac:name="language">json</ac:parameter>
      <ac:plain-text-body><![CDATA[
{
  "success": true,
  "data": {},
  "message": "string"
}
      ]]></ac:plain-text-body>
    </ac:structured-macro>
  </ac:rich-text-body>
</ac:structured-macro>
```

### 2. User Guide Template

```xml
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Prerequisites</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>Required permissions</li>
      <li>System requirements</li>
      <li>Setup steps</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Step-by-Step Instructions</h2>

<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Task 1: [Action Name]</ac:parameter>
  <ac:rich-text-body>
    <ol>
      <li>Navigate to [location]</li>
      <li>Click [button/link]</li>
      <li>Enter [required information]</li>
      <li>Verify [expected result]</li>
    </ol>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="warning">
  <ac:parameter ac:name="title">Important Notes</ac:parameter>
  <ac:rich-text-body>
    <p>Critical information users need to know.</p>
  </ac:rich-text-body>
</ac:structured-macro>
```

## Content Migration Workflow

### 1. Initial Setup

```bash
# Create Confluence sync directory
mkdir confluence-docs
cd confluence-docs

# Install dependencies
npm init -y
npm install axios fs path

# Copy sync scripts
cp ../scripts/confluence-sync.js .
cp ../scripts/confluence-config.js .
cp ../scripts/sync-to-confluence.js .
```

### 2. Configuration

1. **Get Confluence API Token**:
   - Go to Atlassian Account Settings
   - Create API token
   - Note your email and token

2. **Update Configuration**:
   ```javascript
   const config = {
     baseUrl: 'https://your-domain.atlassian.net/wiki',
     auth: 'your-email@domain.com:your-api-token',
     spaceKey: 'WORKDOC360'
   };
   ```

### 3. Run Initial Sync

```bash
# Test connection
node test-connection.js

# Run full sync
node sync-to-confluence.js
```

### 4. Set Up Automation

```bash
# Add to crontab for daily sync
0 6 * * * cd /path/to/confluence-docs && node sync-to-confluence.js >> sync.log 2>&1
```

## Content Organization Best Practices

### 1. Page Naming Convention
- Use clear, descriptive titles
- Maintain consistent hierarchy
- Include version information where relevant

### 2. Content Structure
- Start with executive summary
- Use expandable sections for detailed content
- Include cross-references and links
- Add status macros for important information

### 3. Code Documentation
- Use syntax highlighting
- Include working examples
- Provide both TypeScript and JavaScript examples
- Add curl examples for API endpoints

### 4. Visual Elements
- Include architecture diagrams
- Add screenshots with annotations
- Use status badges for features
- Create flowcharts for processes

## Maintenance Procedures

### 1. Regular Updates
- Weekly automated sync from repository
- Monthly review of documentation accuracy
- Quarterly major content review
- Annual architecture documentation update

### 2. Version Control
- Tag documentation versions with releases
- Maintain change logs
- Archive outdated content
- Update links and references

### 3. Quality Assurance
- Review all automatically synced content
- Test all code examples
- Verify all links and references
- Ensure screenshots are current

## Integration with Development Workflow

### 1. Pre-commit Hooks
```bash
# Update documentation before commits
#!/bin/sh
echo "Updating documentation..."
node confluence-docs/sync-to-confluence.js
```

### 2. CI/CD Integration
```yaml
# GitHub Actions example
name: Update Confluence Docs
on:
  push:
    branches: [ main ]
    paths: [ '**.md' ]

jobs:
  sync-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Sync to Confluence
        env:
          CONFLUENCE_TOKEN: ${{ secrets.CONFLUENCE_TOKEN }}
        run: node confluence-docs/sync-to-confluence.js
```

### 3. Documentation Reviews
- Include documentation updates in pull requests
- Require documentation review for major changes
- Maintain documentation issue tracking
- Regular documentation team meetings

---

*This guide provides comprehensive instructions for integrating WorkDoc360 documentation with Confluence, ensuring that all technical and business documentation is properly organized and maintained.*