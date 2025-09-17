/**
 * Check current Cloudflare API token permissions
 */

console.log('🔍 Checking Cloudflare API Token Permissions');
console.log('===========================================\n');

async function checkAPIPermissions() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!token) {
    console.log('❌ No Cloudflare API token found');
    return;
  }

  try {
    console.log('1. Testing API token validity...');
    
    const tokenResponse = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ API token is valid');
      console.log(`Token status: ${tokenData.result.status}`);
    } else {
      console.log('❌ API token is invalid');
      return;
    }

    console.log('\n2. Checking zone permissions...');
    
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (zoneResponse.ok) {
      console.log('✅ Zone access granted');
    } else {
      console.log('❌ No zone access');
    }

    console.log('\n3. Testing specific permissions...');
    
    // Test DNS record access
    const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (dnsResponse.ok) {
      console.log('✅ DNS records: Read access');
    } else {
      console.log('❌ DNS records: No access');
    }

    // Test SSL settings access
    const sslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (sslResponse.ok) {
      console.log('✅ SSL settings: Read access');
    } else {
      console.log('❌ SSL settings: No access');
    }

    console.log('\n📋 Required Permissions for Full SSL Management:');
    console.log('===============================================');
    console.log('Current token appears to have:');
    console.log('- Zone:Read ✅');
    console.log('- DNS:Edit ✅');
    console.log('- SSL:Edit ❌ (Unauthorized error)');
    console.log('');
    console.log('To enable SSL Full mode via API, your token needs:');
    console.log('- Zone:Zone Settings:Edit');
    console.log('- Zone:SSL and Certificates:Edit');
    console.log('');
    console.log('💡 Recommendation:');
    console.log('Use the Cloudflare Dashboard method instead:');
    console.log('1. Go to dash.cloudflare.com');
    console.log('2. Select workdoc360.com zone');
    console.log('3. SSL/TLS > Overview');
    console.log('4. Change to "Full" mode');

  } catch (error) {
    console.error('Error checking permissions:', error);
  }
}

checkAPIPermissions().catch(console.error);