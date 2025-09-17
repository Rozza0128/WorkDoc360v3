// Test script for new GoDaddy API credentials
const testNewGoDaddyKey = async () => {
  console.log('🧪 Testing New GoDaddy API Credentials');
  console.log('====================================');
  
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ No API credentials found');
    console.log('Please update Replit secrets with new GoDaddy credentials');
    return false;
  }
  
  console.log(`Testing with API Key: ${apiKey.substring(0, 8)}...`);
  console.log(`Secret length: ${apiSecret.length} characters`);
  
  try {
    // Step 1: Test basic authentication
    console.log('\n📡 Step 1: Testing authentication...');
    const authTest = await fetch('https://api.godaddy.com/v1/domains', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!authTest.ok) {
      const error = await authTest.text();
      console.log(`❌ Authentication failed: ${error}`);
      return false;
    }
    
    console.log('✅ Authentication successful!');
    
    // Step 2: Check domain access
    console.log('\n🏠 Step 2: Checking domain access...');
    const domains = await authTest.json();
    console.log(`Found ${domains.length} accessible domains`);
    
    const workdoc360 = domains.find(d => d.domain === 'workdoc360.com');
    if (!workdoc360) {
      console.log('❌ workdoc360.com not accessible');
      console.log('Available domains:', domains.map(d => d.domain).join(', '));
      return false;
    }
    
    console.log('✅ workdoc360.com is accessible!');
    console.log(`Domain status: ${workdoc360.status}`);
    
    // Step 3: Test DNS record creation
    console.log('\n🔧 Step 3: Testing DNS record creation...');
    const testSubdomain = `test-${Date.now()}`;
    
    const createRecord = await fetch(`https://api.godaddy.com/v1/domains/workdoc360.com/records`, {
      method: 'PATCH',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        type: 'A',
        name: testSubdomain,
        data: '34.117.33.233',
        ttl: 3600
      }])
    });
    
    if (!createRecord.ok) {
      const error = await createRecord.text();
      console.log(`❌ DNS creation failed: ${error}`);
      return false;
    }
    
    console.log(`✅ Successfully created ${testSubdomain}.workdoc360.com`);
    
    // Step 4: Clean up test record
    console.log('\n🧹 Step 4: Cleaning up test record...');
    const deleteRecord = await fetch(`https://api.godaddy.com/v1/domains/workdoc360.com/records/A/${testSubdomain}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (deleteRecord.ok) {
      console.log('✅ Test cleanup successful');
    } else {
      console.log('⚠️ Test cleanup failed (record may remain)');
    }
    
    console.log('\n🎉 SUCCESS! GoDaddy API is fully functional');
    console.log('Ready to deploy automated subdomain system');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
};

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  testNewGoDaddyKey();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});