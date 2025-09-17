import { Router } from 'express';
import { GoDaddyDomainManager } from '../services/domainManager';
import { PreloadedSubdomainManager } from '../services/preloadedSubdomainManager';

const router = Router();

// Test GoDaddy API connection and create initial subdomain pool
router.post('/test-godaddy-setup', async (req, res) => {
  try {
    console.log('🧪 Testing GoDaddy API setup...');
    
    const domainManager = new GoDaddyDomainManager();
    
    // Test API connection
    const connectionTest = await domainManager.testConnection();
    if (!connectionTest) {
      return res.status(400).json({
        success: false,
        message: 'GoDaddy API connection failed. Please check your credentials.',
        details: 'Verify GODADDY_API_KEY and GODADDY_API_SECRET are correct and from Production environment.'
      });
    }

    console.log('✅ GoDaddy API connection successful!');

    // Create test subdomain to verify DNS works
    const testSubdomain = 'api-test-' + Date.now();
    console.log(`Creating test subdomain: ${testSubdomain}.workdoc360.com`);
    
    const testCreate = await domainManager.createSubdomain(testSubdomain);
    if (!testCreate) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create test subdomain',
        details: 'API connection works but DNS record creation failed'
      });
    }

    console.log('✅ Test subdomain created successfully!');
    
    // Clean up test subdomain
    await domainManager.deleteSubdomain(testSubdomain);
    console.log('🧹 Test subdomain cleaned up');

    res.json({
      success: true,
      message: 'GoDaddy API setup verified successfully!',
      details: {
        connectionTest: 'passed',
        dnsCreation: 'passed',
        apiEndpoint: 'https://api.godaddy.com/v1',
        domain: 'workdoc360.com',
        replitIP: '34.117.33.233'
      }
    });

  } catch (error: any) {
    console.error('❌ GoDaddy setup test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Setup test failed',
      error: error.message
    });
  }
});

// Initialize pre-loaded subdomain pool
router.post('/setup-subdomain-pool', async (req, res) => {
  try {
    console.log('🚀 Setting up pre-loaded subdomain pool...');
    
    const subdomainManager = new PreloadedSubdomainManager();
    const result = await subdomainManager.setupPreloadedSubdomains();
    
    res.json({
      success: true,
      message: `Subdomain pool setup complete!`,
      details: {
        successful: result.success,
        failed: result.failed,
        total: result.success + result.failed,
        results: result.results
      }
    });

  } catch (error: any) {
    console.error('❌ Subdomain pool setup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Subdomain pool setup failed',
      error: error.message
    });
  }
});

// Fix root domain (workdoc360.com issue)
router.post('/fix-root-domain', async (req, res) => {
  try {
    console.log('🔧 Fixing root domain configuration...');
    
    const domainManager = new GoDaddyDomainManager();
    
    // For workdoc360.com root domain
    const response = await fetch('https://api.godaddy.com/v1/domains/workdoc360.com/records/A/@', {
      method: 'PUT',
      headers: {
        'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        data: '34.117.33.233',
        ttl: 3600
      }])
    });

    if (response.ok) {
      console.log('✅ Root domain configured successfully');
      res.json({
        success: true,
        message: 'Root domain configured successfully',
        details: {
          domain: 'workdoc360.com',
          pointsTo: '34.117.33.233',
          status: 'configured'
        }
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to configure root domain:', errorText);
      res.status(400).json({
        success: false,
        message: 'Failed to configure root domain',
        error: errorText
      });
    }

  } catch (error: any) {
    console.error('❌ Root domain fix failed:', error);
    res.status(500).json({
      success: false,
      message: 'Root domain fix failed',
      error: error.message
    });
  }
});

export default router;