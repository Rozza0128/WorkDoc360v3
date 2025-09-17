/**
 * Comprehensive Cloudflare Setup Diagnostic
 * This script helps identify exactly what's needed to get the automated subdomain system working
 */

console.log('🔍 Cloudflare Configuration Diagnostic');
console.log('=======================================');

// Check credentials format
console.log('\n1. Credential Format Check');
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (apiToken) {
  console.log(`✅ API Token length: ${apiToken.length} characters`);
  console.log(`✅ API Token format: ${apiToken.substring(0, 10)}...${apiToken.substring(apiToken.length - 10)}`);
} else {
  console.log('❌ CLOUDFLARE_API_TOKEN not found');
}

if (zoneId) {
  console.log(`✅ Zone ID length: ${zoneId.length} characters`);
  console.log(`✅ Zone ID format: ${zoneId}`);
} else {
  console.log('❌ CLOUDFLARE_ZONE_ID not found');
}

// Test basic authentication
console.log('\n2. Testing Cloudflare Authentication');

async function testAuth() {
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ API Token is valid');
      console.log(`   Token ID: ${data.result.id}`);
      console.log(`   Status: ${data.result.status}`);
    } else {
      console.log(`❌ API Token validation failed: ${JSON.stringify(data.errors || data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return false;
  }
  
  return true;
}

// Test zone access
console.log('\n3. Testing Zone Access');

async function testZoneAccess() {
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Zone access successful');
      console.log(`   Zone name: ${data.result.name}`);
      console.log(`   Zone status: ${data.result.status}`);
      console.log(`   Zone type: ${data.result.type}`);
      return true;
    } else {
      console.log(`❌ Zone access failed (${response.status}): ${JSON.stringify(data.errors || data)}`);
      
      if (response.status === 403) {
        console.log('   This usually means:');
        console.log('   - The API token doesn\'t have Zone:Edit permissions');
        console.log('   - The token is not associated with this zone');
      } else if (response.status === 404) {
        console.log('   This usually means:');
        console.log('   - The Zone ID is incorrect');
        console.log('   - The zone doesn\'t exist in your account');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`❌ Zone access test failed: ${error.message}`);
    return false;
  }
}

// List zones in account
console.log('\n4. Listing Available Zones');

async function listZones() {
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Found ${data.result.length} zones in your account:`);
      data.result.forEach(zone => {
        console.log(`   - ${zone.name} (ID: ${zone.id}) [${zone.status}]`);
        if (zone.name === 'workdoc360.com') {
          console.log(`     ⭐ This should be your Zone ID: ${zone.id}`);
        }
      });
      return data.result;
    } else {
      console.log(`❌ Failed to list zones: ${JSON.stringify(data.errors || data)}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Zone listing failed: ${error.message}`);
    return [];
  }
}

// Main diagnostic function
async function runDiagnostic() {
  console.log('\n🚀 Running Complete Diagnostic...\n');
  
  if (!apiToken || !zoneId) {
    console.log('❌ Missing credentials. Please ensure both CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are set.');
    return;
  }
  
  const authValid = await testAuth();
  const zones = await listZones();
  const zoneAccess = await testZoneAccess();
  
  console.log('\n📊 Diagnostic Summary');
  console.log('=====================');
  console.log(`Credentials Present: ${apiToken && zoneId ? '✅' : '❌'}`);
  console.log(`Authentication: ${authValid ? '✅' : '❌'}`);
  console.log(`Zone Access: ${zoneAccess ? '✅' : '❌'}`);
  
  if (authValid && zoneAccess) {
    console.log('\n🎉 All tests passed! Your Cloudflare setup is working correctly.');
    console.log('The subdomain automation system is ready to create customer portals.');
  } else {
    console.log('\n🔧 Next Steps to Fix:');
    
    if (!authValid) {
      console.log('1. Check your API Token:');
      console.log('   - Go to https://dash.cloudflare.com/profile/api-tokens');
      console.log('   - Ensure the token has Zone:Edit permissions');
      console.log('   - Regenerate the token if needed');
    }
    
    if (!zoneAccess && zones.length > 0) {
      console.log('2. Check your Zone ID:');
      const workdocZone = zones.find(z => z.name === 'workdoc360.com');
      if (workdocZone) {
        console.log(`   - Use this Zone ID: ${workdocZone.id}`);
      } else {
        console.log('   - workdoc360.com not found in your account');
        console.log('   - Available zones listed above');
      }
    }
  }
  
  return { authValid, zoneAccess, zones };
}

// Execute diagnostic
runDiagnostic().catch(console.error);