/**
 * Test using Global API Key format
 * This will help verify if we can work with the existing credentials
 */

console.log('🔧 Testing with Global API Key format...');

const globalKey = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const email = 'your-cloudflare-email@domain.com'; // You'll need to provide this

// Test with Global API Key format (X-Auth-Key header instead of Bearer)
async function testWithGlobalKey() {
  try {
    console.log('Testing zone access with Global API Key format...');
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': globalKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Global API Key works!');
      console.log(`Zone: ${data.result.name}`);
      console.log('We can update the Cloudflare service to use Global API Key format');
      return true;
    } else {
      console.log(`❌ Global API Key failed: ${JSON.stringify(data.errors)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Note: This test requires your Cloudflare account email
console.log('To test with Global API Key, we need your Cloudflare account email address.');
console.log('Alternatively, creating a Custom API Token is the recommended approach.');

// testWithGlobalKey();