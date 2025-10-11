/**
 * Check SSL certificate status for plastermaster.workdoc360.com
 */

console.log('🔍 Checking SSL Status for plastermaster.workdoc360.com');
console.log('================================================\n');

async function checkSSLStatus() {
  try {
    console.log('1. Testing HTTPS connection...');
    
    // Test HTTPS directly
    const response = await fetch('https://plastermaster.workdoc360.com/api/health', {
      method: 'GET',
      headers: {
        'User-Agent': 'SSL-Test/1.0'
      },
      // Don't reject unauthorized certificates to see the actual error
      rejectUnauthorized: false
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`SSL Working: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HTTPS is working!');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.log(`❌ HTTPS Error: ${error.message}`);
    
    if (error.message.includes('certificate')) {
      console.log('\n🔍 SSL Certificate Issue Detected');
      console.log('This could mean:');
      console.log('- Certificate not yet issued by Cloudflare');
      console.log('- Certificate issued but not propagated');
      console.log('- SSL/TLS settings need adjustment in Cloudflare');
    }
  }
  
  console.log('\n2. Testing HTTP to HTTPS redirect...');
  
  try {
    const httpResponse = await fetch('http://plastermaster.workdoc360.com/api/health', {
      method: 'GET',
      redirect: 'manual'
    });
    
    if (httpResponse.status === 301 || httpResponse.status === 302) {
      const location = httpResponse.headers.get('location');
      console.log(`✅ HTTP redirects to: ${location}`);
      console.log('✅ DNS and routing working correctly');
    }
  } catch (error) {
    console.log(`❌ HTTP test failed: ${error.message}`);
  }
  
  console.log('\n3. Checking Cloudflare DNS records...');
  
  // Check if we can list DNS records to verify setup
  try {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    if (!token || !zoneId) {
      console.log('❌ Missing Cloudflare credentials');
      return;
    }
    
    const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=plastermaster.workdoc360.com`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      console.log(`✅ DNS record found: ${dnsData.result.length} records`);
      
      dnsData.result.forEach(record => {
        console.log(`   ${record.type}: ${record.name} -> ${record.content}`);
      });
    } else {
      console.log('❌ Could not fetch DNS records');
    }
    
    // Check SSL/TLS settings
    console.log('\n4. Checking SSL/TLS settings...');
    
    const sslResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (sslResponse.ok) {
      const sslData = await sslResponse.json();
      console.log(`SSL Mode: ${sslData.result.value}`);
      
      if (sslData.result.value === 'off') {
        console.log('⚠️ SSL is disabled - this needs to be enabled');
      } else if (sslData.result.value === 'flexible') {
        console.log('✅ SSL Mode: Flexible (should work for subdomains)');
      } else if (sslData.result.value === 'full') {
        console.log('✅ SSL Mode: Full (requires valid origin certificate)');
      }
    }
    
  } catch (error) {
    console.log(`❌ Cloudflare API error: ${error.message}`);
  }
}

checkSSLStatus().catch(console.error);