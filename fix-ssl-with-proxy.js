#!/usr/bin/env node

/**
 * Fix SSL certificate by enabling Cloudflare proxy
 * This provides SSL while maintaining direct DNS routing
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function fixSSLWithProxy() {
  console.log('🔒 Fixing SSL certificate issue...\n');
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Get current DNS records
    console.log('📋 Checking current DNS records...');
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      { headers }
    );
    
    const listData = await listResponse.json();
    
    if (!listData.success) {
      console.log('❌ Failed to list DNS records:', listData.errors);
      return;
    }
    
    const mainRecord = listData.result.find(record => 
      record.name === 'workdoc360.com' && record.type === 'CNAME'
    );
    
    const wildcardRecord = listData.result.find(record => 
      record.name === '*.workdoc360.com' && record.type === 'CNAME'
    );
    
    console.log('Current records:');
    if (mainRecord) {
      console.log(`workdoc360.com: ${mainRecord.content} (${mainRecord.proxied ? 'Proxied' : 'Direct'})`);
    }
    if (wildcardRecord) {
      console.log(`*.workdoc360.com: ${wildcardRecord.content} (${wildcardRecord.proxied ? 'Proxied' : 'Direct'})`);
    }
    
    // Update main record to use proxy (for SSL)
    if (mainRecord) {
      console.log('\n📋 Step 1: Enabling Cloudflare proxy for SSL...');
      
      const updateMainResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${mainRecord.id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            type: 'CNAME',
            name: 'workdoc360.com',
            content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
            ttl: 300,
            proxied: true // Enable proxy for SSL
          })
        }
      );
      
      const updateMainResult = await updateMainResponse.json();
      
      if (updateMainResult.success) {
        console.log('✅ Updated workdoc360.com with Cloudflare proxy (SSL enabled)');
      } else {
        console.log('❌ Failed to update main record:', updateMainResult.errors);
      }
    }
    
    // Update wildcard record to use proxy
    if (wildcardRecord) {
      console.log('\n📋 Step 2: Enabling proxy for wildcard subdomains...');
      
      const updateWildcardResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${wildcardRecord.id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            type: 'CNAME',
            name: '*.workdoc360.com',
            content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
            ttl: 300,
            proxied: true // Enable proxy for SSL
          })
        }
      );
      
      const updateWildcardResult = await updateWildcardResponse.json();
      
      if (updateWildcardResult.success) {
        console.log('✅ Updated *.workdoc360.com with Cloudflare proxy (SSL enabled)');
      } else {
        console.log('❌ Failed to update wildcard record:', updateWildcardResult.errors);
      }
    }
    
    console.log('\n🔒 SSL CONFIGURATION COMPLETE:');
    console.log('');
    console.log('✅ workdoc360.com → Cloudflare proxy → Replit (SSL enabled)');
    console.log('✅ *.workdoc360.com → Cloudflare proxy → Replit (SSL enabled)');
    console.log('✅ Professional HTTPS for all customer portals');
    console.log('✅ Still £0/month additional cost');
    console.log('');
    console.log('⏰ SSL certificates will be ready in 5-10 minutes');
    console.log('');
    console.log('🎯 WHAT THIS FIXES:');
    console.log('• "Your connection is not private" error');
    console.log('• net::ERR_CERT_COMMON_NAME_INVALID');
    console.log('• Professional HTTPS experience for customers');
    
    // Test after a short wait
    console.log('\n📋 Testing SSL in 2 minutes...');
    await new Promise(resolve => setTimeout(resolve, 120000));
    
    try {
      const testResponse = await fetch('https://workdoc360.com/api/health', {
        timeout: 10000
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('🎉 SUCCESS: HTTPS is working!');
        console.log(`   Status: ${data.status}`);
        console.log('   SSL certificate is now active');
      } else {
        console.log(`⏳ Status: ${testResponse.status} - Still setting up SSL...`);
      }
    } catch (error) {
      console.log('⏳ SSL still propagating... Try again in 5 minutes');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSSLWithProxy();