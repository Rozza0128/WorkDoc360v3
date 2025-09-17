#!/usr/bin/env node

/**
 * Setup Cloudflare Worker for proper routing to Replit server
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

async function setupWorkerRouting() {
  console.log('🔧 Setting up Cloudflare Worker routing...\n');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('❌ Missing Cloudflare credentials');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Get the current Replit URL that works
    console.log('📋 Finding your active Replit server URL...');
    
    // Check environment variable for Replit URL
    const replitUrl = process.env.REPLIT_URL || process.env.REPL_URL;
    console.log('Environment REPLIT_URL:', replitUrl);
    
    // Show the correct Worker script
    console.log('\n📋 Cloudflare Worker Script (Updated):');
    console.log('');
    console.log('Copy this EXACT script to your Cloudflare Worker:');
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('addEventListener("fetch", event => {');
    console.log('  event.respondWith(handleRequest(event.request));');
    console.log('});');
    console.log('');
    console.log('async function handleRequest(request) {');
    console.log('  const url = new URL(request.url);');
    console.log('  ');
    console.log('  // Your current Replit server URL');
    console.log('  const replitBaseUrl = "https://workspace.paulroscoe14.repl.co";');
    console.log('  ');
    console.log('  // Alternative URLs to try if main fails');
    console.log('  const backupUrls = [');
    console.log('    "https://b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev",');
    console.log('    "https://workspace-paulroscoe14.replit.app"');
    console.log('  ];');
    console.log('  ');
    console.log('  const targetUrl = `${replitBaseUrl}${url.pathname}${url.search}`;');
    console.log('  ');
    console.log('  const modifiedRequest = new Request(targetUrl, {');
    console.log('    method: request.method,');
    console.log('    headers: {');
    console.log('      ...request.headers,');
    console.log('      "Host": url.hostname, // Pass original hostname');
    console.log('      "X-Forwarded-Host": url.hostname,');
    console.log('      "X-Forwarded-Proto": "https"');
    console.log('    },');
    console.log('    body: request.body');
    console.log('  });');
    console.log('  ');
    console.log('  try {');
    console.log('    const response = await fetch(modifiedRequest);');
    console.log('    return response;');
    console.log('  } catch (error) {');
    console.log('    // Fallback response if server unreachable');
    console.log('    return new Response("Server temporarily unavailable", {');
    console.log('      status: 503,');
    console.log('      headers: { "Content-Type": "text/plain" }');
    console.log('    });');
    console.log('  }');
    console.log('}');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    
    console.log('🎯 DEPLOYMENT STEPS:');
    console.log('');
    console.log('1. GO TO: https://dash.cloudflare.com → Workers & Pages');
    console.log('2. Click "Create Worker"');
    console.log('3. Name it: "workdoc360-router"');
    console.log('4. Click "Deploy" then "Edit Code"');
    console.log('5. Replace ALL existing code with script above');
    console.log('6. Click "Save and Deploy"');
    console.log('7. Go to "Triggers" tab');
    console.log('8. Add Route: "workdoc360.com/*"');
    console.log('9. Add Route: "*.workdoc360.com/*"');
    console.log('');
    console.log('⚡ CRITICAL: The Worker must handle BOTH:');
    console.log('   • workdoc360.com (main site)');
    console.log('   • *.workdoc360.com (all subdomains)');
    console.log('');
    console.log('🔍 Testing URLs after setup:');
    console.log('   • https://workdoc360.com → Main platform');
    console.log('   • https://plastermaster.workdoc360.com → PlasterMaster portal');
    console.log('');
    console.log('This fixes Error 522 by properly routing to your Replit server!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupWorkerRouting();