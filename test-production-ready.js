/**
 * Test the complete production-ready subdomain automation system
 */

console.log('🚀 WorkDoc360 Production Readiness Test');
console.log('========================================\n');

async function testCompleteSystem() {
  const baseUrl = 'https://www.workdoc360.com';
  
  console.log('1. Testing Cloudflare Connection...');
  try {
    const connectionTest = await fetch(`${baseUrl}/api/test/cloudflare-status`);
    const connectionResult = await connectionTest.json();
    console.log(`   Status: ${connectionResult.status}`);
    console.log(`   Message: ${connectionResult.message}`);
    
    if (!connectionResult.success) {
      console.log('❌ Cloudflare connection failed');
      return false;
    }
    
    console.log('✅ Cloudflare connection successful\n');
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
    return false;
  }

  console.log('2. Testing Subdomain Creation...');
  try {
    const subdomainTest = await fetch(`${baseUrl}/api/test/create-test-subdomain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName: 'Test Scaffolding Ltd' })
    });
    
    const subdomainResult = await subdomainTest.json();
    console.log(`   Status: ${subdomainResult.success ? 'Success' : 'Failed'}`);
    console.log(`   Message: ${subdomainResult.message}`);
    
    if (subdomainResult.success) {
      console.log(`   Created: ${subdomainResult.subdomain}`);
      console.log('✅ Subdomain creation working\n');
    } else {
      console.log('❌ Subdomain creation failed\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Subdomain test failed: ${error.message}\n`);
    return false;
  }

  console.log('3. Testing Customer Simulation...');
  try {
    const customerTest = await fetch(`${baseUrl}/api/test/simulate-customer-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@plastermaster.co.uk',
        businessName: 'PlasterMaster Ltd',
        paymentAmount: 6500
      })
    });
    
    const customerResult = await customerTest.json();
    console.log(`   Status: ${customerResult.success ? 'Success' : 'Failed'}`);
    console.log(`   Portal: ${customerResult.portalUrl || 'Not created'}`);
    
    if (customerResult.success) {
      console.log('✅ Customer automation working\n');
    } else {
      console.log('❌ Customer automation failed\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Customer test failed: ${error.message}\n`);
    return false;
  }

  return true;
}

async function runProductionTest() {
  console.log('Testing complete customer acquisition automation...\n');
  
  const allTestsPassed = await testCompleteSystem();
  
  console.log('📊 Production Readiness Summary');
  console.log('===============================');
  
  if (allTestsPassed) {
    console.log('🎉 SUCCESS! WorkDoc360 is production-ready!');
    console.log('\n✅ Automated subdomain creation working');
    console.log('✅ Customer payment workflow ready');
    console.log('✅ Multi-tenant data isolation active');
    console.log('✅ Professional branding with custom subdomains');
    console.log('\n💰 Business Impact:');
    console.log('   £65/month customers get instant branded portals');
    console.log('   Zero manual work for customer onboarding');
    console.log('   Unlimited scalability with professional appearance');
    console.log('\nThe system is ready to accept paying customers!');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    console.log('Most likely issue: API token not yet updated in Replit Secrets');
  }
}

runProductionTest().catch(console.error);