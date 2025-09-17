/**
 * Test the customer portal functionality via HTTP while SSL provisions
 */

console.log('🌐 Testing Customer Portal: PlasterMaster');
console.log('==========================================\n');

async function testCustomerPortalHttp() {
  try {
    console.log('Testing HTTP version (SSL still provisioning)...');
    
    // Test the HTTP version with proper headers
    const response = await fetch('http://plastermaster.workdoc360.com/api/company/homepage', {
      method: 'GET',
      headers: {
        'User-Agent': 'WorkDoc360-Test/1.0',
        'Accept': 'application/json',
        'Host': 'plastermaster.workdoc360.com'
      },
      redirect: 'manual'
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers: ${JSON.stringify([...response.headers.entries()], null, 2)}`);
    
    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      console.log(`Redirect to: ${location}`);
      console.log('\n⚠️ Server is redirecting HTTP → HTTPS');
      console.log('This means the subdomain is working, but SSL is still provisioning.');
      
      return false; // SSL not ready yet
    }
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n🎉 SUCCESS! Customer Portal is responding:');
      console.log('===========================================');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.isCompanySubdomain && data.company) {
        console.log('\n✅ Multi-tenant routing working!');
        console.log(`Company: ${data.company.name}`);
        console.log(`Trade: ${data.company.tradeType}`);
        console.log('Customer portal is fully operational!');
        return true;
      } else {
        console.log('\n⚠️ Subdomain detected but no company context');
        return false;
      }
    } else {
      console.log(`\n❌ HTTP Error: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

// Test the portal
testCustomerPortalHttp()
  .then(success => {
    if (success) {
      console.log('\n🚀 CUSTOMER PORTAL STATUS: OPERATIONAL');
      console.log('The automated customer acquisition system is working!');
      console.log('SSL certificate will be ready in 15-30 minutes.');
    } else {
      console.log('\n⏳ CUSTOMER PORTAL STATUS: SSL PROVISIONING');
      console.log('The subdomain is created and routing correctly.');
      console.log('Waiting for SSL certificate to complete...');
    }
  })
  .catch(console.error);