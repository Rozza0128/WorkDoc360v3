#!/usr/bin/env node

/**
 * Simple diagnostic for PlasterMaster external access issue
 */

async function diagnoseExternalAccess() {
  console.log('🔧 Diagnosing PlasterMaster External Access Issue\n');
  
  // Test 1: Internal server test
  console.log('📋 Test 1: Internal server routing...');
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      headers: { 'Host': 'plastermaster.workdoc360.com' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Internal routing works:', data.hostname);
      console.log('✅ Company detected:', data.isCompanySubdomain);
    } else {
      console.log('❌ Internal routing failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Internal test error:', error.message);
  }
  
  // Test 2: External DNS resolution
  console.log('\n📋 Test 2: External DNS resolution...');
  try {
    const response = await fetch('https://plastermaster.workdoc360.com/api/health');
    console.log('❌ External status:', response.status);
    
    if (response.status === 404) {
      console.log('🔍 Issue: DNS forwards to server but no route handler found');
    }
  } catch (error) {
    console.log('❌ External DNS failed:', error.message);
  }
  
  // Test 3: Main domain check
  console.log('\n📋 Test 3: Main domain check...');
  try {
    const response = await fetch('https://workdoc360.com');
    console.log('📡 Main domain status:', response.status);
  } catch (error) {
    console.log('❌ Main domain error:', error.message);
  }
  
  console.log('\n🔍 DIAGNOSIS:');
  console.log('The issue is DNS forwarding chain:');
  console.log('');
  console.log('Current setup:');
  console.log('  plastermaster.workdoc360.com → CNAME → workdoc360.com');
  console.log('  workdoc360.com → ??? (NOT pointing to Replit server)');
  console.log('');
  console.log('What we need:');
  console.log('  workdoc360.com → A record → Replit deployment IP');
  console.log('  OR');
  console.log('  workdoc360.com → CNAME → your-app.replit.app');
  console.log('');
  console.log('🚀 SOLUTION:');
  console.log('1. Deploy to Replit Deployments');
  console.log('2. Update workdoc360.com DNS to point to deployment');
  console.log('3. All subdomains will work automatically');
  console.log('');
  console.log('This will make plastermaster.workdoc360.com publicly accessible!');
}

diagnoseExternalAccess();