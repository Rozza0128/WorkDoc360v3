// Confluence Configuration for WorkDoc360
const config = {
  // Confluence Instance Details
  // These must be provided via environment variables for security
  baseUrl: process.env.CONFLUENCE_URL,
  auth: process.env.CONFLUENCE_AUTH, // Format: email:api_token
  spaceKey: process.env.CONFLUENCE_SPACE,
  
  // Documentation File Mappings
  documentMappings: [
    {
      file: 'README.md',
      title: 'WorkDoc360 Platform Overview',
      parentTitle: 'System Overview',
      description: 'Main project overview and quick start guide'
    },
    {
      file: 'replit.md',
      title: 'Technical Architecture and Preferences',
      parentTitle: 'Technical Documentation',
      description: 'Complete system architecture and user preferences'
    },
    {
      file: 'CONFLUENCE_BACKUP_GUIDE.md',
      title: 'System Backup and Recovery Procedures',
      parentTitle: 'Administration',
      description: 'Comprehensive backup and disaster recovery guide'
    },
    {
      file: 'CONFLUENCE_INTEGRATION.md',
      title: 'Confluence Integration Setup',
      parentTitle: 'Administration',
      description: 'Step-by-step Confluence integration guide'
    },
    {
      file: 'SYSTEM_DOCUMENTATION_COMPLETE.md',
      title: 'Complete Documentation Package',
      parentTitle: 'System Overview',
      description: 'Master documentation index and overview'
    },
    {
      file: 'CSCS_INTEGRATION_GUIDE.md',
      title: 'CSCS Card Verification System',
      parentTitle: 'CSCS System',
      description: 'RPA-based CSCS card verification implementation'
    },
    {
      file: 'DOMAIN_SETUP_GUIDE.md',
      title: 'Production Deployment Guide',
      parentTitle: 'Getting Started',
      description: 'Domain setup and production deployment procedures'
    },
    {
      file: 'MOBILE_APP_GUIDE.md',
      title: 'Mobile Application Integration',
      parentTitle: 'Technical Documentation',
      description: 'Mobile app development and API integration'
    },
    {
      file: 'LIVE_SAMPLE_DOCUMENT.md',
      title: 'AI Document Generation Examples',
      parentTitle: 'AI Document Generation',
      description: 'Sample documents and generation workflows'
    },
    {
      file: 'LIVE_TESTING_RESULTS.md',
      title: 'Testing and Validation Results',
      parentTitle: 'Technical Documentation',
      description: 'System testing procedures and results'
    },
    {
      file: 'WEBSITE_FUNCTIONALITY_CHECK.md',
      title: 'Quality Assurance Procedures',
      parentTitle: 'Administration',
      description: 'QA testing and functionality verification'
    }
  ],
  
  // Page Structure Configuration
  pageStructure: {
    root: 'WorkDoc360 Documentation',
    sections: [
      {
        name: 'System Overview',
        description: 'High-level system information and business context',
        icon: '📋',
        subsections: [
          'Architecture Overview',
          'Technology Stack', 
          'Security Model',
          'Business Value',
          'Complete Documentation Package'
        ]
      },
      {
        name: 'Getting Started',
        description: 'Installation, setup, and quick start guides',
        icon: '🚀',
        subsections: [
          'Installation Guide',
          'Quick Start Tutorial',
          'Environment Setup',
          'First Company Setup',
          'Production Deployment Guide'
        ]
      },
      {
        name: 'User Guides',
        description: 'End-user documentation and workflows',
        icon: '👥',
        subsections: [
          'Dashboard Navigation',
          'Company Management',
          'CSCS Card Verification',
          'Personnel Management',
          'Document Generation',
          'Compliance Tracking'
        ]
      },
      {
        name: 'Technical Documentation',
        description: 'Developer and technical implementation guides',
        icon: '🔧',
        subsections: [
          'API Reference',
          'Database Schema',
          'Frontend Architecture',
          'Backend Services',
          'Integration Guides',
          'Technical Architecture and Preferences',
          'Mobile Application Integration',
          'Testing and Validation Results'
        ]
      },
      {
        name: 'CSCS System',
        description: 'CSCS card verification and personnel management',
        icon: '🏗️',
        subsections: [
          'RPA Photo Extraction',
          'Card Validation Process',
          'Personnel Records',
          'Workforce Management',
          'CSCS Card Verification System'
        ]
      },
      {
        name: 'AI Document Generation',
        description: 'AI-powered document creation and templates',
        icon: '🤖',
        subsections: [
          'Claude Integration',
          'Document Templates',
          'Generation Workflows',
          'UK Compliance Rules',
          'AI Document Generation Examples'
        ]
      },
      {
        name: 'Administration',
        description: 'System administration and maintenance',
        icon: '🔐',
        subsections: [
          'User Management',
          'Security Configuration',
          'Backup Procedures',
          'System Monitoring',
          'System Backup and Recovery Procedures',
          'Confluence Integration Setup',
          'Quality Assurance Procedures'
        ]
      },
      {
        name: 'Support',
        description: 'Help, troubleshooting, and contact information',
        icon: '🆘',
        subsections: [
          'Troubleshooting',
          'FAQ',
          'Contact Information',
          'Change Log'
        ]
      }
    ]
  },
  
  // Sync Configuration
  syncOptions: {
    autoSync: true,
    syncFrequency: 'daily', // daily, weekly, manual
    retryAttempts: 3,
    timeoutMs: 30000,
    preservePageIds: true,
    addTimestamp: true,
    createTOC: true
  },
  
  // Content Processing Options
  contentProcessing: {
    markdownToConfluence: true,
    preserveCodeBlocks: true,
    convertTables: true,
    processImages: true,
    addBacklinks: true,
    generateTOC: true
  },
  
  // Notification Settings
  notifications: {
    enableSlack: false,
    slackWebhook: '',
    enableEmail: true,
    emailRecipients: ['admin@workdoc360.com'],
    includeChangesSummary: true
  }
};

export default config;