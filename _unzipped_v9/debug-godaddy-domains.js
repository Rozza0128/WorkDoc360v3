// Debug script to check what domains are accessible
const debugGoDaddyDomains = async () => {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Missing GoDaddy API credentials');
    return;
  }
  
  console.log('🔍 Checking accessible domains with current API key...');
  
  try {
    const response = await fetch('https://api.godaddy.com/v1/domains', {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const domains = await response.json();
      console.log('✅ API connection successful!');
      console.log(`Found ${domains.length} domains:`);
      
      domains.forEach((domain, index) => {
        console.log(`${index + 1}. ${domain.domain} (Status: ${domain.status})`);
      });
      
      // Check if workdoc360.co.uk is in the list
      const targetDomain = domains.find(d => d.domain === 'workdoc360.co.uk');
      if (targetDomain) {
        console.log('\n✅ workdoc360.co.uk found in accessible domains!');
        console.log('Domain details:', targetDomain);
      } else {
        console.log('\n❌ workdoc360.co.uk NOT found in accessible domains');
        console.log('This explains the ACCESS_DENIED error');
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  debugGoDaddyDomains();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
});