// Quick test script for GoDaddy API
const testGoDaddyAPI = async () => {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Missing GoDaddy API credentials');
    return;
  }
  
  console.log('🧪 Testing GoDaddy API connection...');
  console.log('API Key exists:', apiKey.length > 0);
  console.log('API Secret exists:', apiSecret.length > 0);
  
  try {
    const response = await fetch('https://api.godaddy.com/v1/domains', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const domains = await response.json();
      console.log('✅ GoDaddy API connection successful!');
      console.log('Found domains:', domains.length);
      
      // Test creating a subdomain
      console.log('\n🔧 Testing subdomain creation...');
      const testSubdomain = 'test-' + Date.now();
      
      const createResponse = await fetch(`https://api.godaddy.com/v1/domains/workdoc360.co.uk/records/A/${testSubdomain}`, {
        method: 'PUT',
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          data: '34.117.33.233',
          ttl: 3600
        }])
      });
      
      console.log('Create subdomain status:', createResponse.status);
      
      if (createResponse.ok) {
        console.log(`✅ Test subdomain created: ${testSubdomain}.workdoc360.co.uk`);
        
        // Clean up by deleting the test subdomain
        const deleteResponse = await fetch(`https://api.godaddy.com/v1/domains/workdoc360.co.uk/records/A/${testSubdomain}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `sso-key ${apiKey}:${apiSecret}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (deleteResponse.ok) {
          console.log('🧹 Test subdomain cleaned up');
        }
      } else {
        const errorText = await createResponse.text();
        console.error('❌ Failed to create test subdomain:', errorText);
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ GoDaddy API connection failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing GoDaddy API:', error.message);
  }
};

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  testGoDaddyAPI();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});