import ConfluenceSync from './confluence-sync.js';

// Test configuration
const testConfig = {
  baseUrl: process.env.CONFLUENCE_URL || 'https://workdoc360.atlassian.net/wiki',
  auth: process.env.CONFLUENCE_AUTH || 'paulroscoe14@gmail.com:ATATT3xFfGF0pjwMlNOAuj2ffZCUvUAYm3zc8AifFI0XTso3tEvEJZV64klPlQKt_UVqrzUBEZoEugS5fOBLDKUHx5v5cBN6jEnk5S8gjpYFz-DNIFDC2_l3O6tppx7dyfn37zdZRMVT2wMUuhjyXtIGAHQ9DZMw2pIRqrWBR9hM1v38C3TXJkI=515795FA',
  spaceKey: process.env.CONFLUENCE_SPACE || 'WORKDOC360'
};

async function testConnection() {
  console.log('🧪 Testing Confluence API Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Base URL: ${testConfig.baseUrl}`);
  console.log(`  Space Key: ${testConfig.spaceKey}`);
  console.log(`  Auth: ${testConfig.auth.split(':')[0]}:***\n`);
  
  const sync = new ConfluenceSync(testConfig);
  
  try {
    console.log('🔗 Testing connection...');
    const space = await sync.testConnection();
    console.log('✅ Connection successful!');
    console.log(`   Space Name: ${space.name}`);
    console.log(`   Space Key: ${space.key}`);
    console.log(`   Space Type: ${space.type}\n`);
    
    console.log('📄 Testing page creation...');
    const testPage = await sync.createOrUpdatePage(
      'Test Page - WorkDoc360',
      '<h1>Test Page</h1><p>This is a test page created by the WorkDoc360 sync system.</p><p>Created at: ' + new Date().toISOString() + '</p>'
    );
    console.log('✅ Test page created successfully!');
    console.log(`   Page ID: ${testPage.id}`);
    console.log(`   Page URL: ${testConfig.baseUrl}/pages/viewpage.action?pageId=${testPage.id}\n`);
    
    console.log('🎉 All tests passed! Confluence integration is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('\nError details:');
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.statusText}`);
      if (error.response.data) {
        console.error(`  Data:`, error.response.data);
      }
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your Confluence URL is correct');
    console.log('2. Check your email and API token');
    console.log('3. Ensure the space key exists and you have access');
    console.log('4. Verify your account has permission to create pages');
    
    process.exit(1);
  }
}

testConnection();