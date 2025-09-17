#!/usr/bin/env node

/**
 * Test subdomain routing by making a direct request with the correct Host header
 * This simulates how Cloudflare should forward requests to our server
 */

async function testSubdomainRouting() {
  const replitDomain = process.env.REPL_SLUG ? 
    `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
    'workdoc360.replit.app';
    
  console.log('🧪 Testing subdomain routing...');
  console.log(`📡 Using Replit domain: ${replitDomain}`);
  
  try {
    // Test 1: API health check with subdomain header
    console.log('\n📋 Test 1: API Health Check with PlasterMaster subdomain');
    const healthResponse = await fetch(`https://${replitDomain}/api/health`, {
      headers: {
        'Host': 'plastermaster.workdoc360.com',
        'X-Forwarded-Host': 'plastermaster.workdoc360.com',
        'User-Agent': 'WorkDoc360-SubdomainTest/1.0'
      }
    });
    
    const healthText = await healthResponse.text();
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Response: ${healthText}`);
    
    // Test 2: Company data retrieval
    console.log('\n📋 Test 2: Company data for PlasterMaster');
    const companyResponse = await fetch(`https://${replitDomain}/api/company/plastermaster`, {
      headers: {
        'Host': 'plastermaster.workdoc360.com',
        'X-Forwarded-Host': 'plastermaster.workdoc360.com',
        'User-Agent': 'WorkDoc360-SubdomainTest/1.0'
      }
    });
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      console.log(`✅ Company found: ${companyData.name}`);
      console.log(`📍 Location: ${companyData.address || 'Not specified'}`);
      console.log(`🔧 Trade: ${companyData.tradeType}`);
    } else {
      console.log(`❌ Failed to get company data: ${companyResponse.status}`);
      console.log(`Response: ${await companyResponse.text()}`);
    }
    
    // Test 3: Frontend page request
    console.log('\n📋 Test 3: Frontend page request');
    const pageResponse = await fetch(`https://${replitDomain}/`, {
      headers: {
        'Host': 'plastermaster.workdoc360.com',
        'X-Forwarded-Host': 'plastermaster.workdoc360.com',
        'User-Agent': 'WorkDoc360-SubdomainTest/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    console.log(`Status: ${pageResponse.status}`);
    console.log(`Content-Type: ${pageResponse.headers.get('content-type')}`);
    
    if (pageResponse.ok) {
      const pageContent = await pageResponse.text();
      if (pageContent.includes('<!DOCTYPE html>') || pageContent.includes('<html')) {
        console.log('✅ HTML page served successfully');
        console.log(`📄 Page size: ${pageContent.length} characters`);
      } else {
        console.log('⚠️  Non-HTML response received');
        console.log(`Response preview: ${pageContent.substring(0, 200)}...`);
      }
    } else {
      console.log(`❌ Failed to load page: ${pageResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubdomainRouting();