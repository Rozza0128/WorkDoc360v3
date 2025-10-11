// Script to help fix GoDaddy API authentication issues
const fixGoDaddyAuthentication = async () => {
  console.log('🔧 GoDaddy API Authentication Fix Guide');
  console.log('========================================');
  
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ No API credentials found in environment');
    console.log('\nPlease check that Replit secrets contain:');
    console.log('- GODADDY_API_KEY');
    console.log('- GODADDY_API_SECRET');
    return;
  }
  
  console.log('Current credentials format:');
  console.log(`API Key: ${apiKey.substring(0, 8)}... (${apiKey.length} chars)`);
  console.log(`API Secret: ${apiSecret.substring(0, 5)}... (${apiSecret.length} chars)`);
  
  // Check for common formatting issues
  const issues = [];
  
  if (apiKey.includes(' ')) {
    issues.push('API Key contains spaces');
  }
  
  if (apiSecret.includes(' ')) {
    issues.push('API Secret contains spaces');
  }
  
  if (apiKey.length < 20) {
    issues.push('API Key seems too short');
  }
  
  if (apiSecret.length < 15) {
    issues.push('API Secret seems too short');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️ Potential formatting issues detected:');
    issues.forEach(issue => console.log(`- ${issue}`));
  } else {
    console.log('\n✅ Credential format looks correct');
  }
  
  // Test with different authentication formats
  console.log('\n🧪 Testing different authentication formats...');
  
  const testFormats = [
    { name: 'Standard sso-key format', auth: `sso-key ${apiKey}:${apiSecret}` },
    { name: 'Trimmed credentials', auth: `sso-key ${apiKey.trim()}:${apiSecret.trim()}` },
    { name: 'Base64 encoded', auth: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}` }
  ];
  
  for (const format of testFormats) {
    try {
      console.log(`\nTesting: ${format.name}`);
      
      const response = await fetch('https://api.godaddy.com/v1/domains', {
        method: 'GET',
        headers: {
          'Authorization': format.auth,
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Found ${data.length} domains`);
        
        // Check for target domain
        const targetDomain = data.find(d => d.domain === 'workdoc360.com');
        if (targetDomain) {
          console.log('🎯 workdoc360.com is accessible!');
          return true;
        } else {
          console.log('⚠️ workdoc360.com not found in accessible domains');
          console.log('Available domains:', data.map(d => d.domain).join(', '));
        }
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${error}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n📋 TROUBLESHOOTING CHECKLIST:');
  console.log('1. ✓ Verify API key is from Production environment (not OTE)');
  console.log('2. ✓ Confirm API key is created under account that owns workdoc360.com');
  console.log('3. ✓ Check that domain is visible in "My Domains" section');
  console.log('4. ✓ Ensure API key has DNS management permissions');
  console.log('5. ✓ Try regenerating the API key completely');
  
  console.log('\n🔄 NEXT STEPS:');
  console.log('1. Log into GoDaddy Developer Portal');
  console.log('2. Delete current API key');
  console.log('3. Create new Production API key with domain permissions');
  console.log('4. Update Replit secrets immediately');
  console.log('5. Or switch to Cloudflare for more reliable DNS management');
  
  return false;
};

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  fixGoDaddyAuthentication();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});