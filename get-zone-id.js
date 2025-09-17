/**
 * Get the Zone ID for workdoc360.com
 * Run this with your new API token to verify Zone ID
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your new Cloudflare API token: ', async (token) => {
  console.log('\n🔍 Testing token and finding Zone ID...\n');
  
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/zones?name=workdoc360.com', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success && data.result.length > 0) {
      const zone = data.result[0];
      console.log('✅ Token is working!');
      console.log(`✅ Found Zone: ${zone.name}`);
      console.log(`✅ Zone ID: ${zone.id}`);
      console.log(`✅ Status: ${zone.status}`);
      
      console.log('\n📋 Update these in Replit Secrets:');
      console.log(`CLOUDFLARE_API_TOKEN=${token}`);
      console.log(`CLOUDFLARE_ZONE_ID=${zone.id}`);
      console.log('Remove: CLOUDFLARE_EMAIL (not needed)');
      
    } else {
      console.log('❌ Error:', JSON.stringify(data.errors, null, 2));
    }
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  rl.close();
});

console.log('🔧 Cloudflare Zone ID Finder');
console.log('==============================');