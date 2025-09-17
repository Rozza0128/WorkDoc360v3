#!/usr/bin/env node

/**
 * WorkDoc360 Backup and Confluence Sync System
 * Backs up project files and syncs documentation with Confluence
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupSystem {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.confluenceConfig = {
      baseUrl: process.env.CONFLUENCE_BASE_URL || 'https://your-domain.atlassian.net',
      username: process.env.CONFLUENCE_USERNAME,
      apiToken: process.env.CONFLUENCE_API_TOKEN,
      spaceKey: process.env.CONFLUENCE_SPACE_KEY || 'WORKDOC360'
    };
  }

  async createBackup() {
    console.log('🔄 Starting WorkDoc360 backup process...');
    
    try {
      // Create backup directory
      await fs.mkdir(this.backupDir, { recursive: true });
      
      const backupName = `workdoc360-backup-${this.timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);
      
      // Create timestamped backup folder
      await fs.mkdir(backupPath, { recursive: true });
      
      // Backup categories
      const backupTasks = [
        this.backupSourceCode(backupPath),
        this.backupDatabase(backupPath),
        this.backupDocumentation(backupPath),
        this.backupConfiguration(backupPath),
        this.backupAssets(backupPath)
      ];
      
      await Promise.all(backupTasks);
      
      // Create backup manifest
      await this.createBackupManifest(backupPath);
      
      // Compress backup
      const zipPath = await this.compressBackup(backupPath);
      
      console.log('✅ Backup completed successfully!');
      console.log(`📦 Backup location: ${zipPath}`);
      
      return zipPath;
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }

  async backupSourceCode(backupPath) {
    console.log('📁 Backing up source code...');
    
    const sourceBackupPath = path.join(backupPath, 'source');
    await fs.mkdir(sourceBackupPath, { recursive: true });
    
    // Key directories to backup
    const directories = ['client', 'server', 'shared', 'scripts'];
    const files = [
      'package.json', 'package-lock.json', 'tsconfig.json', 
      'vite.config.ts', 'tailwind.config.ts', 'drizzle.config.ts',
      'replit.md', '.replit', '.gitignore'
    ];
    
    // Copy directories
    for (const dir of directories) {
      if (await this.pathExists(dir)) {
        await this.copyDirectory(dir, path.join(sourceBackupPath, dir));
      }
    }
    
    // Copy files
    for (const file of files) {
      if (await this.pathExists(file)) {
        await fs.copyFile(file, path.join(sourceBackupPath, file));
      }
    }
    
    console.log('✅ Source code backup completed');
  }

  async backupDatabase(backupPath) {
    console.log('🗄️ Backing up database schema...');
    
    const dbBackupPath = path.join(backupPath, 'database');
    await fs.mkdir(dbBackupPath, { recursive: true });
    
    try {
      // Export database schema
      const schemaContent = await fs.readFile('shared/schema.ts', 'utf8');
      await fs.writeFile(path.join(dbBackupPath, 'schema.ts'), schemaContent);
      
      // Export drizzle config
      if (await this.pathExists('drizzle.config.ts')) {
        const drizzleConfig = await fs.readFile('drizzle.config.ts', 'utf8');
        await fs.writeFile(path.join(dbBackupPath, 'drizzle.config.ts'), drizzleConfig);
      }
      
      // Create database documentation
      const dbDocs = this.generateDatabaseDocumentation();
      await fs.writeFile(path.join(dbBackupPath, 'database-structure.md'), dbDocs);
      
      console.log('✅ Database backup completed');
    } catch (error) {
      console.warn('⚠️ Database backup partial:', error.message);
    }
  }

  async backupDocumentation(backupPath) {
    console.log('📚 Backing up documentation...');
    
    const docsBackupPath = path.join(backupPath, 'documentation');
    await fs.mkdir(docsBackupPath, { recursive: true });
    
    // Documentation files to backup
    const docFiles = [
      'replit.md',
      'DOMAIN_SETUP_GUIDE.md',
      'LIVE_SAMPLE_DOCUMENT.md', 
      'LIVE_TESTING_RESULTS.md',
      'MOBILE_APP_GUIDE.md',
      'SAMPLE_DOCUMENT_EXAMPLES.md',
      'WEBSITE_FUNCTIONALITY_CHECK.md'
    ];
    
    for (const docFile of docFiles) {
      if (await this.pathExists(docFile)) {
        await fs.copyFile(docFile, path.join(docsBackupPath, docFile));
      }
    }
    
    // Generate comprehensive project documentation
    const projectDocs = await this.generateProjectDocumentation();
    await fs.writeFile(path.join(docsBackupPath, 'project-overview.md'), projectDocs);
    
    console.log('✅ Documentation backup completed');
  }

  async backupConfiguration(backupPath) {
    console.log('⚙️ Backing up configuration...');
    
    const configBackupPath = path.join(backupPath, 'configuration');
    await fs.mkdir(configBackupPath, { recursive: true });
    
    // Configuration files
    const configFiles = [
      'components.json',
      'postcss.config.js',
      '.replit'
    ];
    
    for (const configFile of configFiles) {
      if (await this.pathExists(configFile)) {
        await fs.copyFile(configFile, path.join(configBackupPath, configFile));
      }
    }
    
    // Create environment template
    const envTemplate = this.generateEnvironmentTemplate();
    await fs.writeFile(path.join(configBackupPath, '.env.template'), envTemplate);
    
    console.log('✅ Configuration backup completed');
  }

  async backupAssets(backupPath) {
    console.log('🖼️ Backing up assets...');
    
    const assetsBackupPath = path.join(backupPath, 'assets');
    await fs.mkdir(assetsBackupPath, { recursive: true });
    
    // Asset directories
    const assetDirs = ['attached_assets', 'uploaded_assets'];
    
    for (const assetDir of assetDirs) {
      if (await this.pathExists(assetDir)) {
        await this.copyDirectory(assetDir, path.join(assetsBackupPath, assetDir));
      }
    }
    
    console.log('✅ Assets backup completed');
  }

  async createBackupManifest(backupPath) {
    const manifest = {
      timestamp: this.timestamp,
      version: '1.0.0',
      project: 'WorkDoc360',
      description: 'AI-powered construction compliance management platform',
      backupContents: [
        'source - Complete source code (client, server, shared)',
        'database - Database schema and configuration',
        'documentation - Project documentation and guides',
        'configuration - Build and deployment configuration',
        'assets - Uploaded files and static assets'
      ],
      stats: await this.getBackupStats(backupPath),
      created: new Date().toISOString(),
      restorationNotes: 'Run npm install, configure environment variables, and run database migrations'
    };
    
    await fs.writeFile(
      path.join(backupPath, 'BACKUP_MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );
  }

  async compressBackup(backupPath) {
    console.log('🗜️ Compressing backup...');
    
    const zipName = `${path.basename(backupPath)}.zip`;
    const zipPath = path.join(this.backupDir, zipName);
    
    try {
      // Use system zip command if available, otherwise create tar
      execSync(`cd "${this.backupDir}" && zip -r "${zipName}" "${path.basename(backupPath)}"`, {
        stdio: 'inherit'
      });
      
      // Remove uncompressed backup folder
      await this.removeDirectory(backupPath);
      
      return zipPath;
    } catch (error) {
      console.warn('⚠️ Compression failed, keeping uncompressed backup');
      return backupPath;
    }
  }

  async syncWithConfluence() {
    console.log('🔄 Starting Confluence synchronization...');
    
    if (!this.confluenceConfig.username || !this.confluenceConfig.apiToken) {
      console.warn('⚠️ Confluence credentials not configured. Skipping sync.');
      console.log('Set CONFLUENCE_USERNAME and CONFLUENCE_API_TOKEN environment variables.');
      return;
    }
    
    try {
      // Read key documentation files
      const docs = await this.prepareConfluenceContent();
      
      // Sync each document
      for (const doc of docs) {
        await this.createOrUpdateConfluencePage(doc);
      }
      
      console.log('✅ Confluence synchronization completed');
    } catch (error) {
      console.error('❌ Confluence sync failed:', error.message);
    }
  }

  async prepareConfluenceContent() {
    const docs = [];
    
    // Main project overview
    if (await this.pathExists('replit.md')) {
      const content = await fs.readFile('replit.md', 'utf8');
      docs.push({
        title: 'WorkDoc360 - Project Overview',
        content: this.convertMarkdownToConfluence(content),
        parentTitle: 'WorkDoc360 Documentation'
      });
    }
    
    // Technical guides
    const guides = [
      { file: 'DOMAIN_SETUP_GUIDE.md', title: 'Domain Setup Guide' },
      { file: 'MOBILE_APP_GUIDE.md', title: 'Mobile App Integration Guide' },
      { file: 'LIVE_TESTING_RESULTS.md', title: 'Testing Results' }
    ];
    
    for (const guide of guides) {
      if (await this.pathExists(guide.file)) {
        const content = await fs.readFile(guide.file, 'utf8');
        docs.push({
          title: guide.title,
          content: this.convertMarkdownToConfluence(content),
          parentTitle: 'Technical Documentation'
        });
      }
    }
    
    // API documentation
    const apiDocs = await this.generateApiDocumentation();
    docs.push({
      title: 'API Documentation',
      content: this.convertMarkdownToConfluence(apiDocs),
      parentTitle: 'Technical Documentation'
    });
    
    return docs;
  }

  async createOrUpdateConfluencePage(doc) {
    console.log(`📄 Syncing: ${doc.title}`);
    
    const { baseUrl, username, apiToken, spaceKey } = this.confluenceConfig;
    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    
    // Check if page exists
    const searchUrl = `${baseUrl}/wiki/rest/api/content?spaceKey=${spaceKey}&title=${encodeURIComponent(doc.title)}`;
    
    try {
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        // Update existing page
        await this.updateConfluencePage(searchData.results[0].id, doc);
      } else {
        // Create new page
        await this.createConfluencePage(doc);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to sync ${doc.title}:`, error.message);
    }
  }

  async createConfluencePage(doc) {
    const { baseUrl, username, apiToken, spaceKey } = this.confluenceConfig;
    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    
    const pageData = {
      type: 'page',
      title: doc.title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: doc.content,
          representation: 'storage'
        }
      }
    };
    
    const response = await fetch(`${baseUrl}/wiki/rest/api/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pageData)
    });
    
    if (response.ok) {
      console.log(`✅ Created: ${doc.title}`);
    } else {
      throw new Error(`Failed to create page: ${response.statusText}`);
    }
  }

  async updateConfluencePage(pageId, doc) {
    const { baseUrl, username, apiToken } = this.confluenceConfig;
    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    
    // Get current page version
    const pageResponse = await fetch(`${baseUrl}/wiki/rest/api/content/${pageId}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    const pageData = await pageResponse.json();
    const newVersion = pageData.version.number + 1;
    
    const updateData = {
      version: { number: newVersion },
      title: doc.title,
      type: 'page',
      body: {
        storage: {
          value: doc.content,
          representation: 'storage'
        }
      }
    };
    
    const response = await fetch(`${baseUrl}/wiki/rest/api/content/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      console.log(`✅ Updated: ${doc.title}`);
    } else {
      throw new Error(`Failed to update page: ${response.statusText}`);
    }
  }

  // Helper methods
  async pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async removeDirectory(dirPath) {
    try {
      await fs.rmdir(dirPath, { recursive: true });
    } catch (error) {
      console.warn(`Could not remove ${dirPath}:`, error.message);
    }
  }

  async getBackupStats(backupPath) {
    const stats = { files: 0, directories: 0, totalSize: 0 };
    
    const walk = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          stats.directories++;
          await walk(fullPath);
        } else {
          stats.files++;
          const fileStat = await fs.stat(fullPath);
          stats.totalSize += fileStat.size;
        }
      }
    };
    
    await walk(backupPath);
    return stats;
  }

  generateDatabaseDocumentation() {
    return `# WorkDoc360 Database Structure

## Overview
WorkDoc360 uses PostgreSQL with Drizzle ORM for type-safe database operations.

## Core Tables

### Users Table
- Stores user authentication and profile information
- Supports native email/password authentication
- Includes two-factor authentication fields

### Companies Table
- Multi-tenant company structure
- Trade type specialization support
- Owner relationship with users

### Company Users Table
- Role-based company membership
- Supports Admin, Manager, and User roles
- Many-to-many relationship between users and companies

### Compliance Documents
- Generated documents storage
- Document templates and annotations
- Review and approval workflows

### Payment System
- Voucher codes and usage tracking
- Subscription management
- Plan status tracking

## Key Features
- Type-safe operations with Drizzle ORM
- PostgreSQL session storage
- Automated migration system
- Comprehensive audit trails

Generated: ${new Date().toISOString()}
`;
  }

  async generateProjectDocumentation() {
    return `# WorkDoc360 - Complete Project Documentation

## Project Overview
WorkDoc360 is an AI-powered construction compliance management platform designed for UK construction businesses. The system provides comprehensive document generation, compliance tracking, and safety management tools.

## Architecture
- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express, native authentication
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Anthropic Claude for document generation
- **Payment**: Stripe integration with voucher system

## Key Features
1. **AI Document Generation**: Trade-specific compliance documents
2. **Website Scraping**: Automatic company branding extraction
3. **Multi-tenant System**: Company-based access control
4. **Compliance Tracking**: CSCS cards, risk assessments, method statements
5. **Mobile Integration**: API ready for mobile app development

## Technology Stack
- React 18, TypeScript, Vite
- Express.js, Node.js
- PostgreSQL, Drizzle ORM
- Anthropic AI, Stripe, SendGrid
- Tailwind CSS, shadcn/ui, Framer Motion

## Deployment
- Replit platform hosting
- Environment-based configuration
- Automated database migrations
- SSL/TLS security

## Business Model
- Subscription-based pricing (£35-£299/month)
- 12-month contract model
- Trade-specific document libraries
- Professional ISO 9001 compliance features

Generated: ${new Date().toISOString()}
`;
  }

  async generateApiDocumentation() {
    return `# WorkDoc360 API Documentation

## Authentication Endpoints
- POST /api/login - User authentication
- POST /api/register - User registration
- POST /api/logout - User logout
- GET /api/user - Get current user

## Company Management
- GET /api/companies - List user companies
- POST /api/companies - Create new company
- PUT /api/companies/:id - Update company
- GET /api/companies/:id/users - List company users

## Document Generation
- GET /api/document-recommendations/:tradeType - Get trade recommendations
- POST /api/scrape-website - Website scraping for branding
- POST /api/generate-documents - AI document generation
- GET /api/documents - List generated documents

## Compliance Management
- GET /api/cscs-cards - List CSCS cards
- POST /api/cscs-cards - Add CSCS card
- GET /api/risk-assessments - List risk assessments
- POST /api/risk-assessments - Create risk assessment

## Payment System
- POST /api/validate-voucher - Validate voucher code
- POST /api/subscription/upgrade - Upgrade company plan

## Mobile API
- POST /api/mobile/login - Mobile authentication
- POST /api/mobile/register - Mobile registration
- GET /api/mobile/user - Get mobile user data

## Response Formats
All API endpoints return JSON responses with consistent error handling and status codes.

Generated: ${new Date().toISOString()}
`;
  }

  generateEnvironmentTemplate() {
    return `# WorkDoc360 Environment Configuration Template

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/workdoc360

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Session Configuration
SESSION_SECRET=your_secure_session_secret_here

# Confluence Integration (Optional)
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_USERNAME=your_confluence_username
CONFLUENCE_API_TOKEN=your_confluence_api_token
CONFLUENCE_SPACE_KEY=WORKDOC360

# Application Settings
NODE_ENV=production
PORT=5000

# Domain Configuration
DOMAIN=workdoc360.com
`;
  }

  convertMarkdownToConfluence(markdown) {
    // Basic Markdown to Confluence markup conversion
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([^```]+)```/g, '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'backup';
  
  const backupSystem = new BackupSystem();
  
  switch (command) {
    case 'backup':
      await backupSystem.createBackup();
      break;
      
    case 'sync':
      await backupSystem.syncWithConfluence();
      break;
      
    case 'full':
      const backupPath = await backupSystem.createBackup();
      console.log('\n🔄 Starting Confluence sync...');
      await backupSystem.syncWithConfluence();
      break;
      
    default:
      console.log('Usage: node backup-system.js [backup|sync|full]');
      console.log('  backup - Create project backup');
      console.log('  sync   - Sync documentation with Confluence');
      console.log('  full   - Backup and sync');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BackupSystem;