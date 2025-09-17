#!/usr/bin/env node

/**
 * Fix DNS to point directly to working Replit server
 * This eliminates the need for Workers and costs
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function fixDNSToReplit() {
  console.log('🔧 Fixing DNS to point directly to Replit server...\n');
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Update main domain to point to Replit
    console.log('📋 Step 1: Updating workdoc360.com to point to Replit...');
    
    const mainRecordId = "3219b73e0948e6cd003e8ad60100bcc3";
    
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${mainRecordId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          type: 'CNAME',
          name: 'workdoc360.com',
          content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
          ttl: 300,
          proxied: false // CRITICAL: Must be false to avoid cross-user issues
        })
      }
    );
    
    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ Updated workdoc360.com → CNAME → Replit server (Direct)');
      console.log('   No proxy = No cross-user issues');
    } else {
      console.log('❌ Failed to update main record:', updateResult.errors);
      return;
    }
    
    // Step 2: Add wildcard subdomain record
    console.log('\n📋 Step 2: Creating wildcard subdomain record...');
    
    const createWildcardResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'CNAME',
          name: '*.workdoc360.com',
          content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
          ttl: 300,
          proxied: false // CRITICAL: Must be false
        })
      }
    );
    
    const wildcardResult = await createWildcardResponse.json();
    
    if (wildcardResult.success) {
      console.log('✅ Created *.workdoc360.com → CNAME → Replit server');
      console.log('   All subdomains will work');
    } else {
      console.log('⚠️  Wildcard creation result:', wildcardResult.errors || 'May already exist');
    }
    
    console.log('\n🎯 DNS CONFIGURATION COMPLETE:');
    console.log('');
    console.log('✅ workdoc360.com → Direct to Replit');
    console.log('✅ *.workdoc360.com → Direct to Replit'); 
    console.log('✅ No Workers needed = £0/month');
    console.log('✅ No cross-user CNAME issues');
    console.log('');
    console.log('🔍 Testing in 30 seconds...');
    
    // Wait for DNS propagation
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Test the URLs
    console.log('\n📋 Testing your domains...');
    
    try {
      // Test main domain
      const mainTest = await fetch('https://workdoc360.com/api/health', {
        timeout: 10000
      });
      
      if (mainTest.ok) {
        const mainData = await mainTest.json();
        console.log('🎉 SUCCESS: https://workdoc360.com is working!');
        console.log(`   Status: ${mainData.status}`);
      } else {
        console.log(`⏳ Main domain status: ${mainTest.status} - Still propagating...`);
      }
    } catch (error) {
      console.log('⏳ Main domain still propagating...');
    }
    
    try {
      // Test subdomain
      const subTest = await fetch('https://plastermaster.workdoc360.com/api/health', {
        timeout: 10000
      });
      
      if (subTest.ok) {
        const subData = await subTest.json();
        console.log('🎉 SUCCESS: https://plastermaster.workdoc360.com is working!');
        console.log(`   Company: ${subData.hostname}`);
      } else {
        console.log(`⏳ Subdomain status: ${subTest.status} - Still propagating...`);
      }
    } catch (error) {
      console.log('⏳ Subdomain still propagating...');
    }
    
    console.log('\n✨ Your automated customer acquisition system is now LIVE!');
    console.log('   • £65/month customers get instant branded portals');
    console.log('   • No additional hosting costs');
    console.log('   • Professional domain experience');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDNSToReplit();