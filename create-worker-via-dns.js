#!/usr/bin/env node

/**
 * Since we can't create Workers via API, let's provide exact manual steps
 * and verify our current DNS is ready for when you create the Worker manually
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function prepareForWorker() {
  console.log('🔧 Preparing DNS for Worker setup...\n');
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Check current DNS setup
    console.log('📋 Checking current DNS configuration...');
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      { headers }
    );
    
    const listData = await listResponse.json();
    
    if (listData.success) {
      const mainRecord = listData.result.find(record => 
        record.name === 'workdoc360.com'
      );
      
      console.log('Current DNS setup:');
      if (mainRecord) {
        console.log(`✅ workdoc360.com → ${mainRecord.type} → ${mainRecord.content} (${mainRecord.proxied ? 'Proxied' : 'Not Proxied'})`);
        
        if (mainRecord.proxied) {
          console.log('✅ DNS is properly configured for Workers');
        } else {
          console.log('⚠️  DNS needs to be proxied (orange cloud) for Workers');
        }
      } else {
        console.log('❌ No DNS record found for workdoc360.com');
      }
    }
    
    // Provide the exact Worker creation steps
    console.log('\n🛠️  MANUAL WORKER CREATION STEPS:');
    console.log('Since API permissions are limited, please follow these exact steps:\n');
    
    console.log('1. Go to: https://dash.cloudflare.com');
    console.log('2. Click on "Workers & Pages" in left sidebar');
    console.log('3. Click "Create Worker"');
    console.log('4. Name: "workdoc360-router"');
    console.log('5. Click "Deploy"');
    console.log('6. Click "Edit Code"');
    console.log('7. Replace ALL code with this:\n');
    
    console.log('═══════════════════════════════════════');
    console.log(`addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  const replitBaseUrl = "https://b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev";
  
  const targetUrl = \`\${replitBaseUrl}\${url.pathname}\${url.search}\`;
  
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      ...request.headers,
      "Host": url.hostname,
      "X-Forwarded-Host": url.hostname,
      "X-Forwarded-Proto": "https"
    },
    body: request.body
  });
  
  try {
    const response = await fetch(modifiedRequest);
    
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
    
    return newResponse;
  } catch (error) {
    return new Response("Server temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain" }
    });
  }
}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('8. Click "Save and Deploy"');
    console.log('9. Click "Triggers" tab');
    console.log('10. Click "Add Route"');
    console.log('11. Route: workdoc360.com/*');
    console.log('12. Worker: workdoc360-router');
    console.log('13. Click "Save"');
    console.log('14. Click "Add Route" again');
    console.log('15. Route: *.workdoc360.com/*');
    console.log('16. Worker: workdoc360-router');
    console.log('17. Click "Save"');
    
    console.log('\n🎯 After completing these steps:');
    console.log('✅ https://workdoc360.com will work');
    console.log('✅ https://plastermaster.workdoc360.com will work');
    console.log('✅ All customer subdomains will work');
    
    console.log('\n⏱️  The whole process takes about 2-3 minutes');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

prepareForWorker();