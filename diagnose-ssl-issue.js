/**
 * Diagnose SSL certificate issue for plastermaster.workdoc360.com
 */

console.log('🔍 Diagnosing SSL Certificate Issue');
console.log('===================================\n');

async function diagnoseCertificateIssue() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  if (!token || !zoneId) {
    console.log('❌ Missing Cloudflare credentials');
    return;
  }

  try {
    console.log('1. Checking SSL certificate status...');
    
    // Get all certificates for the zone
    const certResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/certificate_packs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (certResponse.ok) {
      const certData = await certResponse.json();
      console.log(`Found ${certData.result.length} certificate packs`);
      
      certData.result.forEach((cert, index) => {
        console.log(`\nCertificate Pack ${index + 1}:`);
        console.log(`  Type: ${cert.type}`);
        console.log(`  Status: ${cert.status}`);
        console.log(`  Hosts: ${cert.hosts.join(', ')}`);
        
        // Check if this covers our subdomain
        const coversSubdomain = cert.hosts.some(host => 
          host === 'plastermaster.workdoc360.com' || 
          host === '*.workdoc360.com' || 
          host === 'workdoc360.com'
        );
        
        if (coversSubdomain) {
          console.log(`  ✅ Covers plastermaster.workdoc360.com`);
        } else {
          console.log(`  ❌ Does NOT cover plastermaster.workdoc360.com`);
        }
        
        if (cert.validation_errors && cert.validation_errors.length > 0) {
          console.log(`  ❌ Validation Errors:`);
          cert.validation_errors.forEach(error => {
            console.log(`    - ${error.message}`);
          });
        }
      });
    }

    console.log('\n2. Checking Universal SSL status...');
    
    const universalResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (universalResponse.ok) {
      const universalData = await universalResponse.json();
      console.log(`Universal SSL enabled: ${universalData.result.enabled}`);
      
      if (!universalData.result.enabled) {
        console.log('❌ Universal SSL is disabled - this is the problem!');
        console.log('Attempting to enable...');
        
        const enableResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            enabled: true
          })
        });
        
        if (enableResponse.ok) {
          console.log('✅ Universal SSL enabled successfully');
        } else {
          console.log('❌ Failed to enable Universal SSL');
        }
      }
    }

    console.log('\n3. Checking DNS records for SSL validation...');
    
    const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=plastermaster.workdoc360.com`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      dnsData.result.forEach(record => {
        console.log(`DNS Record: ${record.type} ${record.name} -> ${record.content}`);
        console.log(`  Proxied: ${record.proxied ? 'Yes' : 'No'}`);
        
        if (record.type === 'CNAME' && !record.proxied) {
          console.log('  ⚠️ CNAME record is not proxied - SSL may not work');
          console.log('  This could be the issue!');
        }
      });
    }

    console.log('\n4. Testing actual certificate chain...');
    
    // Use openssl-like test
    try {
      const testUrl = 'https://plastermaster.workdoc360.com';
      console.log(`Testing certificate for ${testUrl}...`);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        timeout: 10000
      });
      
      console.log('✅ Certificate validation passed');
      
    } catch (error) {
      if (error.message.includes('certificate')) {
        console.log('❌ Certificate validation failed');
        console.log('This confirms there is a certificate issue');
      } else {
        console.log(`Connection error: ${error.message}`);
      }
    }

    console.log('\n📋 Diagnosis Summary:');
    console.log('====================');
    console.log('Checking for common SSL issues:');
    console.log('1. Universal SSL disabled');
    console.log('2. DNS record not proxied through Cloudflare');
    console.log('3. Certificate authority validation failing');
    console.log('4. Zone SSL settings incorrect');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Ensure Universal SSL is enabled');
    console.log('2. Verify DNS record is proxied (orange cloud)');
    console.log('3. Check if wildcard certificate covers subdomain');
    console.log('4. Consider manual certificate request');

  } catch (error) {
    console.error('Error diagnosing SSL issue:', error);
  }
}

diagnoseCertificateIssue().catch(console.error);