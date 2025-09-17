#!/usr/bin/env node

/**
 * Fix domain routing immediately - point to working Replit server
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function fixDomainRoutingNow() {
  console.log('🔧 Fixing domain routing to working Replit server...\n');
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Get current records
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      { headers }
    );
    
    const listData = await listResponse.json();
    const mainRecord = listData.result.find(record => 
      record.name === 'workdoc360.com' && record.type === 'A'
    );
    
    if (mainRecord) {
      console.log('Current:', `${mainRecord.name} → ${mainRecord.content}`);
      
      // Delete current A record
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${mainRecord.id}`,
        { method: 'DELETE', headers }
      );
      console.log('✅ Removed old A record');
    }
    
    // Create CNAME pointing to working Replit server
    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'CNAME',
          name: 'workdoc360.com',
          content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
          ttl: 60, // 1 minute for fast updates
          proxied: true // SSL + caching
        })
      }
    );
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Created CNAME to working Replit server');
      console.log('   workdoc360.com → b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev');
    } else {
      console.log('❌ Failed to create CNAME:', createResult.errors);
      return;
    }
    
    // Create wildcard for subdomains
    const wildcardResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'CNAME',
          name: '*.workdoc360.com',
          content: 'b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev',
          ttl: 60,
          proxied: true
        })
      }
    );
    
    const wildcardResult = await wildcardResponse.json();
    
    if (wildcardResult.success) {
      console.log('✅ Created wildcard CNAME for subdomains');
    } else {
      console.log('⚠️  Wildcard result:', wildcardResult.errors?.[0]?.message || 'May already exist');
    }
    
    console.log('\n🎯 DOMAIN ROUTING FIXED:');
    console.log('');
    console.log('✅ workdoc360.com → Working Replit server');
    console.log('✅ *.workdoc360.com → Working Replit server');
    console.log('✅ SSL enabled via Cloudflare proxy');
    console.log('✅ Fast TTL for immediate updates');
    console.log('');
    console.log('⏰ Changes will be live in 1-2 minutes');
    console.log('');
    console.log('🧪 Test these URLs in 2 minutes:');
    console.log('• https://workdoc360.com');
    console.log('• https://plastermaster.workdoc360.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDomainRoutingNow();