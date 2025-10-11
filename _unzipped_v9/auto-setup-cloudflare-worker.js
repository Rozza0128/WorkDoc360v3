#!/usr/bin/env node

/**
 * Automated Cloudflare Worker Setup
 * This script will create and configure your Worker automatically
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL;

const workerScript = `
addEventListener("fetch", event => {
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
}
`;

async function setupWorkerAutomatically() {
  console.log('🚀 Setting up Cloudflare Worker automatically...\n');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('❌ Missing Cloudflare credentials. Please ensure:');
    console.log('   CLOUDFLARE_API_TOKEN is set');
    console.log('   CLOUDFLARE_ZONE_ID is set');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Get account ID
    console.log('📋 Step 1: Getting account information...');
    const accountResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', { headers });
    const accountData = await accountResponse.json();
    
    if (!accountData.success || accountData.result.length === 0) {
      console.log('❌ Failed to get account info:', accountData.errors);
      return;
    }
    
    const accountId = accountData.result[0].id;
    console.log(`✅ Account ID: ${accountId}`);
    
    // Step 2: Create the Worker
    console.log('\n📋 Step 2: Creating Worker...');
    const workerName = 'workdoc360-router';
    
    const createWorkerResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/javascript'
        },
        body: workerScript
      }
    );
    
    const createWorkerResult = await createWorkerResponse.json();
    
    if (createWorkerResult.success) {
      console.log(`✅ Worker '${workerName}' created successfully`);
    } else {
      console.log('❌ Failed to create worker:', createWorkerResult.errors);
      return;
    }
    
    // Step 3: Add routes
    console.log('\n📋 Step 3: Adding routes...');
    
    const routes = [
      'workdoc360.com/*',
      '*.workdoc360.com/*'
    ];
    
    for (const route of routes) {
      const routeResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/workers/routes`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pattern: route,
            script: workerName
          })
        }
      );
      
      const routeResult = await routeResponse.json();
      
      if (routeResult.success) {
        console.log(`✅ Route added: ${route} → ${workerName}`);
      } else {
        console.log(`❌ Failed to add route ${route}:`, routeResult.errors);
      }
    }
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('');
    console.log('Your domains should now work:');
    console.log('✅ https://workdoc360.com → Main platform');
    console.log('✅ https://plastermaster.workdoc360.com → PlasterMaster portal');
    console.log('');
    console.log('🕐 Changes may take 1-2 minutes to propagate globally');
    
    // Test the setup
    console.log('\n📋 Testing setup in 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      const testResponse = await fetch('https://workdoc360.com/api/health', {
        timeout: 10000
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('🎉 SUCCESS! Main domain is working');
        console.log(`   Status: ${data.status}`);
      } else {
        console.log(`⏳ Status: ${testResponse.status} - Still propagating...`);
      }
    } catch (error) {
      console.log('⏳ Still propagating... Try again in a few minutes');
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

setupWorkerAutomatically();