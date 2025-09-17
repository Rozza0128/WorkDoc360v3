#!/usr/bin/env node

/**
 * Simple fix for Cloudflare Error 1014 - Use Cloudflare Workers instead of CNAME
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL;

async function fixWithWorkers() {
  console.log('🔧 Fixing Cloudflare Error 1014 with Workers solution...\n');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('❌ Missing Cloudflare credentials');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Delete the problematic CNAME record
    console.log('📋 Step 1: Removing problematic CNAME record...');
    
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      { headers }
    );
    
    const listData = await listResponse.json();
    const mainRecord = listData.result.find(record => 
      record.name === 'workdoc360.com'
    );
    
    if (mainRecord) {
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${mainRecord.id}`,
        { method: 'DELETE', headers }
      );
      console.log('✅ Removed CNAME record');
    }
    
    // Step 2: Create A record pointing to a placeholder IP
    console.log('📋 Step 2: Creating A record...');
    
    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'A',
          name: 'workdoc360.com',
          content: '192.0.2.1', // Placeholder IP - will be handled by Worker
          ttl: 300,
          proxied: true // MUST be proxied for Workers to work
        })
      }
    );
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Created A record (proxied through Cloudflare)');
    } else {
      console.log('❌ Failed to create A record:', createResult.errors);
      return;
    }
    
    // Step 3: Show the Cloudflare Worker script needed
    console.log('\n📋 Step 3: Cloudflare Worker Script Required...');
    console.log('');
    console.log('To complete the setup, create a Cloudflare Worker with this script:');
    console.log('');
    console.log('----------------------------------------');
    console.log('addEventListener("fetch", event => {');
    console.log('  event.respondWith(handleRequest(event.request));');
    console.log('});');
    console.log('');
    console.log('async function handleRequest(request) {');
    console.log('  const url = new URL(request.url);');
    console.log('  ');
    console.log('  // Forward to Replit server');
    console.log('  const replitUrl = `https://workspace.paulroscoe14.repl.co${url.pathname}${url.search}`;');
    console.log('  ');
    console.log('  const modifiedRequest = new Request(replitUrl, {');
    console.log('    method: request.method,');
    console.log('    headers: {');
    console.log('      ...request.headers,');
    console.log('      "Host": url.hostname,');
    console.log('      "X-Forwarded-Host": url.hostname');
    console.log('    },');
    console.log('    body: request.body');
    console.log('  });');
    console.log('  ');
    console.log('  return fetch(modifiedRequest);');
    console.log('}');
    console.log('----------------------------------------');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Go to Cloudflare Dashboard → Workers & Pages');
    console.log('2. Create Worker → Quick Edit');
    console.log('3. Paste the script above');
    console.log('4. Deploy the Worker');
    console.log('5. Add route: workdoc360.com/* → your-worker');
    console.log('');
    console.log('This eliminates the cross-user CNAME issue completely!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixWithWorkers();