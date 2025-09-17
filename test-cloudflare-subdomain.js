/**
 * Direct test of Cloudflare subdomain automation system
 * This verifies that all the components are working correctly
 */

console.log('🧪 Testing Cloudflare Subdomain Automation System');
console.log('====================================================');

// Test 1: Check environment variables
console.log('\n📋 Step 1: Checking Configuration');
const hasApiToken = !!process.env.CLOUDFLARE_API_TOKEN;
const hasZoneId = !!process.env.CLOUDFLARE_ZONE_ID;

console.log(`✅ CLOUDFLARE_API_TOKEN: ${hasApiToken ? 'Configured' : '❌ Missing'}`);
console.log(`✅ CLOUDFLARE_ZONE_ID: ${hasZoneId ? 'Configured' : '❌ Missing'}`);

if (!hasApiToken || !hasZoneId) {
  console.log('\n❌ Missing required Cloudflare credentials');
  process.exit(1);
}

// Test 2: Direct Cloudflare API call
console.log('\n🌐 Step 2: Testing Direct Cloudflare Connection');

async function testDirectCloudflareConnection() {
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Cloudflare API connected successfully`);
      console.log(`📊 Found ${data.result.length} DNS records for workdoc360.com`);
      
      // Show existing subdomains
      const subdomains = data.result.filter(record => 
        record.type === 'CNAME' && record.name.includes('.workdoc360.com')
      );
      
      console.log(`🌐 Existing customer subdomains: ${subdomains.length}`);
      subdomains.slice(0, 5).forEach(sub => {
        console.log(`   - ${sub.name} → ${sub.content}`);
      });
      
      return true;
    } else {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }
  } catch (error) {
    console.log(`❌ Cloudflare connection failed: ${error.message}`);
    return false;
  }
}

// Test 3: Test subdomain creation
console.log('\n🏗️ Step 3: Testing Subdomain Creation');

async function testSubdomainCreation() {
  try {
    const testSubdomain = `test-scaffolding-${Date.now()}`;
    
    const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: testSubdomain,
        content: 'workdoc360.com',
        ttl: 300
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create subdomain: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log(`✅ Test subdomain created: ${testSubdomain}.workdoc360.com`);
      
      // Clean up - delete the test subdomain
      const deleteResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${createData.result.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
        }
      });
      
      if (deleteResponse.ok) {
        console.log(`🧹 Test subdomain cleaned up successfully`);
      }
      
      return true;
    } else {
      throw new Error(`Subdomain creation failed: ${JSON.stringify(createData.errors)}`);
    }
  } catch (error) {
    console.log(`❌ Subdomain creation test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Running Cloudflare Automation Tests...\n');
  
  const connectionTest = await testDirectCloudflareConnection();
  const creationTest = await testSubdomainCreation();
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Configuration: ${hasApiToken && hasZoneId ? '✅' : '❌'}`);
  console.log(`Cloudflare Connection: ${connectionTest ? '✅' : '❌'}`);
  console.log(`Subdomain Creation: ${creationTest ? '✅' : '❌'}`);
  
  if (connectionTest && creationTest) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('The automated subdomain system is ready for production use.');
    console.log('\nNext steps:');
    console.log('1. Connect to Stripe webhooks for automatic subdomain creation on payment');
    console.log('2. Test the complete customer signup flow');
    console.log('3. Monitor subdomain creation for new £65/month customers');
    return true;
  } else {
    console.log('\n❌ Some tests failed. Please check the configuration and try again.');
    return false;
  }
}

// Execute the tests
runTests().catch(console.error);