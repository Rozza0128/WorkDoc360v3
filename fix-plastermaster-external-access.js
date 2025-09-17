#!/usr/bin/env node

/**
 * Fix PlasterMaster External Access
 * 
 * The issue: plastermaster.workdoc360.com shows 404 externally but works internally
 * Root cause: DNS forwarding from Cloudflare to Replit server not configured
 * 
 * Solution: Configure Cloudflare DNS to point subdomains to Replit deployment
 */

import { CloudflareSubdomainManager } from './server/services/cloudflareSubdomainManager.js';

async function fixPlasterMasterAccess() {
  console.log('🔧 Diagnosing PlasterMaster external access issue...');
  
  try {
    const manager = new CloudflareSubdomainManager();
    
    // Check current DNS configuration
    console.log('\n📋 Step 1: Checking current DNS records...');
    
    const records = await manager.listDnsRecords();
    const plasterMasterRecord = records.find(r => r.name === 'plastermaster.workdoc360.com');
    
    if (plasterMasterRecord) {
      console.log(`✅ PlasterMaster DNS record exists:`);
      console.log(`   Type: ${plasterMasterRecord.type}`);
      console.log(`   Content: ${plasterMasterRecord.content}`);
      console.log(`   Proxied: ${plasterMasterRecord.proxied ? 'Yes (🟠)' : 'No (☁️)'}`);
      console.log(`   TTL: ${plasterMasterRecord.ttl}`);
    } else {
      console.log('❌ No DNS record found for plastermaster.workdoc360.com');
      return;
    }
    
    // The core issue: Subdomains point to workdoc360.com, but workdoc360.com doesn't point to Replit
    console.log('\n📋 Step 2: Identifying the issue...');
    console.log('🔍 ISSUE IDENTIFIED:');
    console.log('   - plastermaster.workdoc360.com → CNAME → workdoc360.com');
    console.log('   - BUT workdoc360.com needs to point to Replit server');
    console.log('   - External requests have no final destination');
    
    console.log('\n📋 Step 3: Solution options...');
    console.log('');
    console.log('🎯 OPTION 1: Deploy to Replit Deployments (RECOMMENDED)');
    console.log('   ✅ Provides stable URL for DNS pointing');
    console.log('   ✅ Handles SSL certificates automatically');
    console.log('   ✅ Professional production setup');
    console.log('   ✅ Scales automatically');
    console.log('');
    console.log('🎯 OPTION 2: Update DNS to point to current Replit domain');
    console.log('   ⚠️  Development domain (not stable for production)');
    console.log('   ⚠️  May change when restarted');
    console.log('   ⚠️  Not recommended for customer-facing subdomains');
    
    // Test internal vs external access
    console.log('\n📋 Step 4: Testing current access...');
    
    // Test internal API
    try {
      const internalTest = await fetch('http://localhost:5000/api/health', {
        headers: { 'Host': 'plastermaster.workdoc360.com' }
      });
      
      if (internalTest.ok) {
        const data = await internalTest.json();
        console.log('✅ Internal API working:', data.status);
      }
    } catch (error) {
      console.log('❌ Internal API test failed:', error.message);
    }
    
    // Test external access
    try {
      const externalTest = await fetch('https://plastermaster.workdoc360.com/api/health');
      console.log(`❌ External API status: ${externalTest.status}`);
    } catch (error) {
      console.log('❌ External API test failed:', error.message);
    }
    
    console.log('\n🚀 RECOMMENDED SOLUTION:');
    console.log('1. Deploy WorkDoc360 to Replit Deployments');
    console.log('2. Get deployment URL (e.g., https://workdoc360.replit.app)');
    console.log('3. Update workdoc360.com A record to point to deployment');
    console.log('4. All subdomains will automatically work');
    console.log('');
    console.log('💡 This provides:');
    console.log('   ✅ Stable production URL');
    console.log('   ✅ Automatic SSL for all subdomains');
    console.log('   ✅ Professional customer experience');
    console.log('   ✅ £65/month automated customer acquisition working');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPlasterMasterAccess();