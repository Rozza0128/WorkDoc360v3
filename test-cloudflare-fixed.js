/**
 * Test the fixed Cloudflare Global API Key authentication
 */

const email = process.env.CLOUDFLARE_EMAIL;
const apiKey = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

console.log('🧪 Testing Fixed Cloudflare Authentication (Global API Key format)');
console.log('================================================================');

// Test credentials format
console.log('\n1. Credentials Check');
console.log(`✅ Email: ${email ? 'Configured' : '❌ Missing'}`);
console.log(`✅ API Key: ${apiKey ? `${apiKey.length} characters` : '❌ Missing'}`);
console.log(`✅ Zone ID: ${zoneId ? 'Configured' : '❌ Missing'}`);

if (!email || !apiKey || !zoneId) {
  console.log('\n❌ Missing credentials');
  process.exit(1);
}

// Test Global API Key authentication
async function testGlobalKeyAuth() {
  try {
    console.log('\n2. Testing Global API Key Authentication');
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Authentication successful!`);
      console.log(`   Zone: ${data.result.name}`);
      console.log(`   Status: ${data.result.status}`);
      console.log(`   Type: ${data.result.type}`);
      return true;
    } else {
      console.log(`❌ Authentication failed: ${JSON.stringify(data.errors)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Test subdomain creation
async function testSubdomainCreation() {
  try {
    console.log('\n3. Testing Subdomain Creation');
    
    const testSubdomain = `test-demo-${Date.now()}`;
    console.log(`Creating test subdomain: ${testSubdomain}.workdoc360.com`);
    
    const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: testSubdomain,
        content: 'workdoc360.com',
        ttl: 300
      })
    });

    const createData = await createResponse.json();
    
    if (createResponse.ok && createData.success) {
      console.log(`✅ Subdomain created successfully!`);
      console.log(`   URL: ${testSubdomain}.workdoc360.com`);
      console.log(`   Record ID: ${createData.result.id}`);
      
      // Clean up - delete the test subdomain
      console.log('\n4. Cleaning Up Test Subdomain');
      const deleteResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${createData.result.id}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey
        }
      });
      
      if (deleteResponse.ok) {
        console.log(`✅ Test subdomain cleaned up successfully`);
      }
      
      return true;
    } else {
      console.log(`❌ Subdomain creation failed: ${JSON.stringify(createData.errors)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Subdomain test failed: ${error.message}`);
    return false;
  }
}

// Run complete test
async function runCompleteTest() {
  console.log('\n🚀 Running Complete Cloudflare Test...\n');
  
  const authTest = await testGlobalKeyAuth();
  const subdomainTest = await testSubdomainCreation();
  
  console.log('\n📊 Final Results');
  console.log('=================');
  console.log(`Authentication: ${authTest ? '✅ Working' : '❌ Failed'}`);
  console.log(`Subdomain Creation: ${subdomainTest ? '✅ Working' : '❌ Failed'}`);
  
  if (authTest && subdomainTest) {
    console.log('\n🎉 SUCCESS! Cloudflare automation is fully functional!');
    console.log('\nNext steps:');
    console.log('1. Your automated subdomain system is ready for production');
    console.log('2. Paying customers (£65/month) will get instant branded subdomains');
    console.log('3. Test the complete workflow with: curl -X POST https://www.workdoc360.com/api/test/simulate-customer-signup');
    return true;
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    return false;
  }
}

runCompleteTest().catch(console.error);