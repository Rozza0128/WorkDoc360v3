import { Router } from 'express';
import { CloudflareDomainManager } from '../services/cloudflareManager';

const router = Router();

// Test Cloudflare API connection and setup
router.post('/test-cloudflare-setup', async (req, res) => {
  try {
    console.log('🧪 Testing Cloudflare API setup...');
    
    const cloudflareManager = new CloudflareDomainManager();
    const connected = await cloudflareManager.testConnection();
    
    if (!connected) {
      return res.status(400).json({
        success: false,
        message: 'Cloudflare API connection failed',
        details: 'Verify CLOUDFLARE_API_TOKEN is correct and workdoc360.com zone exists'
      });
    }

    // Test creating a subdomain
    const testSubdomain = 'cf-test-' + Date.now();
    console.log(`Creating test subdomain: ${testSubdomain}.workdoc360.com`);
    
    const testCreate = await cloudflareManager.createSubdomain(testSubdomain);
    if (!testCreate) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create test subdomain',
        details: 'API connection works but DNS record creation failed'
      });
    }

    console.log('✅ Test subdomain created successfully!');
    
    // Clean up test subdomain
    await cloudflareManager.deleteSubdomain(testSubdomain);
    console.log('🧹 Test subdomain cleaned up');

    res.json({
      success: true,
      message: 'Cloudflare API setup verified successfully!',
      details: {
        connectionTest: 'passed',
        dnsCreation: 'passed',
        apiEndpoint: 'https://api.cloudflare.com/client/v4',
        domain: 'workdoc360.com',
        replitIP: '34.117.33.233'
      }
    });

  } catch (error: any) {
    console.error('❌ Cloudflare setup test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Setup test failed',
      error: error.message
    });
  }
});

// Setup subdomain pool using Cloudflare
router.post('/setup-cloudflare-subdomains', async (req, res) => {
  try {
    console.log('🚀 Setting up subdomain pool with Cloudflare...');
    
    const cloudflareManager = new CloudflareDomainManager();
    const connected = await cloudflareManager.testConnection();
    
    if (!connected) {
      return res.status(400).json({
        success: false,
        message: 'Cloudflare connection failed'
      });
    }

    // Setup root domain
    console.log('📡 Configuring root domain...');
    await cloudflareManager.setupRootDomain();

    // Setup subdomain pool
    const subdomains = [
      'company1', 'company2', 'company3', 'company4', 'company5',
      'business1', 'business2', 'business3', 'business4', 'business5',
      'construction1', 'construction2', 'construction3', 'construction4', 'construction5',
      'scaffolding1', 'scaffolding2', 'scaffolding3', 'scaffolding4', 'scaffolding5',
      'plastering1', 'plastering2', 'plastering3', 'plastering4', 'plastering5'
    ];

    let success = 0;
    let failed = 0;

    for (const subdomain of subdomains) {
      try {
        console.log(`Creating subdomain: ${subdomain}.workdoc360.com`);
        const created = await cloudflareManager.createSubdomain(subdomain);
        
        if (created) {
          success++;
          console.log(`✅ Success: ${subdomain}.workdoc360.com`);
        } else {
          failed++;
          console.log(`❌ Failed: ${subdomain}.workdoc360.com`);
        }
      } catch (error: any) {
        failed++;
        console.error(`❌ Error creating ${subdomain}:`, error.message);
      }
    }

    console.log(`🎯 Setup complete: ${success} successful, ${failed} failed`);

    res.json({
      success: true,
      message: `Cloudflare subdomain pool setup complete!`,
      details: {
        successful: success,
        failed: failed,
        total: subdomains.length,
        provider: 'Cloudflare'
      }
    });

  } catch (error: any) {
    console.error('❌ Cloudflare subdomain setup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Subdomain setup failed',
      error: error.message
    });
  }
});

export default router;