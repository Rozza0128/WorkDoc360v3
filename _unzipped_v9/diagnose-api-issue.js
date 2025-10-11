// Comprehensive API diagnosis to fix the access issue
const diagnoseAPIIssue = async () => {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log('🔍 Comprehensive GoDaddy API Diagnosis');
  console.log('=====================================');
  
  if (!apiKey || !apiSecret) {
    console.error('❌ No API credentials found');
    return;
  }
  
  console.log('API Key format:', apiKey.substring(0, 10) + '...');
  console.log('API Secret format:', apiSecret.substring(0, 5) + '...');
  
  // Test 1: Basic authentication
  console.log('\n1. Testing basic authentication...');
  try {
    const authResponse = await fetch('https://api.godaddy.com/v1/agreements', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Auth test status:', authResponse.status);
    
    if (authResponse.status === 200) {
      console.log('✅ Basic authentication works');
    } else if (authResponse.status === 401) {
      console.log('❌ Authentication failed - invalid credentials');
      const error = await authResponse.text();
      console.log('Error details:', error);
      return;
    } else if (authResponse.status === 403) {
      console.log('⚠️ Authentication successful but access forbidden');
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return;
  }
  
  // Test 2: Check available domains
  console.log('\n2. Checking available domains...');
  try {
    const domainsResponse = await fetch('https://api.godaddy.com/v1/domains', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Domains API status:', domainsResponse.status);
    
    if (domainsResponse.ok) {
      const domains = await domainsResponse.json();
      console.log(`✅ Found ${domains.length} accessible domains:`);
      
      domains.forEach((domain, index) => {
        console.log(`  ${index + 1}. ${domain.domain} (Status: ${domain.status})`);
      });
      
      // Check for target domains
      const targetDomains = ['workdoc360.com', 'workdoc360.co.uk'];
      targetDomains.forEach(targetDomain => {
        const found = domains.find(d => d.domain === targetDomain);
        if (found) {
          console.log(`✅ ${targetDomain} is accessible!`);
        } else {
          console.log(`❌ ${targetDomain} NOT accessible`);
        }
      });
      
      // If no target domains found, suggest solution
      if (!domains.some(d => targetDomains.includes(d.domain))) {
        console.log('\n🔧 SOLUTION REQUIRED:');
        console.log('The API key can access domains, but not workdoc360.com or workdoc360.co.uk');
        console.log('This means:');
        console.log('1. API key is from a different GoDaddy account');
        console.log('2. Domain is registered under a different account');
        console.log('3. Need to create API key under the account that owns the domain');
      }
      
    } else {
      const error = await domainsResponse.text();
      console.log('❌ Domains API failed:', error);
      
      if (domainsResponse.status === 403) {
        console.log('\n🔧 DIAGNOSIS: API key lacks domain management permissions');
        console.log('Possible causes:');
        console.log('1. API key created in OTE (test) environment instead of Production');
        console.log('2. API key created under wrong GoDaddy account');
        console.log('3. API key permissions are restricted');
      }
    }
    
  } catch (error) {
    console.error('❌ Domains check failed:', error.message);
  }
  
  // Test 3: Check API environment
  console.log('\n3. Checking API environment...');
  try {
    const shopperResponse = await fetch('https://api.godaddy.com/v1/shoppers/subaccount', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Shopper API status:', shopperResponse.status);
    
    if (shopperResponse.ok) {
      const shopper = await shopperResponse.json();
      console.log('✅ Account info accessible');
      console.log('Customer ID:', shopper.customerId || 'Not available');
    } else {
      console.log('❌ Cannot access account info');
    }
    
  } catch (error) {
    console.log('Account check failed:', error.message);
  }
  
  console.log('\n=====================================');
  console.log('🎯 NEXT STEPS TO FIX:');
  console.log('1. Verify API key was created under correct GoDaddy account');
  console.log('2. Ensure Production environment (not OTE/test)');
  console.log('3. Check domain ownership in the same account');
  console.log('4. Or switch to Cloudflare for more reliable API access');
};

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  diagnoseAPIIssue();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});