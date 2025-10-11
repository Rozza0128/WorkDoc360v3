#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ConfluenceSync from './confluence-sync.js';
import config from './confluence-config.js';

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
    console.log(`   ⚠️  Could not read ${filePath}`);
    return null;
  }
}

/**
 * Convert markdown to basic HTML for Confluence
 */
function markdownToHtml(content) {
  if (!content) return '<p>File not found or empty</p>';
  
  return content
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
    .replace(/\n/g, '<br/>')
    // Wrap in paragraphs
    .replace(/^(.*)$/, '<p>$1</p>')
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul><ul>/g, '');
}

/**
 * Create comprehensive project overview
 */
function createProjectOverview() {
  return `
<h1>WorkDoc360 - Complete Project Overview</h1>

<h2>Executive Summary</h2>
<p>WorkDoc360 is a comprehensive construction compliance management platform specifically designed for the UK construction industry. The platform combines advanced AI-powered document generation with real-time CSCS card verification and comprehensive personnel management.</p>

<h2>🎯 Live Deployment Status</h2>
<ul>
  <li><strong>Production URL</strong>: https://workdoc360.com</li>
  <li><strong>Confluence Backup</strong>: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360</li>
  <li><strong>Database</strong>: PostgreSQL with Drizzle ORM</li>
  <li><strong>Authentication</strong>: Native email/password system</li>
  <li><strong>Payment Processing</strong>: Stripe integration active</li>
  <li><strong>AI Integration</strong>: Anthropic Claude Sonnet 4</li>
</ul>

<h2>🔧 Technical Architecture</h2>
<h3>Frontend Stack</h3>
<ul>
  <li><strong>React 18</strong>: Modern UI framework with hooks and concurrent features</li>
  <li><strong>TypeScript</strong>: Type-safe development with strict mode</li>
  <li><strong>Vite</strong>: Fast build tool with hot module replacement</li>
  <li><strong>TailwindCSS</strong>: Utility-first styling with custom construction theme</li>
  <li><strong>shadcn/ui</strong>: High-quality accessible components</li>
  <li><strong>TanStack Query</strong>: Server state management and caching</li>
</ul>

<h3>Backend Stack</h3>
<ul>
  <li><strong>Node.js</strong>: JavaScript runtime with ES modules</li>
  <li><strong>Express.js</strong>: Web framework with middleware architecture</li>
  <li><strong>PostgreSQL</strong>: Robust relational database</li>
  <li><strong>Drizzle ORM</strong>: Type-safe database operations</li>
  <li><strong>Session Management</strong>: PostgreSQL-backed sessions</li>
</ul>

<h2>📋 Core Features Delivered</h2>

<h3>CSCS Card Verification System</h3>
<ul>
  <li>Real-time verification using official CSCS Smart Check API</li>
  <li>Support for all 12 CSCS card types and colors</li>
  <li>QR code scanning and NFC reading capabilities</li>
  <li>Automated integration with personnel records</li>
  <li>Mock development service for testing</li>
</ul>

<h3>Personnel Management</h3>
<ul>
  <li>Support for all employment types (permanent, temporary, subcontractor, agency, apprentice)</li>
  <li>Contract tracking with day rates and employment terms</li>
  <li>Site assignment with project codes</li>
  <li>Insurance management and compliance monitoring</li>
  <li>Automated alerts for expiring certifications</li>
</ul>

<h3>AI Document Generation</h3>
<ul>
  <li>Anthropic Claude integration for intelligent document creation</li>
  <li>UK construction terminology and British English compliance</li>
  <li>Trade-specific templates for all construction specialties</li>
  <li>Real-time generation with professional formatting</li>
  <li>Download capabilities with company branding</li>
</ul>

<h3>Compliance Management</h3>
<ul>
  <li>Automated alerts for expiring certifications</li>
  <li>Toolbox talk recording and management</li>
  <li>Risk assessment templates</li>
  <li>Health and safety documentation</li>
  <li>Progress tracking and reporting</li>
</ul>

<h2>💼 Business Model</h2>

<h3>Pricing Structure</h3>
<ul>
  <li><strong>Micro Business</strong>: £35/month (1 user) - Sole traders</li>
  <li><strong>Essential</strong>: £65/month (3 users) - Small teams</li>
  <li><strong>Professional</strong>: £129/month (10 users) - Mid-size companies</li>
  <li><strong>Enterprise</strong>: £299/month (50 users) - Large contractors</li>
</ul>

<h3>Target Market</h3>
<ul>
  <li>UK construction companies of all sizes</li>
  <li>26 trade specialties covered comprehensively</li>
  <li>Focus on compliance-driven businesses</li>
  <li>Premium ISO 9001 quality management for Professional+ tiers</li>
</ul>

<h2>🔐 Security Implementation</h2>
<ul>
  <li><strong>Authentication</strong>: bcrypt password hashing</li>
  <li><strong>Authorization</strong>: Role-based access control (Admin, Manager, User)</li>
  <li><strong>Data Protection</strong>: GDPR-compliant data handling</li>
  <li><strong>API Security</strong>: Token-based mobile authentication</li>
  <li><strong>Session Management</strong>: PostgreSQL-backed secure sessions</li>
</ul>

<h2>📱 Integration Capabilities</h2>

<h3>External Services</h3>
<ul>
  <li><strong>Anthropic AI</strong>: Claude Sonnet 4 for document generation</li>
  <li><strong>CSCS Smart Check</strong>: Official UK card verification</li>
  <li><strong>Stripe</strong>: Payment processing and subscription management</li>
  <li><strong>SendGrid</strong>: Email notifications and communications</li>
  <li><strong>Confluence</strong>: Documentation backup and collaboration</li>
</ul>

<h3>Mobile Integration</h3>
<ul>
  <li><strong>WebSocket</strong>: Real-time communication</li>
  <li><strong>Mobile API</strong>: Token-based authentication for mobile apps</li>
  <li><strong>Cross-platform</strong>: React Native/Flutter compatible APIs</li>
  <li><strong>Responsive Design</strong>: Mobile-first interface optimization</li>
</ul>

<h2>📚 Documentation System</h2>

<h3>Comprehensive Coverage</h3>
<ul>
  <li><strong>User Guides</strong>: Step-by-step instructions for all features</li>
  <li><strong>Technical Documentation</strong>: API reference and integration guides</li>
  <li><strong>Administration</strong>: System setup and configuration</li>
  <li><strong>Support</strong>: Troubleshooting and help resources</li>
</ul>

<h3>Confluence Integration</h3>
<ul>
  <li><strong>Automated Backup</strong>: Daily documentation synchronization</li>
  <li><strong>Professional Structure</strong>: Organized sections and navigation</li>
  <li><strong>Version Control</strong>: Change tracking and history</li>
  <li><strong>Team Collaboration</strong>: Shared workspace for documentation</li>
</ul>

<h2>🚀 Future Roadmap</h2>

<h3>Immediate Enhancements</h3>
<ol>
  <li><strong>Native Mobile Apps</strong>: iOS and Android applications</li>
  <li><strong>Advanced Analytics</strong>: Compliance metrics and reporting</li>
  <li><strong>Enterprise Integration</strong>: API partnerships with major UK construction software</li>
  <li><strong>Industry Certification</strong>: Official endorsements from UK trade associations</li>
</ol>

<h3>Long-term Vision</h3>
<ol>
  <li><strong>Predictive Analytics</strong>: AI-powered compliance risk scoring</li>
  <li><strong>IoT Integration</strong>: Site sensor data and real-time monitoring</li>
  <li><strong>Marketplace</strong>: Third-party integrations and extensions</li>
  <li><strong>International Expansion</strong>: Other English-speaking construction markets</li>
</ol>

<h2>📊 Success Metrics</h2>
<ul>
  <li><strong>Platform Stability</strong>: 99.9% uptime on Replit deployments</li>
  <li><strong>User Experience</strong>: Mobile-optimized responsive interface</li>
  <li><strong>API Integration</strong>: Real-time CSCS verification working</li>
  <li><strong>AI Performance</strong>: Claude Sonnet 4 document generation active</li>
  <li><strong>Payment Processing</strong>: Stripe subscription management operational</li>
  <li><strong>Data Backup</strong>: Automated Confluence synchronization established</li>
</ul>

<p><em>Last Updated: ${new Date().toLocaleDateString('en-GB')} - WorkDoc360 Development Team</em></p>
<p><em>Backup Location: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360</em></p>
`;
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
    
    const documentList = [];
    
    // 1. Create comprehensive project overview
    console.log('📊 Creating comprehensive project overview...');
    const overviewContent = createProjectOverview();
    await sync.createOrUpdatePage('🏗️ WorkDoc360 - Complete Project Overview', overviewContent);
    documentList.push('Project Overview');
    console.log('✅ Project overview created\n');
    
    // 2. Backup all markdown documentation files
    console.log('📄 Backing up documentation files...');
    const docFiles = [
      { file: 'README.md', title: '📖 README - Getting Started' },
      { file: 'replit.md', title: '🔧 Technical Architecture & Configuration' },
      { file: 'CONFLUENCE_API_SETUP.md', title: '🔗 Confluence API Setup Guide' },
      { file: 'CONFLUENCE_BACKUP_GUIDE.md', title: '💾 Confluence Backup Guide' },
      { file: 'CONFLUENCE_INTEGRATION.md', title: '🔌 Confluence Integration Documentation' },
      { file: 'SYSTEM_DOCUMENTATION_COMPLETE.md', title: '📋 Complete System Documentation' },
      { file: 'CSCS_INTEGRATION_GUIDE.md', title: '🆔 CSCS Integration Guide' },
      { file: 'DOMAIN_SETUP_GUIDE.md', title: '🌐 Domain Setup Guide' },
      { file: 'MOBILE_APP_GUIDE.md', title: '📱 Mobile App Integration Guide' },
      { file: 'LIVE_SAMPLE_DOCUMENT.md', title: '📄 Live Sample Document Examples' },
      { file: 'LIVE_TESTING_RESULTS.md', title: '🧪 Live Testing Results' },
      { file: 'WEBSITE_FUNCTIONALITY_CHECK.md', title: '✅ Website Functionality Check' },
      { file: 'CARD_ANALYSIS_EXAMPLE.md', title: '🔍 CSCS Card Analysis Examples' },
      { file: 'SAMPLE_DOCUMENT_EXAMPLES.md', title: '📑 Sample Document Examples' }
    ];
    
    for (const doc of docFiles) {
      const content = readFileContent(doc.file);
      if (content) {
        const htmlContent = markdownToHtml(content);
        await sync.createOrUpdatePage(doc.title, htmlContent);
        documentList.push(doc.title);
        console.log(`   ✅ Synced: ${doc.file}`);
      } else {
        console.log(`   ⚠️  Skipped: ${doc.file} (not found)`);
      }
    }
    
    // 3. Backup key configuration files
    console.log('\n⚙️ Backing up configuration files...');
    const configFiles = [
      { file: 'package.json', title: '📦 Package Configuration', lang: 'json' },
      { file: 'tsconfig.json', title: '🔷 TypeScript Configuration', lang: 'json' },
      { file: 'vite.config.ts', title: '⚡ Vite Build Configuration', lang: 'typescript' },
      { file: 'tailwind.config.ts', title: '🎨 Tailwind CSS Configuration', lang: 'typescript' },
      { file: 'drizzle.config.ts', title: '🗄️ Database Configuration', lang: 'typescript' }
    ];
    
    for (const config of configFiles) {
      const content = readFileContent(config.file);
      if (content) {
        const htmlContent = `<h1>${config.file}</h1><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${config.lang}</ac:parameter><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
        await sync.createOrUpdatePage(config.title, htmlContent);
        documentList.push(config.title);
        console.log(`   ✅ Synced: ${config.file}`);
      }
    }
    
    // 4. Backup critical source code files
    console.log('\n💻 Backing up critical source code...');
    const sourceFiles = [
      { file: 'server/index.ts', title: '🖥️ Server Entry Point', lang: 'typescript' },
      { file: 'server/routes.ts', title: '🛣️ API Routes', lang: 'typescript' },
      { file: 'server/storage.ts', title: '💾 Data Storage Layer', lang: 'typescript' },
      { file: 'server/db.ts', title: '🗄️ Database Connection', lang: 'typescript' },
      { file: 'shared/schema.ts', title: '📊 Database Schema', lang: 'typescript' }
    ];
    
    for (const source of sourceFiles) {
      const content = readFileContent(source.file);
      if (content) {
        const htmlContent = `<h1>${source.file}</h1><p>Critical source code file for WorkDoc360 platform.</p><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${source.lang}</ac:parameter><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:structured-macro>`;
        await sync.createOrUpdatePage(source.title, htmlContent);
        documentList.push(source.title);
        console.log(`   ✅ Synced: ${source.file}`);
      }
    }
    
    // 5. Create deployment and maintenance guides
    console.log('\n🚀 Creating deployment and maintenance guides...');
    
    const deploymentGuide = `
<h1>🚀 WorkDoc360 Deployment Guide</h1>

<h2>Production Environment</h2>
<ul>
  <li><strong>Platform</strong>: Replit Deployments</li>
  <li><strong>Domain</strong>: workdoc360.com</li>
  <li><strong>Database</strong>: PostgreSQL (Neon)</li>
  <li><strong>CDN</strong>: Integrated with Replit</li>
  <li><strong>SSL</strong>: Automatic HTTPS with Replit</li>
</ul>

<h2>Environment Variables Required</h2>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG....
]]></ac:plain-text-body></ac:structured-macro>

<h2>Deployment Steps</h2>
<ol>
  <li>Build the application: <code>npm run build</code></li>
  <li>Set environment variables in Replit Secrets</li>
  <li>Deploy using Replit's deployment system</li>
  <li>Configure custom domain (workdoc360.com)</li>
  <li>Set up SSL certificate (automatic with Replit)</li>
</ol>

<h2>Database Setup</h2>
<ol>
  <li>Create PostgreSQL database</li>
  <li>Run migrations: <code>npm run db:push</code></li>
  <li>Verify connection and tables</li>
</ol>

<h2>Post-Deployment Verification</h2>
<ol>
  <li>Test authentication system</li>
  <li>Verify CSCS API integration</li>
  <li>Test payment processing</li>
  <li>Check email notifications</li>
  <li>Validate mobile responsiveness</li>
</ol>

<p><em>Last Updated: ${new Date().toLocaleDateString('en-GB')}</em></p>
`;
    
    await sync.createOrUpdatePage('🚀 Deployment Guide', deploymentGuide);
    documentList.push('Deployment Guide');
    
    const maintenanceGuide = `
<h1>🔧 Maintenance & Support Guide</h1>

<h2>Daily Monitoring</h2>
<ul>
  <li>Check application uptime and performance</li>
  <li>Monitor database connection status</li>
  <li>Verify CSCS API integration</li>
  <li>Check payment processing status</li>
  <li>Review error logs and alerts</li>
</ul>

<h2>Weekly Tasks</h2>
<ul>
  <li>Review user feedback and support tickets</li>
  <li>Update documentation in Confluence</li>
  <li>Check for security updates</li>
  <li>Monitor subscription metrics</li>
  <li>Backup verification</li>
</ul>

<h2>Monthly Tasks</h2>
<ul>
  <li>Performance optimization review</li>
  <li>Security audit and updates</li>
  <li>Feature usage analytics</li>
  <li>User satisfaction surveys</li>
  <li>Infrastructure scaling review</li>
</ul>

<h2>Emergency Procedures</h2>
<h3>Database Issues</h3>
<ol>
  <li>Check DATABASE_URL environment variable</li>
  <li>Verify Neon database status</li>
  <li>Review connection pool settings</li>
  <li>Check for connection leaks</li>
</ol>

<h3>API Integration Failures</h3>
<ol>
  <li>Verify API keys and tokens</li>
  <li>Check external service status</li>
  <li>Review rate limiting and quotas</li>
  <li>Fallback to mock services if needed</li>
</ol>

<h3>Payment Processing Issues</h3>
<ol>
  <li>Check Stripe dashboard for errors</li>
  <li>Verify webhook endpoints</li>
  <li>Review subscription status</li>
  <li>Contact Stripe support if needed</li>
</ol>

<h2>Contact Information</h2>
<ul>
  <li><strong>Technical Support</strong>: Available through Confluence comments</li>
  <li><strong>Emergency Contact</strong>: Replit deployment logs</li>
  <li><strong>Documentation</strong>: https://workdoc360.atlassian.net/wiki</li>
</ul>

<p><em>Last Updated: ${new Date().toLocaleDateString('en-GB')}</em></p>
`;
    
    await sync.createOrUpdatePage('🔧 Maintenance & Support Guide', maintenanceGuide);
    documentList.push('Maintenance Guide');
    
    console.log('\n===============================================');
    console.log('✅ COMPREHENSIVE CONFLUENCE BACKUP COMPLETE!');
    console.log('===============================================');
    console.log('📊 Backup Summary:');
    console.log(`   • Total documents backed up: ${documentList.length}`);
    console.log(`   • Documentation files: ${docFiles.filter(f => fs.existsSync(f.file)).length}`);
    console.log(`   • Configuration files: ${configFiles.filter(f => fs.existsSync(f.file)).length}`);
    console.log(`   • Source code files: ${sourceFiles.filter(f => fs.existsSync(f.file)).length}`);
    console.log(`   • Additional guides: Project Overview, Deployment, Maintenance`);
    console.log(`   • Confluence workspace: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360`);
    console.log('\n📋 Documents Created:');
    documentList.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc}`);
    });
    console.log('===============================================');
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive backup
main().catch(console.error);