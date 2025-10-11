#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ConfluenceSync from './confluence-sync.js';
import config from './confluence-config.js';

/**
 * Enhanced markdown to Confluence HTML converter
 */
function enhancedMarkdownToHtml(content, filename = '') {
  if (!content) return '<p>Content not available</p>';
  
  let html = content
    // Handle code blocks first (to protect them from other replacements)
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, function(match, lang, code) {
      const language = lang || 'text';
      return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${language}</ac:parameter><ac:plain-text-body><![CDATA[${code}]]></ac:plain-text-body></ac:structured-macro>`;
    })
    // Headers with proper styling
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')  
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Inline code (after code blocks to avoid conflicts)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists - handle nested lists properly
    .replace(/^(\s*)- (.*$)/gm, function(match, indent, text) {
      const level = indent.length / 2;
      return `<li style="margin-left: ${level * 20}px">${text}</li>`;
    })
    .replace(/^(\s*)(\d+)\. (.*$)/gm, function(match, indent, num, text) {
      const level = indent.length / 2;
      return `<li style="margin-left: ${level * 20}px">${text}</li>`;
    })
    // Tables - basic table support
    .replace(/\|(.+)\|/g, function(match, content) {
      const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
      return '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    })
    // Horizontal rules
    .replace(/^---+$/gm, '<hr/>')
    // Line breaks and paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraphs and clean up
  html = '<p>' + html + '</p>';
  
  // Clean up and fix list structure
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<ac:structured-macro.*?<\/ac:structured-macro>)<\/p>/g, '$1')
    .replace(/<p>(<hr\/>)<\/p>/g, '$1')
    .replace(/(<li[^>]*>.*?<\/li>)/gs, function(match) {
      return '<ul>' + match + '</ul>';
    })
    .replace(/<\/ul>\s*<ul>/g, '');
  
  return html;
}

/**
 * Create a comprehensive project documentation page
 */
function createProjectDocumentation() {
  return `
<h1>🏗️ WorkDoc360 - Complete Project Documentation Hub</h1>

<ac:structured-macro ac:name="info">
<ac:parameter ac:name="title">Live Production System</ac:parameter>
<ac:rich-text-body>
<p><strong>Production URL:</strong> <a href="https://workdoc360.com">https://workdoc360.com</a></p>
<p><strong>Status:</strong> Live and operational</p>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
<p><strong>Confluence Backup:</strong> Automated documentation synchronization active</p>
</ac:rich-text-body>
</ac:structured-macro>

<h2>📋 Documentation Overview</h2>

<p>This comprehensive documentation hub contains all technical documentation, user guides, implementation details, and operational procedures for the WorkDoc360 construction compliance management platform.</p>

<h2>🚀 Platform Highlights</h2>

<h3>Live System Features</h3>
<ul>
  <li><strong>CSCS Card Verification</strong>: Real-time verification using official UK CSCS Smart Check API</li>
  <li><strong>AI Document Generation</strong>: Anthropic Claude Sonnet 4 integration for intelligent compliance document creation</li>
  <li><strong>Personnel Management</strong>: Comprehensive workforce tracking for all employment types</li>
  <li><strong>Mobile Optimized</strong>: Fully responsive interface optimized for construction site use</li>
  <li><strong>Multi-Company Support</strong>: Role-based access control with company-level data isolation</li>
  <li><strong>Payment Processing</strong>: Stripe integration for subscription management</li>
</ul>

<h3>Technical Architecture</h3>
<ul>
  <li><strong>Frontend</strong>: React 18 with TypeScript and TailwindCSS</li>
  <li><strong>Backend</strong>: Node.js with Express and PostgreSQL</li>
  <li><strong>Database</strong>: Neon PostgreSQL with Drizzle ORM</li>
  <li><strong>Deployment</strong>: Replit Deployments with custom domain</li>
  <li><strong>Security</strong>: Native authentication with bcrypt hashing</li>
</ul>

<h2>📚 Documentation Structure</h2>

<p>The documentation is organized into the following comprehensive sections:</p>

<ac:structured-macro ac:name="expand">
<ac:parameter ac:name="title">📖 Core Documentation Files</ac:parameter>
<ac:rich-text-body>
<ul>
  <li><strong>README Documentation</strong> - Project overview and quick start guide</li>
  <li><strong>Technical Architecture</strong> - Complete system architecture and configuration</li>
  <li><strong>System Documentation</strong> - Comprehensive technical documentation package</li>
  <li><strong>Confluence Integration</strong> - API setup and automated backup procedures</li>
  <li><strong>CSCS Integration Guide</strong> - Complete CSCS card verification implementation</li>
  <li><strong>Mobile App Guide</strong> - Mobile integration and API documentation</li>
</ul>
</ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="expand">
<ac:parameter ac:name="title">🧪 Testing & Quality Assurance</ac:parameter>
<ac:rich-text-body>
<ul>
  <li><strong>Live Testing Results</strong> - Comprehensive system testing and validation</li>
  <li><strong>Website Functionality Check</strong> - Quality assurance procedures and checklists</li>
  <li><strong>Sample Document Examples</strong> - Generated document examples and templates</li>
  <li><strong>Card Analysis Examples</strong> - CSCS card verification examples and test cases</li>
</ul>
</ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="expand">
<ac:parameter name="title">🚀 Deployment & Operations</ac:parameter>
<ac:rich-text-body>
<ul>
  <li><strong>Domain Setup Guide</strong> - Production deployment and domain configuration</li>
  <li><strong>Confluence Backup Guide</strong> - Backup procedures and disaster recovery</li>
  <li><strong>Configuration Files</strong> - Complete system configuration and setup</li>
</ul>
</ac:rich-text-body>
</ac:structured-macro>

<h2>🔗 Quick Navigation</h2>

<p>Use the navigation menu to explore specific documentation sections. Each section contains detailed technical information, implementation guides, and operational procedures.</p>

<ac:structured-macro ac:name="note">
<ac:parameter ac:name="title">Professional Support</ac:parameter>
<ac:rich-text-body>
<p>This documentation is maintained as part of the WorkDoc360 development process. All documentation is synchronized automatically from the development environment to ensure accuracy and completeness.</p>
</ac:rich-text-body>
</ac:structured-macro>

<hr/>

<p><em>WorkDoc360 Development Team - ${new Date().toLocaleDateString('en-GB')}</em></p>
`;
}

/**
 * Main backup function with enhanced formatting
 */
async function main() {
  console.log('🚀 Starting Enhanced Confluence Documentation Backup...\n');
  
  const sync = new ConfluenceSync(config);
  
  try {
    // Test connection
    console.log('🔗 Testing Confluence connection...');
    await sync.testConnection();
    console.log('✅ Connection successful!\n');
    
    const backedUpDocs = [];
    
    // 1. Create main documentation hub
    console.log('📋 Creating comprehensive documentation hub...');
    const hubContent = createProjectDocumentation();
    await sync.createOrUpdatePage('🏗️ WorkDoc360 - Documentation Hub', hubContent);
    backedUpDocs.push('Documentation Hub');
    console.log('✅ Documentation hub created\n');
    
    // 2. Enhanced backup of all documentation files
    console.log('📄 Backing up documentation with enhanced formatting...');
    const docFiles = [
      { 
        file: '../README.md', 
        title: '📖 README - Project Overview & Quick Start',
        icon: '📖',
        description: 'Complete project overview, installation guide, and quick start instructions'
      },
      { 
        file: '../replit.md', 
        title: '🔧 Technical Architecture & System Configuration',
        icon: '🔧',
        description: 'Comprehensive technical architecture, technology stack, and system configuration details'
      },
      { 
        file: '../SYSTEM_DOCUMENTATION_COMPLETE.md', 
        title: '📋 Complete System Documentation Package',
        icon: '📋',
        description: 'Comprehensive documentation package with installation, setup, and maintenance procedures'
      },
      { 
        file: '../CONFLUENCE_INTEGRATION.md', 
        title: '🔌 Confluence Integration & API Documentation',
        icon: '🔌',
        description: 'Complete Confluence API integration setup, configuration, and automation procedures'
      },
      { 
        file: '../CONFLUENCE_API_SETUP.md', 
        title: '🔗 Confluence API Setup Guide',
        icon: '🔗',
        description: 'Step-by-step guide for setting up Confluence API integration and automated backups'
      },
      { 
        file: '../CONFLUENCE_BACKUP_GUIDE.md', 
        title: '💾 Confluence Backup & Recovery Procedures',
        icon: '💾',
        description: 'Comprehensive backup procedures, disaster recovery, and data protection strategies'
      },
      { 
        file: '../CSCS_INTEGRATION_GUIDE.md', 
        title: '🆔 CSCS Card Verification System Implementation',
        icon: '🆔',
        description: 'Complete CSCS Smart Check API integration, card verification, and personnel management'
      },
      { 
        file: '../MOBILE_APP_GUIDE.md', 
        title: '📱 Mobile Application Integration Guide',
        icon: '📱',
        description: 'Mobile API integration, cross-platform compatibility, and mobile-first design implementation'
      },
      { 
        file: '../DOMAIN_SETUP_GUIDE.md', 
        title: '🌐 Production Deployment & Domain Setup',
        icon: '🌐',
        description: 'Production deployment procedures, domain configuration, and SSL setup'
      },
      { 
        file: '../LIVE_TESTING_RESULTS.md', 
        title: '🧪 Live System Testing & Validation Results',
        icon: '🧪',
        description: 'Comprehensive testing results, quality assurance procedures, and validation reports'
      },
      { 
        file: '../WEBSITE_FUNCTIONALITY_CHECK.md', 
        title: '✅ Website Functionality & Quality Assurance',
        icon: '✅',
        description: 'Quality assurance checklists, functionality validation, and performance testing'
      },
      { 
        file: '../LIVE_SAMPLE_DOCUMENT.md', 
        title: '📄 Live AI Document Generation Examples',
        icon: '📄',
        description: 'Real-world examples of AI-generated compliance documents with full formatting and content'
      },
      { 
        file: '../SAMPLE_DOCUMENT_EXAMPLES.md', 
        title: '📑 Document Templates & Examples',
        icon: '📑',
        description: 'Comprehensive collection of document templates and generated examples'
      },
      { 
        file: '../CARD_ANALYSIS_EXAMPLE.md', 
        title: '🔍 CSCS Card Analysis & Verification Examples',
        icon: '🔍',
        description: 'CSCS card verification examples, analysis procedures, and validation workflows'
      }
    ];
    
    for (const doc of docFiles) {
      if (fs.existsSync(doc.file)) {
        console.log(`   📝 Processing: ${path.basename(doc.file)}`);
        const content = fs.readFileSync(doc.file, 'utf8');
        
        // Create enhanced content with metadata
        const enhancedContent = `
${doc.icon} <h1>${doc.title.replace(/^📖\s*|^🔧\s*|^📋\s*|^🔌\s*|^🔗\s*|^💾\s*|^🆔\s*|^📱\s*|^🌐\s*|^🧪\s*|^✅\s*|^📄\s*|^📑\s*|^🔍\s*/, '')}</h1>

<ac:structured-macro ac:name="info">
<ac:parameter ac:name="title">Document Information</ac:parameter>
<ac:rich-text-body>
<p><strong>Description:</strong> ${doc.description}</p>
<p><strong>Source File:</strong> <code>${doc.file.replace('../', '')}</code></p>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
<p><strong>Status:</strong> Active and maintained</p>
</ac:rich-text-body>
</ac:structured-macro>

<hr/>

${enhancedMarkdownToHtml(content, doc.file)}

<hr/>

<ac:structured-macro ac:name="note">
<ac:parameter name="title">Automatically Generated</ac:parameter>
<ac:rich-text-body>
<p>This documentation is automatically synchronized from the WorkDoc360 development environment. Changes made directly in Confluence will be overwritten during the next sync.</p>
</ac:rich-text-body>
</ac:structured-macro>
`;
        
        await sync.createOrUpdatePage(doc.title, enhancedContent);
        backedUpDocs.push(doc.title);
        console.log(`   ✅ Enhanced backup completed: ${path.basename(doc.file)}`);
      } else {
        console.log(`   ⚠️  File not found: ${path.basename(doc.file)}`);
      }
    }
    
    // 3. Configuration files with enhanced formatting
    console.log('\n⚙️ Backing up configuration files with enhanced formatting...');
    const configFiles = [
      { 
        file: '../package.json', 
        title: '📦 Package Configuration & Dependencies',
        lang: 'json',
        description: 'Complete package dependencies, scripts, and project configuration'
      },
      { 
        file: '../tsconfig.json', 
        title: '🔷 TypeScript Configuration',
        lang: 'json',
        description: 'TypeScript compiler configuration and type checking settings'
      },
      { 
        file: '../vite.config.ts', 
        title: '⚡ Vite Build Configuration',
        lang: 'typescript',
        description: 'Vite build tool configuration for development and production'
      },
      { 
        file: '../tailwind.config.ts', 
        title: '🎨 Tailwind CSS Configuration',
        lang: 'typescript',
        description: 'Tailwind CSS framework configuration and custom styling'
      },
      { 
        file: '../drizzle.config.ts', 
        title: '🗄️ Database Configuration & ORM Settings',
        lang: 'typescript',
        description: 'Drizzle ORM configuration and database connection settings'
      }
    ];
    
    for (const config of configFiles) {
      if (fs.existsSync(config.file)) {
        const content = fs.readFileSync(config.file, 'utf8');
        
        const enhancedContent = `
<h1>${config.title}</h1>

<ac:structured-macro ac:name="info">
<ac:parameter ac:name="title">Configuration Details</ac:parameter>
<ac:rich-text-body>
<p><strong>Description:</strong> ${config.description}</p>
<p><strong>File Path:</strong> <code>${config.file.replace('../', '')}</code></p>
<p><strong>Language:</strong> ${config.lang}</p>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
</ac:rich-text-body>
</ac:structured-macro>

<h2>Configuration Content</h2>

<ac:structured-macro ac:name="code">
<ac:parameter ac:name="language">${config.lang}</ac:parameter>
<ac:parameter ac:name="title">${path.basename(config.file)}</ac:parameter>
<ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="note">
<ac:parameter ac:name="title">Important</ac:parameter>
<ac:rich-text-body>
<p>This configuration file is critical for system operation. Any changes should be thoroughly tested before deployment.</p>
</ac:rich-text-body>
</ac:structured-macro>
`;
        
        await sync.createOrUpdatePage(config.title, enhancedContent);
        backedUpDocs.push(config.title);
        console.log(`   ✅ Enhanced config backup: ${path.basename(config.file)}`);
      }
    }
    
    console.log('\n===============================================');
    console.log('✅ ENHANCED CONFLUENCE BACKUP COMPLETED!');
    console.log('===============================================');
    console.log(`📊 Enhanced Backup Summary:`);
    console.log(`   • Total documents: ${backedUpDocs.length}`);
    console.log(`   • Enhanced formatting: Professional Confluence macros`);
    console.log(`   • Metadata included: File information and descriptions`);
    console.log(`   • Code highlighting: Syntax highlighting for all code`);
    console.log(`   • Professional styling: Info boxes, notes, and expandable sections`);
    console.log(`   • Live workspace: https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360`);
    console.log('===============================================');
    
  } catch (error) {
    console.error('❌ Enhanced backup failed:', error.message);
    process.exit(1);
  }
}

// Run the enhanced backup
main().catch(console.error);