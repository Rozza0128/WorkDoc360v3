#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ConfluenceSync from './confluence-sync.js';
import config from './confluence-config.js';

/**
 * Convert markdown to proper Confluence Storage Format with rich formatting
 */
function markdownToConfluenceStorage(content, title, description) {
  if (!content || content.trim() === '') {
    return `<p>No content available for this document.</p>`;
  }

  let confluenceContent = content
    // Convert code blocks to Confluence code macro
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<ac:structured-macro ac:name="code" ac:schema-version="1">
<ac:parameter ac:name="language">${language}</ac:parameter>
<ac:parameter ac:name="theme">RDark</ac:parameter>
<ac:parameter ac:name="linenumbers">true</ac:parameter>
<ac:plain-text-body><![CDATA[${code.trim()}]]></ac:plain-text-body>
</ac:structured-macro>`;
    })
    // Convert headers
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Convert bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Convert links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Convert lists
    .replace(/^(\s*)[-*+] (.+)$/gm, (match, indent, text) => {
      const level = Math.floor(indent.length / 2) + 1;
      return `<li>${text}</li>`;
    })
    .replace(/^(\s*)(\d+)\. (.+)$/gm, (match, indent, num, text) => {
      return `<li>${text}</li>`;
    })
    // Convert tables
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
      return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    })
    // Convert horizontal rules
    .replace(/^---+$/gm, '<hr/>')
    // Convert line breaks and paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap in paragraphs
  confluenceContent = `<p>${confluenceContent}</p>`;

  // Clean up structure
  confluenceContent = confluenceContent
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<ac:structured-macro.*?<\/ac:structured-macro>)<\/p>/g, '$1')
    .replace(/<p>(<hr\/>)<\/p>/g, '$1')
    .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '');

  return confluenceContent;
}

/**
 * Create a comprehensive project overview page
 */
function createProjectOverviewPage() {
  return `
<ac:structured-macro ac:name="panel" ac:schema-version="1">
<ac:parameter ac:name="bgColor">#E3FCEF</ac:parameter>
<ac:parameter ac:name="titleBGColor">#00875A</ac:parameter>
<ac:parameter ac:name="titleColor">#FFFFFF</ac:parameter>
<ac:parameter ac:name="title">🏗️ WorkDoc360 - Professional Construction Compliance Platform</ac:parameter>
<ac:rich-text-body>
<p><strong>Production System:</strong> <a href="https://workdoc360.com">https://workdoc360.com</a></p>
<p><strong>Status:</strong> <ac:structured-macro ac:name="status" ac:schema-version="1"><ac:parameter ac:name="colour">Green</ac:parameter><ac:parameter ac:name="title">LIVE &amp; OPERATIONAL</ac:parameter></ac:structured-macro></p>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-GB', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}</p>
<p><strong>Documentation Status:</strong> <ac:structured-macro ac:name="status" ac:schema-version="1"><ac:parameter ac:name="colour">Blue</ac:parameter><ac:parameter ac:name="title">COMPLETE</ac:parameter></ac:structured-macro></p>
</ac:rich-text-body>
</ac:structured-macro>

<h2>🎯 Executive Summary</h2>

<p>WorkDoc360 is a comprehensive AI-powered construction compliance management platform specifically designed for the UK construction industry. The system combines real-time CSCS card verification using official UK Smart Check API, comprehensive personnel management for all employment types, and intelligent AI-driven document generation to provide complete compliance solutions.</p>

<ac:structured-macro ac:name="expand" ac:schema-version="1">
<ac:parameter ac:name="title">🔧 Core Technology Stack</ac:parameter>
<ac:rich-text-body>
<table>
<tbody>
<tr>
<th>Component</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React 18, TypeScript, Vite, TailwindCSS</td>
<td>Modern, responsive user interface</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Node.js, Express, TypeScript</td>
<td>High-performance API server</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>PostgreSQL with Drizzle ORM</td>
<td>Scalable data storage and management</td>
</tr>
<tr>
<td><strong>AI Integration</strong></td>
<td>Anthropic Claude Sonnet 4</td>
<td>Intelligent document generation</td>
</tr>
<tr>
<td><strong>Authentication</strong></td>
<td>Native email/password with bcrypt</td>
<td>Secure user management</td>
</tr>
<tr>
<td><strong>Deployment</strong></td>
<td>Replit Deployments</td>
<td>Cloud hosting and scaling</td>
</tr>
</tbody>
</table>
</ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="expand" ac:schema-version="1">
<ac:parameter ac:name="title">🏆 Key Business Features</ac:parameter>
<ac:rich-text-body>
<h3>CSCS Card Verification System</h3>
<ul>
<li>Real-time verification using official UK CSCS Smart Check API</li>
<li>Support for all 12 CSCS card types (Green, Red, Blue, Gold, Black, White)</li>
<li>Photo extraction and validation using RPA technology</li>
<li>Fraud detection and expired card identification</li>
<li>Integration with 2.3+ million card database across 38 schemes</li>
</ul>

<h3>AI-Powered Document Generation</h3>
<ul>
<li>Anthropic Claude Sonnet 4 integration for intelligent document creation</li>
<li>UK construction compliance terminology and standards</li>
<li>Trade-specific customization for 26+ construction specialties</li>
<li>Professional document formatting and export capabilities</li>
<li>Real-time progress tracking and status updates</li>
</ul>

<h3>Comprehensive Personnel Management</h3>
<ul>
<li>Support for all employment types (PAYE, CIS, Umbrella, Agency, Self-employed)</li>
<li>Contract and rate management with detailed tracking</li>
<li>Site assignment and project allocation</li>
<li>Insurance and compliance monitoring with automated alerts</li>
<li>Multi-company support with role-based access control</li>
</ul>

<h3>Mobile-Optimized Interface</h3>
<ul>
<li>Fully responsive design for construction site use</li>
<li>Touch-friendly controls and navigation</li>
<li>Offline capability for remote site operations</li>
<li>Cross-platform API for mobile app integration</li>
<li>Real-time synchronization with cloud database</li>
</ul>
</ac:rich-text-body>
</ac:structured-macro>

<h2>📊 System Architecture Overview</h2>

<ac:structured-macro ac:name="info" ac:schema-version="1">
<ac:parameter ac:name="title">Architecture Highlights</ac:parameter>
<ac:rich-text-body>
<p>The WorkDoc360 platform follows modern full-stack architecture principles with clear separation of concerns, scalable database design, and comprehensive security implementation. The system is designed for multi-tenant use with company-level data isolation and role-based access control.</p>
</ac:rich-text-body>
</ac:structured-macro>

<h3>Frontend Architecture</h3>
<ul>
<li><strong>Component Structure:</strong> Modular React components with TypeScript interfaces</li>
<li><strong>State Management:</strong> TanStack Query for server state, React hooks for local state</li>
<li><strong>Routing:</strong> Wouter for lightweight client-side routing</li>
<li><strong>UI Framework:</strong> shadcn/ui components with Radix UI primitives</li>
<li><strong>Styling:</strong> Tailwind CSS with construction industry theming</li>
</ul>

<h3>Backend Services</h3>
<ul>
<li><strong>API Design:</strong> RESTful endpoints with proper HTTP methods and status codes</li>
<li><strong>Database Layer:</strong> Drizzle ORM with type-safe queries and migrations</li>
<li><strong>Authentication:</strong> Session-based web auth and token-based mobile auth</li>
<li><strong>External Integrations:</strong> CSCS Smart Check API, Anthropic AI, SendGrid, Stripe</li>
<li><strong>Security:</strong> Input validation, SQL injection prevention, secure session management</li>
</ul>

<h2>📋 Documentation Structure</h2>

<p>This comprehensive documentation package includes all technical documentation, implementation guides, testing procedures, and operational manuals required for understanding, deploying, maintaining, and extending the WorkDoc360 platform.</p>

<ac:structured-macro ac:name="children" ac:schema-version="2">
<ac:parameter ac:name="all">true</ac:parameter>
<ac:parameter ac:name="sort">creation</ac:parameter>
<ac:parameter ac:name="style">h3</ac:parameter>
<ac:parameter ac:name="excerpt">true</ac:parameter>
</ac:structured-macro>

<hr/>

<ac:structured-macro ac:name="note" ac:schema-version="1">
<ac:parameter ac:name="title">Professional Documentation</ac:parameter>
<ac:rich-text-body>
<p>This documentation is maintained as part of the WorkDoc360 development process and is automatically synchronized from the development environment to ensure accuracy and completeness. All technical specifications, implementation details, and operational procedures are current and actively maintained.</p>
</ac:rich-text-body>
</ac:structured-macro>

<p><em>WorkDoc360 Development Team - Professional Construction Compliance Platform</em><br/>
<em>Documentation Hub Created: ${new Date().toLocaleDateString('en-GB', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}</em></p>
`;
}

/**
 * Create enhanced document pages with proper Confluence formatting
 */
async function createEnhancedDocumentation() {
  console.log('🚀 Creating Premium Confluence Documentation with Professional Formatting...\n');
  
  const sync = new ConfluenceSync(config);
  
  try {
    // Test connection
    console.log('🔗 Testing Confluence connection...');
    await sync.testConnection();
    console.log('✅ Connection verified\n');
    
    // Create main documentation hub
    console.log('📋 Creating comprehensive documentation hub...');
    const hubContent = createProjectOverviewPage();
    await sync.createOrUpdatePage('WorkDoc360 - Professional Documentation Hub', hubContent);
    console.log('✅ Professional documentation hub created\n');
    
    // Enhanced documentation files with comprehensive formatting
    const documentationFiles = [
      {
        file: '../README.md',
        title: 'Project Overview & Installation Guide',
        description: 'Complete project overview, installation instructions, API integration guides, and quick start procedures for the WorkDoc360 platform.',
        category: 'Getting Started'
      },
      {
        file: '../replit.md',
        title: 'Technical Architecture & Development Configuration',
        description: 'Comprehensive technical architecture documentation, technology stack details, development history, and system configuration specifications.',
        category: 'Technical Documentation'
      },
      {
        file: '../SYSTEM_DOCUMENTATION_COMPLETE.md',
        title: 'Complete System Documentation Package',
        description: 'Comprehensive documentation package including installation procedures, business processes, technical implementation guides, and operational procedures.',
        category: 'System Documentation'
      },
      {
        file: '../CONFLUENCE_INTEGRATION.md',
        title: 'Confluence Integration & API Documentation',
        description: 'Complete Confluence API integration setup, configuration procedures, automated backup implementation, and synchronization workflows.',
        category: 'Integration Guides'
      },
      {
        file: '../CONFLUENCE_API_SETUP.md',
        title: 'Confluence API Setup & Configuration Guide',
        description: 'Step-by-step guide for setting up Confluence API integration, obtaining credentials, configuring automated backups, and troubleshooting procedures.',
        category: 'Integration Guides'
      },
      {
        file: '../CONFLUENCE_BACKUP_GUIDE.md',
        title: 'Backup & Recovery Procedures',
        description: 'Comprehensive backup procedures, disaster recovery protocols, data protection strategies, and automated synchronization setup.',
        category: 'Operations'
      },
      {
        file: '../CSCS_INTEGRATION_GUIDE.md',
        title: 'CSCS Card Verification System Implementation',
        description: 'Complete implementation guide for CSCS Smart Check API integration, card verification workflows, personnel management, and compliance tracking.',
        category: 'Feature Implementation'
      },
      {
        file: '../MOBILE_APP_GUIDE.md',
        title: 'Mobile Application Integration Guide',
        description: 'Comprehensive mobile API integration guide, cross-platform compatibility documentation, and mobile-first design implementation procedures.',
        category: 'Mobile Development'
      },
      {
        file: '../DOMAIN_SETUP_GUIDE.md',
        title: 'Production Deployment & Domain Configuration',
        description: 'Production deployment procedures, domain setup and configuration, SSL certificate management, and DNS configuration guides.',
        category: 'Deployment'
      },
      {
        file: '../LIVE_TESTING_RESULTS.md',
        title: 'System Testing & Quality Assurance Results',
        description: 'Comprehensive testing results, validation procedures, quality assurance protocols, and system performance analysis.',
        category: 'Quality Assurance'
      },
      {
        file: '../WEBSITE_FUNCTIONALITY_CHECK.md',
        title: 'Website Functionality & Performance Validation',
        description: 'Quality assurance checklists, functionality validation procedures, performance testing results, and system monitoring protocols.',
        category: 'Quality Assurance'
      },
      {
        file: '../LIVE_SAMPLE_DOCUMENT.md',
        title: 'AI Document Generation Examples & Templates',
        description: 'Real-world examples of AI-generated compliance documents, template demonstrations, UK construction compliance examples with full formatting.',
        category: 'Document Examples'
      },
      {
        file: '../SAMPLE_DOCUMENT_EXAMPLES.md',
        title: 'Document Templates & Generation Examples',
        description: 'Comprehensive collection of document templates, generated examples, compliance documentation samples, and formatting demonstrations.',
        category: 'Document Examples'
      },
      {
        file: '../CARD_ANALYSIS_EXAMPLE.md',
        title: 'CSCS Card Analysis & Verification Examples',
        description: 'CSCS card verification examples, analysis procedures, validation workflows, and fraud detection demonstrations.',
        category: 'Feature Examples'
      }
    ];

    console.log('📄 Creating enhanced documentation pages with professional formatting...\n');
    
    for (let i = 0; i < documentationFiles.length; i++) {
      const doc = documentationFiles[i];
      
      if (fs.existsSync(doc.file)) {
        console.log(`   📝 Processing (${i + 1}/${documentationFiles.length}): ${path.basename(doc.file)}`);
        
        const rawContent = fs.readFileSync(doc.file, 'utf8');
        const confluenceContent = markdownToConfluenceStorage(rawContent, doc.title, doc.description);
        
        // Create comprehensive page with metadata and professional formatting
        const enhancedPageContent = `
<ac:structured-macro ac:name="panel" ac:schema-version="1">
<ac:parameter ac:name="bgColor">#F4F5F7</ac:parameter>
<ac:parameter ac:name="titleBGColor">#0052CC</ac:parameter>
<ac:parameter ac:name="titleColor">#FFFFFF</ac:parameter>
<ac:parameter ac:name="title">${doc.title}</ac:parameter>
<ac:rich-text-body>
<p><strong>Description:</strong> ${doc.description}</p>
<p><strong>Category:</strong> <ac:structured-macro ac:name="status" ac:schema-version="1"><ac:parameter ac:name="colour">Blue</ac:parameter><ac:parameter ac:name="title">${doc.category}</ac:parameter></ac:structured-macro></p>
<p><strong>Source File:</strong> <code>${doc.file.replace('../', '')}</code></p>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-GB', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}</p>
<p><strong>Status:</strong> <ac:structured-macro ac:name="status" ac:schema-version="1"><ac:parameter ac:name="colour">Green</ac:parameter><ac:parameter ac:name="title">ACTIVE</ac:parameter></ac:structured-macro></p>
</ac:rich-text-body>
</ac:structured-macro>

<hr/>

${confluenceContent}

<hr/>

<ac:structured-macro ac:name="warning" ac:schema-version="1">
<ac:parameter ac:name="title">Automated Documentation</ac:parameter>
<ac:rich-text-body>
<p>This documentation is automatically synchronized from the WorkDoc360 development environment. Changes made directly in Confluence will be overwritten during the next automated sync cycle. To make permanent changes, modify the source files in the development environment.</p>
</ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="info" ac:schema-version="1">
<ac:parameter ac:name="title">Professional Support</ac:parameter>
<ac:rich-text-body>
<p>This documentation is maintained as part of the WorkDoc360 development process. For technical support, implementation assistance, or additional information, contact the development team through the official channels.</p>
</ac:rich-text-body>
</ac:structured-macro>
`;

        await sync.createOrUpdatePage(doc.title, enhancedPageContent);
        console.log(`   ✅ Enhanced page created: ${doc.title}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`   ⚠️  File not found: ${path.basename(doc.file)}`);
      }
    }

    console.log('\n===============================================');
    console.log('✅ PREMIUM CONFLUENCE DOCUMENTATION COMPLETE!');
    console.log('===============================================');
    console.log('📊 Professional Documentation Features:');
    console.log('   ✅ Proper Confluence Storage Format markup');
    console.log('   ✅ Professional panels and status indicators');
    console.log('   ✅ Enhanced code blocks with syntax highlighting');
    console.log('   ✅ Structured tables and expandable sections');
    console.log('   ✅ Comprehensive metadata and categorization');
    console.log('   ✅ Professional warning and info boxes');
    console.log('   ✅ Automated child page navigation');
    console.log('   ✅ Rich formatting and visual hierarchy');
    console.log(`   ✅ ${documentationFiles.length} comprehensive documentation pages`);
    console.log('\n🔗 Access your premium documentation at:');
    console.log('   https://workdoc360.atlassian.net/wiki/spaces/WORKDOC360');
    console.log('===============================================');

  } catch (error) {
    console.error('❌ Premium documentation creation failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Execute the premium documentation creation
createEnhancedDocumentation().catch(console.error);