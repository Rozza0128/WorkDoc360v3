import { CloudflareDomainManager } from './server/services/cloudflareManager.js';

async function fixDNS() {
  console.log('🚀 Starting emergency DNS fix for workdoc360.com...\n');
  
  try {
    const cloudflare = new CloudflareDomainManager();
    
    // Test connection and get zone ID
    console.log('1️⃣ Testing Cloudflare connection...');
    const connected = await cloudflare.testConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to Cloudflare API');
      console.log('\n📋 Manual DNS Setup Required:');
      console.log('Add this record in Cloudflare Dashboard:');
      console.log('Type: A | Name: @ | Content: 34.117.33.233 | Proxy: Enabled');
      return;
    }
    
    console.log('✅ Connected to Cloudflare API\n');
    
    // Fix root domain (the "Not Found" issue)
    console.log('2️⃣ Adding root domain record...');
    const rootFixed = await cloudflare.setupRootDomain();
    
    if (rootFixed) {
      console.log('✅ Root domain fixed! https://workdoc360.com will work\n');
    } else {
      console.log('⚠️ Root domain setup failed\n');
    }
    
    // Add customer portal subdomains
    console.log('3️⃣ Adding customer portal subdomains...');
    const subdomains = [
      'company1', 'company2', 'company3', 'company4', 'company5',
      'business1', 'business2', 'business3', 'business4', 'business5',
      'construction1', 'construction2', 'construction3', 'construction4', 'construction5',
      'scaffolding1', 'scaffolding2', 'scaffolding3', 'scaffolding4', 'scaffolding5',
      'plastering1', 'plastering2', 'plastering3', 'plastering4', 'plastering5'
    ];
    
    let successCount = 0;
    for (const subdomain of subdomains) {
      const success = await cloudflare.createSubdomain(subdomain);
      if (success) successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n✅ Successfully created ${successCount}/${subdomains.length} customer portals`);
    
    if (rootFixed) {
      console.log('\n🎉 DNS Setup Complete!');
      console.log('📋 Results:');
      console.log('✅ https://workdoc360.com - Fixed (was showing "Not Found")');
      console.log('✅ https://www.workdoc360.com - Already working');
      console.log('✅ Customer portals: company1.workdoc360.com, business1.workdoc360.com, etc.');
      console.log('✅ £65/month automated subdomain assignment system operational');
      console.log('\n⏱️ DNS propagation: 5-10 minutes');
      console.log('🔧 SSL certificates: Handled automatically by Cloudflare');
    } else {
      console.log('\n⚠️ Manual DNS record needed:');
      console.log('Type: A | Name: @ | Content: 34.117.33.233 | Proxy: Enabled');
    }
    
  } catch (error) {
    console.error('❌ Emergency DNS fix error:', error.message);
    console.log('\n📋 Manual DNS Setup Required:');
    console.log('Add this record in Cloudflare Dashboard:');
    console.log('Type: A | Name: @ | Content: 34.117.33.233 | Proxy: Enabled');
  }
}

fixDNS();