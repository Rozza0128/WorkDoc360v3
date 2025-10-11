/**
 * Simple token verification
 */

console.log('🔧 Cloudflare Token Verification');
console.log('=================================\n');

// Replace YOUR_TOKEN_HERE with your actual token
const testToken = 'YOUR_TOKEN_HERE';

if (testToken === 'YOUR_TOKEN_HERE') {
  console.log('Please follow these steps:');
  console.log('1. Copy your Cloudflare API token');
  console.log('2. Go to Replit Secrets');
  console.log('3. Update CLOUDFLARE_API_TOKEN with your new token');
  console.log('4. Remove CLOUDFLARE_EMAIL');
  console.log('5. Then I\'ll test the system for you');
  process.exit(0);
}

try {
  console.log('Testing token...');
  
  const response = await fetch('https://api.cloudflare.com/client/v4/zones?name=workdoc360.com', {
    headers: {
      'Authorization': `Bearer ${testToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  
  if (data.success && data.result.length > 0) {
    const zone = data.result[0];
    console.log('✅ Token is working!');
    console.log(`Zone: ${zone.name}`);
    console.log(`Zone ID: ${zone.id}`);
    console.log(`Status: ${zone.status}`);
  } else {
    console.log('❌ Error:', JSON.stringify(data.errors, null, 2));
  }
} catch (error) {
  console.log('❌ Failed:', error.message);
}