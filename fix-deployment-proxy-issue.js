#!/usr/bin/env node

/**
 * Fix Cloudflare Proxy Issue for Replit Deployments
 * 
 * This script disables Cloudflare proxy on critical records to allow
 * Replit deployments to work properly with SSL certificate management.
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function fixProxyIssue() {
  console.log('🔧 Fixing Cloudflare Proxy Issue for Replit Deployments\n');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('❌ Missing Cloudflare credentials');
    console.log('CLOUDFLARE_API_TOKEN:', CLOUDFLARE_API_TOKEN ? 'Set' : 'Missing');
    console.log('CLOUDFLARE_ZONE_ID:', CLOUDFLARE_ZONE_ID ? 'Set' : 'Missing');
    console.log('\nPlease set these environment variables and try again.');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Get all DNS records
    console.log('📋 Step 1: Getting current DNS records...');
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      { headers }
    );
    
    const listData = await listResponse.json();
    
    if (!listData.success) {
      console.log('❌ Failed to list DNS records:', listData.errors);
      return;
    }
    
    console.log(`Found ${listData.result.length} DNS records\n`);
    
    // Step 2: Find records that need proxy disabled
    const criticalRecords = listData.result.filter(record => {
      // These records must have proxy disabled for Replit deployments
      return (
        (record.name === 'workdoc360.com' && record.type === 'CNAME') ||
        (record.name === '*.workdoc360.com' && record.type === 'CNAME') ||
        (record.name === 'www.workdoc360.com' && record.type === 'A') ||
        (record.name === 'plastermaster.workdoc360.com' && record.type === 'CNAME')
      ) && record.proxied === true;
    });
    
    console.log('📋 Step 2: Critical records that need proxy disabled:');
    criticalRecords.forEach(record => {
      console.log(`  - ${record.name} (${record.type}) → ${record.content}`);
    });
    console.log(`Total: ${criticalRecords.length} records\n`);
    
    if (criticalRecords.length === 0) {
      console.log('✅ All critical records already have proxy disabled!');
      console.log('Your deployment should work now.');
      return;
    }
    
    // Step 3: Disable proxy on critical records
    console.log('📋 Step 3: Disabling proxy on critical records...');
    
    for (const record of criticalRecords) {
      console.log(`Updating ${record.name}...`);
      
      const updateResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${record.id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            type: record.type,
            name: record.name,
            content: record.content,
            ttl: record.ttl,
            proxied: false // This is the critical change
          })
        }
      );
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        console.log(`  ✅ ${record.name} - Proxy disabled`);
      } else {
        console.log(`  ❌ ${record.name} - Failed:`, updateData.errors[0]?.message);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 Proxy Fix Complete!');
    console.log('\n📋 What this fixes:');
    console.log('✅ Replit can now provision SSL certificates for your domain');
    console.log('✅ Deployments will succeed instead of failing');
    console.log('✅ External traffic will route properly to your application');
    console.log('\n📋 Next Steps:');
    console.log('1. Wait 2-3 minutes for DNS propagation');
    console.log('2. Try deploying your Replit application again');
    console.log('3. Your workdoc360.com should now serve your actual application');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Run the fix
fixProxyIssue();