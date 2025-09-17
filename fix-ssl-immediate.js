/**
 * Immediate SSL fix for workdoc360.com
 * Switch to proper API Token authentication and ensure SSL settings
 */

const apiToken = process.env.CLOUDFLARE_API_TOKEN; // This should be the API Token, not Global API Key
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

console.log('🔒 Immediate SSL Fix for workdoc360.com');
console.log('=====================================');

if (!apiToken || !zoneId) {
  console.log('❌ Missing credentials');
  process.exit(1);
}

async function fixSSL() {
  try {
    console.log('\n1. Testing API Token Authentication');
    
    // Use Bearer token format instead of X-Auth-Key
    const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const zoneData = await zoneResponse.json();
    
    if (!zoneResponse.ok || !zoneData.success) {
      console.log(`❌ Zone fetch failed: ${JSON.stringify(zoneData.errors)}`);
      return false;
    }

    console.log(`✅ Zone authentication successful: ${zoneData.result.name}`);
    
    console.log('\n2. Checking SSL Settings');
    
    // Get SSL settings
    const sslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sslData = await sslResponse.json();
    
    if (sslResponse.ok && sslData.success) {
      console.log(`✅ Current SSL mode: ${sslData.result.value}`);
      
      // Set SSL to Full if not already
      if (sslData.result.value !== 'full') {
        console.log('\n3. Setting SSL to Full mode');
        
        const updateSSL = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: 'full'
          })
        });

        const updateResult = await updateSSL.json();
        if (updateResult.success) {
          console.log('✅ SSL set to Full mode');
        } else {
          console.log(`❌ SSL update failed: ${JSON.stringify(updateResult.errors)}`);
        }
      }
    }
    
    console.log('\n4. Checking Always Use HTTPS');
    
    // Enable Always Use HTTPS
    const httpsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: 'on'
      })
    });

    const httpsResult = await httpsResponse.json();
    if (httpsResult.success) {
      console.log('✅ Always Use HTTPS enabled');
    } else {
      console.log(`❌ HTTPS setting failed: ${JSON.stringify(httpsResult.errors)}`);
    }
    
    console.log('\n5. Checking DNS Records');
    
    // List DNS records for root domain
    const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=workdoc360.com`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const dnsData = await dnsResponse.json();
    if (dnsData.success && dnsData.result.length > 0) {
      console.log(`✅ Root domain DNS record exists: ${dnsData.result[0].type} -> ${dnsData.result[0].content}`);
      console.log(`   Proxied: ${dnsData.result[0].proxied}`);
      
      // If proxied is true, this might be causing SSL issues
      if (dnsData.result[0].proxied) {
        console.log('⚠️  DNS record is proxied - this might affect SSL');
      }
    } else {
      console.log('❌ No root domain DNS record found');
    }
    
    console.log('\n✅ SSL fix completed! Wait 2-5 minutes for changes to propagate.');
    return true;
    
  } catch (error) {
    console.log(`❌ SSL fix failed: ${error.message}`);
    return false;
  }
}

fixSSL().then(success => {
  if (success) {
    console.log('\n🎉 SSL configuration updated successfully!');
    console.log('   workdoc360.com should be accessible within 5 minutes');
  } else {
    console.log('\n❌ SSL fix failed - manual intervention may be needed');
  }
});