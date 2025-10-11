/**
 * Set Cloudflare SSL to Full mode for better security
 */

console.log('🔧 Setting Cloudflare SSL to Full Mode');
console.log('===================================\n');

async function setSSLFullMode() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  if (!token || !zoneId) {
    console.log('❌ Missing Cloudflare credentials');
    return;
  }

  try {
    console.log('1. Getting current SSL settings...');
    
    const getCurrentSSL = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getCurrentSSL.ok) {
      const currentData = await getCurrentSSL.json();
      console.log(`Current SSL mode: ${currentData.result.value}`);
    }

    console.log('\n2. Setting SSL mode to Full...');
    
    const setSSLResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: 'full'
      })
    });
    
    if (setSSLResponse.ok) {
      const data = await setSSLResponse.json();
      console.log(`✅ SSL mode updated to: ${data.result.value}`);
    } else {
      const error = await setSSLResponse.json();
      console.log('❌ Failed to update SSL mode:', error);
    }

    console.log('\n3. Verifying SSL certificate status...');
    
    const certResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/verification`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (certResponse.ok) {
      const certData = await certResponse.json();
      console.log('Certificate status:');
      certData.result.forEach(cert => {
        console.log(`  ${cert.certificate_authority}: ${cert.verification_status}`);
        if (cert.verification_status === 'active') {
          console.log('  ✅ Certificate is active');
        } else {
          console.log(`  ⏳ Certificate status: ${cert.verification_status}`);
        }
      });
    }

    console.log('\n4. Testing HTTPS connection...');
    
    // Wait a moment for changes to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const testResponse = await fetch('https://plastermaster.workdoc360.com/api/health', {
        method: 'GET',
        timeout: 10000
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('✅ HTTPS connection successful!');
        console.log('Response:', data);
      } else {
        console.log(`HTTPS test returned: ${testResponse.status}`);
      }
      
    } catch (error) {
      if (error.message.includes('certificate')) {
        console.log('⏳ Certificate still being issued - try again in a few minutes');
      } else {
        console.log(`HTTPS test failed: ${error.message}`);
      }
    }

    console.log('\n📋 SSL Configuration Summary');
    console.log('============================');
    console.log('SSL Mode: Full');
    console.log('');
    console.log('What "Full" mode means:');
    console.log('- Encrypts traffic between visitor and Cloudflare: ✅');
    console.log('- Encrypts traffic between Cloudflare and your server: ✅');
    console.log('- Requires valid certificate on your server: ✅');
    console.log('- More secure than Flexible mode: ✅');
    console.log('');
    console.log('Timeline for changes:');
    console.log('- Settings update: Immediate');
    console.log('- Certificate validation: 1-5 minutes');
    console.log('- Full HTTPS access: 5-15 minutes');

  } catch (error) {
    console.error('Error setting SSL Full mode:', error);
  }
}

setSSLFullMode().catch(console.error);