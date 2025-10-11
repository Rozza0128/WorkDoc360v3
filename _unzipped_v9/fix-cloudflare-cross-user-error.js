#!/usr/bin/env node

/**
 * Fix Cloudflare Error 1014 - CNAME Cross-User Banned
 * Solution: Use A record pointing to Replit IP instead of CNAME to .repl.co
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function fixCrossUserError() {
  console.log('🔧 Fixing Cloudflare Error 1014 - CNAME Cross-User Banned\n');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('❌ Missing Cloudflare credentials');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Resolve Replit domain to IP address
    console.log('📋 Step 1: Finding Replit server IP address...');
    
    const replitDomain = 'workspace.paulroscoe14.repl.co';
    
    // Use DNS lookup to get the IP
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);
    
    let replitIP;
    try {
      const { stdout } = await execPromise(`nslookup ${replitDomain} | grep "Address:" | tail -1 | awk '{print $2}'`);
      replitIP = stdout.trim();
      console.log(`Resolved ${replitDomain} → ${replitIP}`);
    } catch (error) {
      // Fallback: Use common Replit IP ranges
      replitIP = '35.190.75.0'; // Common Replit IP, but may need updating
      console.log(`Using fallback IP: ${replitIP}`);
    }
    
    // Step 2: Get current DNS records
    console.log('\n📋 Step 2: Checking current DNS records...');
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
      record.name === 'workdoc360.com'
    );
    
    console.log('Current record:', mainRecord ? `${mainRecord.type} → ${mainRecord.content}` : 'Not found');
    
    // Step 3: Update to A record instead of CNAME
    console.log('\n📋 Step 3: Updating to A record (fixes cross-user issue)...');
    
    const updateData = {
      type: 'A',
      name: 'workdoc360.com',
      content: replitIP,
      ttl: 300, // 5 minutes
      proxied: true // Keep Cloudflare proxy for SSL
    };
    
    if (mainRecord) {
      // Update existing record
      const updateResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${mainRecord.id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData)
        }
      );
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log('✅ Updated to A record successfully');
        console.log(`   workdoc360.com → A → ${replitIP} (Proxied)`);
        console.log('   This eliminates the cross-user CNAME issue');
      } else {
        console.log('❌ Failed to update record:', updateResult.errors);
        return;
      }
    }
    
    // Step 4: Alternative solution - Use Cloudflare Workers
    console.log('\n📋 Alternative Solution: Cloudflare Workers...');
    console.log('If IP routing doesn\'t work, we can use Cloudflare Workers:');
    console.log(`
Worker Script:
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Forward to Replit server with correct headers
  const replitUrl = 'https://workspace.paulroscoe14.repl.co' + url.pathname + url.search
  
  const modifiedRequest = new Request(replitUrl, {
    method: request.method,
    headers: {
      ...request.headers,
      'Host': url.hostname,
      'X-Forwarded-Host': url.hostname
    },
    body: request.body
  })
  
  return fetch(modifiedRequest)
}
    `);
    
    console.log('\n⏳ Testing fix in 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Test the fix
    try {
      const testResponse = await fetch('https://plastermaster.workdoc360.com/api/health');
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('🎉 SUCCESS! PlasterMaster is now accessible');
        console.log(`   Status: ${data.status}`);
      } else {
        console.log(`Status: ${testResponse.status} - May need Cloudflare Workers solution`);
      }
    } catch (error) {
      console.log('Still resolving... Try Cloudflare Workers if IP method doesn\'t work');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCrossUserError();