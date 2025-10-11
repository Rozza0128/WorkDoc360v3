/**
 * Check current DNS setup and fix SSL for subdomains
 */

async function checkAndFixSSL() {
  const cloudflareConfig = {
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    email: process.env.CLOUDFLARE_EMAIL,
    apiToken: process.env.CLOUDFLARE_API_TOKEN
  };

  try {
    console.log('🔍 Checking current DNS records...');
    
    // Get all DNS records
    const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records`, {
      headers: {
        'X-Auth-Email': cloudflareConfig.email,
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`
      }
    });

    const listResult = await listResponse.json();
    
    if (listResult.success) {
      console.log('\n📋 Current DNS Records:');
      listResult.result.forEach(record => {
        console.log(`   ${record.type}: ${record.name} → ${record.content} (Proxied: ${record.proxied})`);
      });
      
      // Check if we have a wildcard record
      const wildcardRecord = listResult.result.find(r => r.name === '*.workdoc360.com');
      
      if (wildcardRecord) {
        console.log('\n✅ Wildcard DNS record exists');
        console.log(`   Type: ${wildcardRecord.type}, Proxied: ${wildcardRecord.proxied}`);
        
        if (!wildcardRecord.proxied) {
          console.log('🔧 Enabling proxy for wildcard record (this enables SSL)...');
          
          const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records/${wildcardRecord.id}`, {
            method: 'PUT',
            headers: {
              'X-Auth-Email': cloudflareConfig.email,
              'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: wildcardRecord.type,
              name: wildcardRecord.name,
              content: wildcardRecord.content,
              ttl: wildcardRecord.ttl,
              proxied: true // Enable proxy for SSL
            })
          });
          
          const updateResult = await updateResponse.json();
          
          if (updateResult.success) {
            console.log('✅ Wildcard record proxy enabled');
          } else {
            console.error('❌ Failed to enable proxy:', updateResult.errors);
          }
        }
      } else {
        console.log('⚠️ No wildcard DNS record found');
        
        // Check for specific subdomain record
        const subdomainRecord = listResult.result.find(r => r.name.includes('plastermaster'));
        
        if (subdomainRecord) {
          console.log(`✅ Found subdomain record: ${subdomainRecord.name}`);
          console.log(`   Proxied: ${subdomainRecord.proxied}`);
          
          if (!subdomainRecord.proxied) {
            console.log('🔧 Enabling proxy for subdomain (this enables SSL)...');
            
            const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records/${subdomainRecord.id}`, {
              method: 'PUT',
              headers: {
                'X-Auth-Email': cloudflareConfig.email,
                'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: subdomainRecord.type,
                name: subdomainRecord.name,
                content: subdomainRecord.content,
                ttl: subdomainRecord.ttl,
                proxied: true
              })
            });
            
            const updateResult = await updateResponse.json();
            
            if (updateResult.success) {
              console.log('✅ Subdomain proxy enabled - SSL should work now');
            } else {
              console.error('❌ Failed to enable proxy:', updateResult.errors);
            }
          } else {
            console.log('✅ Subdomain already has proxy enabled');
          }
        }
      }
      
    } else {
      console.error('❌ Failed to fetch DNS records:', listResult.errors);
      return false;
    }

    // Check SSL settings
    console.log('\n🔍 Checking SSL configuration...');
    
    const sslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/settings/ssl`, {
      headers: {
        'X-Auth-Email': cloudflareConfig.email,
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`
      }
    });

    const sslResult = await sslResponse.json();
    
    if (sslResult.success) {
      console.log(`✅ SSL Mode: ${sslResult.result.value}`);
      
      // Ensure we have Full or Strict SSL
      if (sslResult.result.value === 'off' || sslResult.result.value === 'flexible') {
        console.log('🔧 Updating SSL mode to Full...');
        
        const updateSslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/settings/ssl`, {
          method: 'PATCH',
          headers: {
            'X-Auth-Email': cloudflareConfig.email,
            'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: 'full' })
        });
        
        const updateSslResult = await updateSslResponse.json();
        
        if (updateSslResult.success) {
          console.log('✅ SSL mode updated to Full');
        } else {
          console.error('❌ Failed to update SSL mode');
        }
      } else {
        console.log('✅ SSL mode is already properly configured');
      }
    }

    console.log('\n🎉 SSL check and fix completed!');
    console.log('\n⏱️ If changes were made, SSL may take 2-5 minutes to propagate');
    console.log('   Test with: https://plastermaster.workdoc360.com');
    
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

checkAndFixSSL();