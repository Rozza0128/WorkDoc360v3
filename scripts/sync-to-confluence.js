import ConfluenceSync from './confluence-sync.js';
import config from './confluence-config.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Starting WorkDoc360 Confluence Documentation Sync...\n');
  
  // Validate configuration
  if (!config.baseUrl || !config.auth || !config.spaceKey) {
    console.error('❌ Missing required configuration. Please update confluence-config.js with:');
    console.error('   - baseUrl: Your Confluence instance URL');
    console.error('   - auth: email:api_token');
    console.error('   - spaceKey: Your Confluence space key');
    process.exit(1);
  }
  
  const sync = new ConfluenceSync(config);
  
  try {
    // Test connection first
    console.log('🔗 Testing Confluence connection...');
    await sync.testConnection();
    console.log('✅ Connection successful!\n');
    
    // Create main documentation space structure
    console.log('📋 Creating main documentation structure...');
    const mainPage = await sync.createOrUpdatePage(
      'WorkDoc360 Documentation',
      `<h1>WorkDoc360 - Construction Compliance Platform</h1>
       <p>Complete documentation for the AI-powered construction compliance management system.</p>
       <p><strong>Last Updated:</strong> ${new Date().toISOString()}</p>
       <ac:structured-macro ac:name="toc">
         <ac:parameter ac:name="printable">true</ac:parameter>
         <ac:parameter ac:name="style">disc</ac:parameter>
         <ac:parameter ac:name="maxLevel">3</ac:parameter>
       </ac:structured-macro>`
    );
    console.log(`✅ Main page created/updated: ${mainPage.title}\n`);
    
    // Create section pages
    console.log('📁 Creating documentation sections...');
    const sectionPages = {};
    for (const section of config.pageStructure.sections) {
      console.log(`   Creating section: ${section.name}`);
      sectionPages[section.name] = await sync.createOrUpdatePage(
        section.name,
        `<h1>${section.icon} ${section.name}</h1>
         <p>${section.description}</p>
         <h2>Contents</h2>
         <ul>
           ${section.subsections.map(sub => `<li>${sub}</li>`).join('')}
         </ul>`,
        mainPage.id
      );
    }
    console.log('✅ All sections created!\n');
    
    // Sync documentation files
    console.log('📄 Syncing documentation files...');
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const mapping of config.documentMappings) {
      try {
        if (fs.existsSync(mapping.file)) {
          console.log(`   📝 Syncing: ${mapping.file} → ${mapping.title}`);
          const parentId = mapping.parentTitle ? sectionPages[mapping.parentTitle]?.id : mainPage.id;
          await sync.syncMarkdownFile(mapping.file, parentId);
          syncedCount++;
        } else {
          console.warn(`   ⚠️  File not found: ${mapping.file}`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to sync ${mapping.file}:`, error.message);
        errorCount++;
      }
    }
    
    // Create API documentation pages
    console.log('\n🔧 Creating API documentation...');
    await createAPIDocumentation(sync, sectionPages['Technical Documentation']?.id);
    
    // Create user guide pages
    console.log('👥 Creating user guides...');
    await createUserGuides(sync, sectionPages['User Guides']?.id);
    
    // Summary report
    console.log('\n===============================================');
    console.log('✅ Confluence Sync Complete!');
    console.log('===============================================');
    console.log(`📊 Summary:`);
    console.log(`   • Main page: ${mainPage.title}`);
    console.log(`   • Sections created: ${Object.keys(sectionPages).length}`);
    console.log(`   • Files synced: ${syncedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Confluence URL: ${config.baseUrl}/spaces/${config.spaceKey}`);
    console.log('===============================================\n');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

async function createAPIDocumentation(sync, parentId) {
  const apiEndpoints = [
    {
      title: 'Authentication API',
      content: `<h2>Authentication Endpoints</h2>
        <h3>POST /api/login</h3>
        <p>User authentication with email and password.</p>
        <ac:structured-macro ac:name="code">
          <ac:parameter ac:name="language">json</ac:parameter>
          <ac:plain-text-body><![CDATA[
{
  "email": "user@example.com",
  "password": "securepassword"
}
          ]]></ac:plain-text-body>
        </ac:structured-macro>
        
        <h3>POST /api/register</h3>
        <p>User registration with email, password, and profile information.</p>
        
        <h3>POST /api/logout</h3>
        <p>User logout and session termination.</p>
        
        <h3>GET /api/user</h3>
        <p>Get current user profile information.</p>`
    },
    {
      title: 'Company Management API',
      content: `<h2>Company Management Endpoints</h2>
        <h3>GET /api/companies</h3>
        <p>List all companies for the authenticated user.</p>
        
        <h3>POST /api/companies</h3>
        <p>Create a new company profile.</p>
        <ac:structured-macro ac:name="code">
          <ac:parameter ac:name="language">json</ac:parameter>
          <ac:plain-text-body><![CDATA[
{
  "name": "ABC Construction Ltd",
  "tradeType": "general_building_contractor",
  "registrationNumber": "12345678",
  "postcode": "SW1A 1AA"
}
          ]]></ac:plain-text-body>
        </ac:structured-macro>
        
        <h3>GET /api/companies/:id</h3>
        <p>Get specific company details.</p>
        
        <h3>PUT /api/companies/:id</h3>
        <p>Update company information.</p>`
    },
    {
      title: 'CSCS Verification API',
      content: `<h2>CSCS Card Verification Endpoints</h2>
        <h3>POST /api/cscs/verify</h3>
        <p>Verify CSCS card using RPA photo extraction.</p>
        <ac:structured-macro ac:name="code">
          <ac:parameter ac:name="language">json</ac:parameter>
          <ac:plain-text-body><![CDATA[
{
  "cardNumber": "123456789",
  "extractPhotos": true,
  "validateOnline": true
}
          ]]></ac:plain-text-body>
        </ac:structured-macro>
        
        <h3>GET /api/personnel</h3>
        <p>List all personnel records for a company.</p>
        
        <h3>POST /api/personnel</h3>
        <p>Create new personnel record with employment details.</p>
        
        <h3>PUT /api/personnel/:id</h3>
        <p>Update personnel information and employment status.</p>`
    }
  ];

  for (const endpoint of apiEndpoints) {
    await sync.createOrUpdatePage(endpoint.title, endpoint.content, parentId);
  }
}

async function createUserGuides(sync, parentId) {
  const userGuides = [
    {
      title: 'Getting Started Guide',
      content: `<h2>Welcome to WorkDoc360</h2>
        <p>This guide will help you get started with the platform quickly.</p>
        
        <h3>Step 1: Create Your Account</h3>
        <ol>
          <li>Visit the registration page</li>
          <li>Enter your email and secure password</li>
          <li>Verify your email address</li>
          <li>Complete your profile information</li>
        </ol>
        
        <h3>Step 2: Set Up Your Company</h3>
        <ol>
          <li>Click "Create Company" on the dashboard</li>
          <li>Select your trade type from the comprehensive list</li>
          <li>Enter company registration details</li>
          <li>Configure compliance settings</li>
        </ol>
        
        <h3>Step 3: Verify CSCS Cards</h3>
        <ol>
          <li>Navigate to CSCS Verification</li>
          <li>Use the photo extraction system</li>
          <li>Review verification results</li>
          <li>Add personnel to your records</li>
        </ol>`
    },
    {
      title: 'CSCS Card Verification Guide',
      content: `<h2>CSCS Card Verification Process</h2>
        
        <ac:structured-macro ac:name="info">
          <ac:parameter ac:name="title">Prerequisites</ac:parameter>
          <ac:rich-text-body>
            <ul>
              <li>Admin or Manager role permissions</li>
              <li>Valid CSCS card number</li>
              <li>Internet connection for real-time verification</li>
            </ul>
          </ac:rich-text-body>
        </ac:structured-macro>
        
        <h3>RPA Photo Extraction</h3>
        <ol>
          <li>Enter the CSCS card number</li>
          <li>System automatically extracts photos from Smart Check</li>
          <li>Review extracted photos and card details</li>
          <li>Confirm card validity and status</li>
        </ol>
        
        <h3>Personnel Record Creation</h3>
        <ol>
          <li>Select employment type (Permanent, Temporary, Subcontractor, Agency)</li>
          <li>Enter contract details and day rates</li>
          <li>Assign to specific sites and projects</li>
          <li>Record insurance and induction information</li>
        </ol>
        
        <ac:structured-macro ac:name="warning">
          <ac:parameter ac:name="title">Important</ac:parameter>
          <ac:rich-text-body>
            <p>Always verify card authenticity and expiry dates. Expired or invalid cards must not be accepted for site work.</p>
          </ac:rich-text-body>
        </ac:structured-macro>`
    },
    {
      title: 'Personnel Management Guide',
      content: `<h2>Comprehensive Personnel Management</h2>
        
        <h3>Employment Types</h3>
        <table>
          <tr><th>Type</th><th>Description</th><th>Key Fields</th></tr>
          <tr><td>Permanent</td><td>Full-time employees</td><td>Salary, Benefits, Contract Start</td></tr>
          <tr><td>Temporary</td><td>Fixed-term contracts</td><td>Day Rate, Contract End Date</td></tr>
          <tr><td>Subcontractor</td><td>External companies</td><td>Company Details, Insurance</td></tr>
          <tr><td>Agency</td><td>Through recruitment agencies</td><td>Agency Details, Markup</td></tr>
          <tr><td>Apprentice</td><td>Training contracts</td><td>Training Provider, Qualification</td></tr>
        </table>
        
        <h3>Required Information</h3>
        <ul>
          <li>Personal details and contact information</li>
          <li>National Insurance number for payroll</li>
          <li>CSCS card number and expiry date</li>
          <li>Site-specific induction completion</li>
          <li>Insurance provider and policy details</li>
          <li>Emergency contact information</li>
        </ul>
        
        <h3>Compliance Tracking</h3>
        <ul>
          <li>Automatic alerts for expiring certifications</li>
          <li>Site assignment and project tracking</li>
          <li>Hours worked and payroll integration</li>
          <li>Health and safety training records</li>
        </ul>`
    }
  ];

  for (const guide of userGuides) {
    await sync.createOrUpdatePage(guide.title, guide.content, parentId);
  }
}

// Run the main function
main().catch(console.error);