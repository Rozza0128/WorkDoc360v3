/**
 * Test Cloudflare API permissions and identify the issue
 */

console.log('🔍 Cloudflare Permissions Diagnosis');
console.log('====================================\n');

async function testPermissions() {
  const apiKey = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  console.log('1. Testing Token Info...');
  
  try {
    // Get token info
    const tokenResponse = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Token Status:', tokenData.success ? '✅ Valid' : '❌ Invalid');
    
    if (tokenData.success) {
      console.log('Token ID:', tokenData.result.id);
      console.log('Status:', tokenData.result.status);
    }
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
  }
  
  console.log('\n2. Testing Zone Permissions...');
  
  try {
    // Test zone read
    const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const zoneData = await zoneResponse.json();
    console.log('Zone Read:', zoneData.success ? '✅ Working' : '❌ Failed');
    
    if (!zoneData.success) {
      console.log('Zone Errors:', zoneData.errors);
    }
    
  } catch (error) {
    console.log('❌ Zone test failed:', error.message);
  }
  
  console.log('\n3. Testing DNS Records Permissions...');
  
  try {
    // Test DNS records list (read permission)
    const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dnsData = await dnsResponse.json();
    console.log('DNS Read:', dnsData.success ? '✅ Working' : '❌ Failed');
    
    if (!dnsData.success) {
      console.log('DNS Read Errors:', dnsData.errors);
    }
    
    // Now test create permission with a test subdomain
    console.log('\n4. Testing DNS Create Permission...');
    
    const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: `permission-test-${Date.now()}`,
        content: 'workdoc360.com',
        ttl: 300
      })
    });
    
    const createData = await createResponse.json();
    console.log('DNS Create:', createData.success ? '✅ Working' : '❌ Failed');
    
    if (createData.success) {
      console.log('✅ Created test record, cleaning up...');
      
      // Clean up
      const deleteResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${createData.result.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      console.log('Cleanup:', deleteResponse.ok ? '✅ Complete' : '❌ Failed');
      
    } else {
      console.log('DNS Create Errors:', createData.errors);
      
      // Check for specific permission issues
      const hasPermissionError = createData.errors?.some(err => 
        err.message?.includes('permission') || 
        err.message?.includes('insufficient') ||
        err.code === 10000
      );
      
      if (hasPermissionError) {
        console.log('\n🔧 SOLUTION NEEDED:');
        console.log('The API token needs DNS:Edit permission for this zone.');
        console.log('Current token only has read permissions.');
        console.log('\nTo fix:');
        console.log('1. Go to Cloudflare dashboard');
        console.log('2. Navigate to My Profile > API Tokens');
        console.log('3. Edit your token to include DNS:Edit permission');
        console.log('4. Or create a new token with Zone:Edit permission');
      }
    }
    
  } catch (error) {
    console.log('❌ DNS permissions test failed:', error.message);
  }
}

testPermissions().catch(console.error);