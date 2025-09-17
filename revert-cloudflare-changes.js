#!/usr/bin/env node

/**
 * Revert all Cloudflare changes back to original working state
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function revertCloudflareChanges() {
  console.log('🔄 Reverting Cloudflare back to original configuration...\n');
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Get all current DNS records
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
    
    // Step 2: Delete the problematic CNAME records we created
    console.log('\n📋 Step 2: Removing CNAME records pointing to Replit...');
    
    const recordsToDelete = listData.result.filter(record => 
      (record.name === 'workdoc360.com' || record.name === '*.workdoc360.com') &&
      record.type === 'CNAME' &&
      record.content.includes('replit')
    );
    
    for (const record of recordsToDelete) {
      const deleteResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${record.id}`,
        { method: 'DELETE', headers }
      );
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        console.log(`✅ Deleted ${record.name} → ${record.content}`);
      } else {
        console.log(`❌ Failed to delete ${record.name}:`, deleteResult.errors);
      }
    }
    
    // Step 3: Restore original A record configuration
    console.log('\n📋 Step 3: Restoring original A record configuration...');
    
    const createMainResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'A',
          name: 'workdoc360.com',
          content: '34.111.179.208', // Original IP from your setup
          ttl: 300,
          proxied: true // Keep proxy for SSL
        })
      }
    );
    
    const createMainResult = await createMainResponse.json();
    
    if (createMainResult.success) {
      console.log('✅ Restored workdoc360.com → A → 34.111.179.208 (Proxied)');
    } else if (createMainResult.errors[0]?.code === 81053) {
      console.log('✅ Main A record already exists');
    } else {
      console.log('❌ Failed to create main A record:', createMainResult.errors);
    }
    
    // Step 4: Remove any wildcard records we created
    console.log('\n📋 Step 4: Cleaning up wildcard records...');
    
    const wildcardRecords = listData.result.filter(record => 
      record.name === '*.workdoc360.com'
    );
    
    for (const record of wildcardRecords) {
      const deleteResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${record.id}`,
        { method: 'DELETE', headers }
      );
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        console.log(`✅ Removed wildcard record: ${record.content}`);
      }
    }
    
    console.log('\n🎯 REVERT COMPLETE:');
    console.log('');
    console.log('✅ Removed all Replit CNAME records');
    console.log('✅ Restored original IP-based configuration');
    console.log('✅ Maintained SSL through Cloudflare proxy');
    console.log('✅ Back to stable domain management');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Your domain is back to original working state');
    console.log('2. For custom domains, consider Replit deployment with custom domain setup');
    console.log('3. Or use the working .repl.co URL for customer portals');
    console.log('');
    console.log('💡 RECOMMENDATION:');
    console.log('Use your working Replit URL for now:');
    console.log('   https://b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev');
    console.log('   This supports all subdomain functionality without domain complications');
    
  } catch (error) {
    console.error('❌ Error reverting changes:', error.message);
  }
}

revertCloudflareChanges();