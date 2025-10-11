#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ConfluenceSync from './confluence-sync.js';
import config from './confluence-config.js';

// Comprehensive backup configuration
const backupConfig = {
  // Main project documentation files
  projectFiles: [
    'README.md',
    'replit.md',
    'CONFLUENCE_API_SETUP.md',
    'CONFLUENCE_BACKUP_GUIDE.md',
    'CONFLUENCE_INTEGRATION.md',
    'SYSTEM_DOCUMENTATION_COMPLETE.md',
    'CSCS_INTEGRATION_GUIDE.md',
    'DOMAIN_SETUP_GUIDE.md',
    'MOBILE_APP_GUIDE.md',
    'LIVE_SAMPLE_DOCUMENT.md',
    'LIVE_TESTING_RESULTS.md',
    'WEBSITE_FUNCTIONALITY_CHECK.md',
    'CARD_ANALYSIS_EXAMPLE.md',
    'SAMPLE_DOCUMENT_EXAMPLES.md'
  ],
  
  // Technical configuration files
  configFiles: [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.ts',
    'drizzle.config.ts',
    'components.json'
  ],
  
  // Key source code files for backup
  sourceFiles: [
    'server/index.ts',
    'server/routes.ts',
    'server/storage.ts',
    'server/db.ts',
    'shared/schema.ts'
  ]
};

/**
 * Read file content safely
 */
function readFileContent(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.log(`   ⚠️  Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Convert markdown content to Confluence storage format
 */
function convertToConfluenceFormat(content, filename) {
  if (!content) return '<p>File not found or empty</p>';
  
  // Basic markdown to HTML conversion for Confluence
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs and fix list structure
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul><ul>/g, '');
  
  return html;
}

/**
 * Create project overview document
 */
function createProjectOverview() {
  const overview = `
# WorkDoc360 - Complete Project Overview

## Executive Summary

WorkDoc360 is a comprehensive construction compliance management platform specifically designed for the UK construction industry. The platform combines advanced AI-powered document generation with real-time CSCS card verification and comprehensive personnel management.

## Key Achievements

### 🎯 Live Deployment
- **Production URL**: https://workdoc360.com
- **Confluence Backup**: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Native email/password system

### 🔧 Technical Implementation
- **Frontend**: React 18 with TypeScript and TailwindCSS
- **Backend**: Node.js with Express and TypeScript
- **AI Integration**: Anthropic Claude Sonnet 4 for document generation
- **Payment**: Stripe subscription management
- **Mobile Ready**: Responsive design with mobile API endpoints

### 📋 Core Features Delivered

#### CSCS Card Verification System
- Real-time verification using official CSCS Smart Check API
- Support for all 12 CSCS card types and colors
- QR code scanning and NFC reading capabilities
- Automated integration with personnel records

#### Personnel Management
- Support for all employment types (permanent, temporary, subcontractor, agency, apprentice)
- Contract tracking with day rates and employment terms
- Site assignment with project codes
- Insurance management and compliance monitoring

#### AI Document Generation
- Anthropic Claude integration for intelligent document creation
- UK construction terminology and British English compliance
- Trade-specific templates for all construction specialties
- Real-time generation with professional formatting

#### Compliance Management
- Automated alerts for expiring certifications
- Toolbox talk recording and management
- Risk assessment templates
- Health and safety documentation

## Business Model

### Pricing Structure
- **Micro Business**: £35/month (1 user) - Sole traders
- **Essential**: £65/month (3 users) - Small teams
- **Professional**: £129/month (10 users) - Mid-size companies
- **Enterprise**: £299/month (50 users) - Large contractors

### Target Market
- UK construction companies of all sizes
- 26 trade specialties covered
- Focus on compliance-driven businesses
- Premium ISO 9001 quality management for Professional+ tiers

## Architecture Overview

### Frontend Architecture
- **React 18**: Modern UI framework with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **Vite**: Fast build tool with hot module replacement
- **TailwindCSS**: Utility-first styling with custom construction theme
- **shadcn/ui**: High-quality accessible components
- **TanStack Query**: Server state management and caching

### Backend Architecture
- **Node.js**: JavaScript runtime with ES modules
- **Express.js**: Web framework with middleware architecture
- **PostgreSQL**: Robust relational database
- **Drizzle ORM**: Type-safe database operations
- **Session Management**: PostgreSQL-backed sessions

### Security Implementation
- **Authentication**: bcrypt password hashing
- **Authorization**: Role-based access control (Admin, Manager, User)
- **Data Protection**: GDPR-compliant data handling
- **API Security**: Token-based mobile authentication

## Integration Capabilities

### External Services
- **Anthropic AI**: Claude Sonnet 4 for document generation
- **CSCS Smart Check**: Official UK card verification
- **Stripe**: Payment processing and subscription management
- **SendGrid**: Email notifications and communications
- **Confluence**: Documentation backup and collaboration

### Mobile Integration
- **WebSocket**: Real-time communication
- **Mobile API**: Token-based authentication for mobile apps
- **Cross-platform**: React Native/Flutter compatible APIs

## Quality Assurance

### Testing Strategy
- **TypeScript**: Compile-time error detection
- **Form Validation**: Zod schema validation
- **API Testing**: Comprehensive endpoint testing
- **Browser Compatibility**: Modern browser support

### Performance Optimization
- **Caching**: TanStack Query for client-side caching
- **Database**: Optimized queries with Drizzle ORM
- **Assets**: Efficient bundling with Vite
- **CDN**: Fast content delivery for static assets

## Documentation System

### Comprehensive Guides
- **User Guides**: Step-by-step instructions for all features
- **Technical Documentation**: API reference and integration guides
- **Administration**: System setup and configuration
- **Support**: Troubleshooting and help resources

### Confluence Integration
- **Automated Backup**: Daily documentation synchronization
- **Professional Structure**: Organized sections and navigation
- **Version Control**: Change tracking and history
- **Team Collaboration**: Shared workspace for documentation

## Future Roadmap

### Immediate Enhancements
1. **Native Mobile Apps**: iOS and Android applications
2. **Advanced Analytics**: Compliance metrics and reporting
3. **Enterprise Integration**: API partnerships with major UK construction software
4. **Industry Certification**: Official endorsements from UK trade associations

### Long-term Vision
1. **Predictive Analytics**: AI-powered compliance risk scoring
2. **IoT Integration**: Site sensor data and real-time monitoring
3. **Marketplace**: Third-party integrations and extensions
4. **International Expansion**: Other English-speaking construction markets

## Technical Support

### Development Environment
- **Platform**: Replit cloud development
- **Version Control**: Git with automated deployments
- **Monitoring**: Real-time application monitoring
- **Backup**: Automated database and file backups

### Support Infrastructure
- **Documentation**: Comprehensive guides and API reference
- **Help System**: In-app support and knowledge base
- **Customer Success**: Dedicated support for enterprise clients
- **Training**: User onboarding and feature training

---

*Last Updated: ${new Date().toLocaleDateString('en-GB')} - WorkDoc360 Development Team*
`;

  return overview;
}

/**
 * Main backup function
 */
async function main() {
  console.log('🚀 Starting Comprehensive WorkDoc360 Confluence Backup...\n');
  
  const sync = new ConfluenceSync(config);
  
  try {
    // Test connection
    console.log('🔗 Testing Confluence connection...');
    await sync.testConnection();
    console.log('✅ Connection successful!\n');
    
    // Create or get main page
    console.log('📋 Setting up main documentation structure...');
    const mainPageContent = `
      <h1>WorkDoc360 - Complete Project Documentation</h1>
      <p>This space contains comprehensive backup documentation for the WorkDoc360 construction compliance management platform.</p>
      
      <h2>Quick Navigation</h2>
      <ul>
        <li><strong>Project Overview</strong> - Executive summary and technical overview</li>
        <li><strong>System Documentation</strong> - Complete technical documentation</li>
        <li><strong>User Guides</strong> - Step-by-step user instructions</li>
        <li><strong>Technical Reference</strong> - API documentation and integration guides</li>
        <li><strong>Configuration Files</strong> - Project configuration and setup</li>
        <li><strong>Source Code Backup</strong> - Key source code files</li>
      </ul>
      
      <p><em>Last Updated: ${new Date().toLocaleDateString('en-GB')} - Automated Backup System</em></p>
    `;
    
    const mainPageId = await sync.createOrUpdatePage('WorkDoc360 - Complete Documentation', mainPageContent);
    console.log(`✅ Main documentation page ready (ID: ${mainPageId})\n`);
    
    // 1. Create Project Overview
    console.log('📊 Creating comprehensive project overview...');
    const projectOverview = createProjectOverview();
    const overviewContent = convertToConfluenceFormat(projectOverview, 'Project Overview');
    await sync.createOrUpdatePage('Project Overview - WorkDoc360', overviewContent, mainPageId);
    console.log('✅ Project overview created\n');
    
    // 2. Create System Documentation section
    console.log('📁 Creating system documentation section...');
    const systemDocId = await sync.createOrUpdatePage('System Documentation', '<h1>System Documentation</h1><p>Complete technical documentation for WorkDoc360 platform.</p>', mainPageId);
    
    // Sync all project documentation files
    console.log('📄 Syncing project documentation files...');
    for (const file of backupConfig.projectFiles) {
      const content = readFileContent(file);
      if (content) {
        const confluenceContent = convertToConfluenceFormat(content, file);
        const title = `${path.basename(file, '.md')} Documentation`;
        await sync.createOrUpdatePage(title, confluenceContent, systemDocId);
        console.log(`   ✅ Synced: ${file}`);
      } else {
        console.log(`   ⚠️  Skipped: ${file} (not found)`);
      }
    }
    
    // 3. Create Configuration Files section
    console.log('\n⚙️ Creating configuration files section...');
    const configSectionId = await sync.createOrUpdatePage('Configuration Files', '<h1>Configuration Files</h1><p>Project configuration and setup files.</p>', mainPageId);
    
    for (const file of backupConfig.configFiles) {
      const content = readFileContent(file);
      if (content) {
        const confluenceContent = `<h1>${file}</h1><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">json</ac:parameter><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
        const title = `Config: ${path.basename(file)}`;
        await sync.createOrUpdatePage(title, confluenceContent, configSectionId);
        console.log(`   ✅ Synced: ${file}`);
      } else {
        console.log(`   ⚠️  Skipped: ${file} (not found)`);
      }
    }
    
    // 4. Create Source Code section
    console.log('\n💻 Creating source code backup section...');
    const sourceSectionId = await sync.createOrUpdatePage('Source Code Backup', '<h1>Source Code Backup</h1><p>Key source code files for reference and backup.</p>', mainPageId);
    
    for (const file of backupConfig.sourceFiles) {
      const content = readFileContent(file);
      if (content) {
        const language = path.extname(file) === '.ts' ? 'typescript' : 'javascript';
        const confluenceContent = `<h1>${file}</h1><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${language}</ac:parameter><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
        const title = `Source: ${path.basename(file)}`;
        await sync.createOrUpdatePage(title, confluenceContent, sourceSectionId);
        console.log(`   ✅ Synced: ${file}`);
      } else {
        console.log(`   ⚠️  Skipped: ${file} (not found)`);
      }
    }
    
    // 5. Create Database Schema section
    console.log('\n🗄️ Creating database schema documentation...');
    const schemaContent = readFileContent('shared/schema.ts');
    if (schemaContent) {
      const schemaHtml = `<h1>Database Schema</h1><p>Complete database schema definition using Drizzle ORM.</p><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">typescript</ac:parameter><ac:plain-text-body><![CDATA[${schemaContent}]]></ac:plain-text-body></ac:structured-macro>`;
      await sync.createOrUpdatePage('Database Schema', schemaHtml, mainPageId);
      console.log('✅ Database schema documentation created');
    }
    
    // 6. Create Deployment Guide
    console.log('\n🚀 Creating deployment guide...');
    const deploymentGuide = `
# WorkDoc360 Deployment Guide

## Production Environment
- **Platform**: Replit Deployments
- **Domain**: workdoc360.com
- **Database**: PostgreSQL (Neon)
- **CDN**: Integrated with Replit

## Environment Variables Required
\`\`\`
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG....
\`\`\`

## Deployment Steps
1. Build the application: \`npm run build\`
2. Set environment variables in Replit Secrets
3. Deploy using Replit's deployment system
4. Configure custom domain (workdoc360.com)
5. Set up SSL certificate (automatic with Replit)

## Database Setup
1. Create PostgreSQL database
2. Run migrations: \`npm run db:push\`
3. Verify connection and tables

## Post-Deployment
1. Test authentication system
2. Verify CSCS API integration
3. Test payment processing
4. Check email notifications
5. Validate mobile responsiveness

Last Updated: ${new Date().toLocaleDateString('en-GB')}
`;
    const deploymentHtml = convertToConfluenceFormat(deploymentGuide, 'Deployment Guide');
    await sync.createOrUpdatePage('Deployment Guide', deploymentHtml, mainPageId);
    console.log('✅ Deployment guide created');
    
    console.log('\n===============================================');
    console.log('✅ Comprehensive Confluence Backup Complete!');
    console.log('===============================================');
    console.log('📊 Backup Summary:');
    console.log(`   • Main page: WorkDoc360 - Complete Documentation`);
    console.log(`   • Project documentation files: ${backupConfig.projectFiles.length}`);
    console.log(`   • Configuration files: ${backupConfig.configFiles.length}`);
    console.log(`   • Source code files: ${backupConfig.sourceFiles.length}`);
    console.log(`   • Additional sections: Project Overview, Database Schema, Deployment Guide`);
    console.log(`   • Confluence URL: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360`);
    console.log('===============================================');
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run the comprehensive backup
main().catch(console.error);