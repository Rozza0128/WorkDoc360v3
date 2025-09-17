/**
 * Create live plastermaster.workdoc360.com demo subdomain
 */

console.log('🎯 Creating Live Demo: plastermaster.workdoc360.com');
console.log('=================================================\n');

async function createLiveDemo() {
  const apiKey = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  console.log('Creating plastermaster.workdoc360.com subdomain...');
  
  try {
    const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: 'plastermaster',
        content: 'workdoc360.com',
        ttl: 300,
        comment: 'Live demo portal for Plaster Master Ltd - £65/month customer'
      })
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ SUCCESS! Live demo subdomain created');
      console.log('==========================================');
      console.log(`🌍 Live URL: https://plastermaster.workdoc360.com`);
      console.log(`📋 DNS Record ID: ${createData.result.id}`);
      console.log(`⚡ Propagation: ~5 minutes worldwide`);
      console.log(`💼 Company: Plaster Master Ltd`);
      console.log(`💰 Subscription: £65/month`);
      console.log('');
      console.log('🎯 Demo Features Available:');
      console.log('• Construction compliance management');
      console.log('• CSCS card verification system');
      console.log('• Document tracking and alerts');
      console.log('• Multi-user company management');
      console.log('• UK construction terminology');
      console.log('• Mobile-optimized interface');
      console.log('');
      console.log('🔗 Test the live subdomain:');
      console.log('Visit: https://plastermaster.workdoc360.com');
      console.log('');
      console.log('This demonstrates the complete automated customer');
      console.log('acquisition flow for £65/month subscriptions!');
      
      return createData.result.id;
    } else {
      console.log('❌ Failed to create subdomain:', createData.errors);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating demo:', error.message);
    return null;
  }
}

createLiveDemo().catch(console.error);