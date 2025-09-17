/**
 * Fix SSL for subdomains by setting up wildcard DNS and SSL
 */

async function fixSubdomainSSL() {
  // First, let's create a wildcard DNS record for all subdomains
  console.log('🔧 Setting up wildcard DNS for subdomains...');
  
  const cloudflareConfig = {
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    email: process.env.CLOUDFLARE_EMAIL,
    apiToken: process.env.CLOUDFLARE_API_TOKEN
  };
  
  if (!cloudflareConfig.zoneId || !cloudflareConfig.email || !cloudflareConfig.apiToken) {
    console.error('❌ Missing Cloudflare credentials');
    process.exit(1);
  }

  try {
    // Create wildcard A record for *.workdoc360.com
    const wildcardRecord = {
      type: 'A',
      name: '*',
      content: '34.111.179.208', // Replit server IP
      ttl: 1,
      proxied: true // This enables Cloudflare proxy and SSL
    };

    const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'X-Auth-Email': cloudflareConfig.email,
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wildcardRecord)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Wildcard DNS record created successfully');
      console.log(`   Record ID: ${createResult.result.id}`);
      console.log(`   Name: ${createResult.result.name}`);
      console.log(`   Content: ${createResult.result.content}`);
      console.log(`   Proxied: ${createResult.result.proxied}`);
    } else if (createResult.errors?.[0]?.code === 81057) {
      console.log('⚠️ Wildcard record already exists, updating...');
      
      // Get existing wildcard record
      const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records?name=*.workdoc360.com`, {
        headers: {
          'X-Auth-Email': cloudflareConfig.email,
          'Authorization': `Bearer ${cloudflareConfig.apiToken}`
        }
      });
      
      const listResult = await listResponse.json();
      
      if (listResult.success && listResult.result.length > 0) {
        const recordId = listResult.result[0].id;
        
        // Update existing record
        const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/dns_records/${recordId}`, {
          method: 'PUT',
          headers: {
            'X-Auth-Email': cloudflareConfig.email,
            'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wildcardRecord)
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log('✅ Wildcard DNS record updated successfully');
        } else {
          console.error('❌ Failed to update wildcard record:', updateResult.errors);
        }
      }
    } else {
      console.error('❌ Failed to create wildcard DNS record:', createResult.errors);
      return false;
    }

    // Enable Universal SSL for the domain (covers wildcards automatically)
    console.log('🔧 Checking SSL settings...');
    
    const sslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/settings/ssl`, {
      headers: {
        'X-Auth-Email': cloudflareConfig.email,
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`
      }
    });

    const sslResult = await sslResponse.json();
    
    if (sslResult.success) {
      console.log(`✅ Current SSL mode: ${sslResult.result.value}`);
      
      if (sslResult.result.value !== 'full' && sslResult.result.value !== 'strict') {
        console.log('🔧 Setting SSL mode to Full...');
        
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
          console.error('❌ Failed to update SSL mode:', updateSslResult.errors);
        }
      }
    }

    // Force SSL certificate generation for wildcard
    console.log('🔧 Requesting SSL certificate generation...');
    
    const certResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/ssl/universal/settings`, {
      method: 'PATCH',
      headers: {
        'X-Auth-Email': cloudflareConfig.email,
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        enabled: true 
      })
    });

    const certResult = await certResponse.json();
    
    if (certResult.success) {
      console.log('✅ Universal SSL enabled');
    } else {
      console.log('⚠️ Universal SSL may already be enabled');
    }

    console.log('\n🎉 Subdomain SSL setup completed!');
    console.log('\n⏱️ SSL certificates may take 5-15 minutes to propagate');
    console.log('   Once ready, these subdomains should work with HTTPS:');
    console.log('   • https://plastermaster.workdoc360.com');
    console.log('   • https://any-company.workdoc360.com');
    
    return true;

  } catch (error) {
    console.error('❌ Error setting up subdomain SSL:', error.message);
    return false;
  }
}

// Run the fix
fixSubdomainSSL().then(success => {
  if (success) {
    console.log('\n✅ SSL setup process completed successfully');
  } else {
    console.log('\n❌ SSL setup failed - check the errors above');
    process.exit(1);
  }
});