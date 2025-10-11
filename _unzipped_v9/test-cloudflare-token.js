import fetch from 'node-fetch';

const token = process.env.CLOUDFLARE_API_TOKEN;

console.log('Testing Cloudflare API token...');
console.log('Token length:', token?.length || 'undefined');
console.log('Token format:', token ? 'present' : 'missing');

// Test 1: Verify zones
async function testAPI() {
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Token verification:', data);

    if (data.success) {
      console.log('✅ Token is valid');
      
      // Test 2: List zones
      const zonesResponse = await fetch('https://api.cloudflare.com/client/v4/zones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const zonesData = await zonesResponse.json();
      console.log('Zones data:', zonesData);
      
      if (zonesData.success) {
        const workdocZone = zonesData.result.find(z => z.name === 'workdoc360.com');
        if (workdocZone) {
          console.log('✅ Found workdoc360.com zone:', workdocZone.id);
          return workdocZone.id;
        } else {
          console.log('❌ workdoc360.com zone not found');
          console.log('Available zones:', zonesData.result.map(z => z.name));
        }
      }
    } else {
      console.log('❌ Token verification failed:', data.errors);
    }
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

testAPI();