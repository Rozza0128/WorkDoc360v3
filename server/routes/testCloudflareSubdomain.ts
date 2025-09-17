import { Router } from 'express';
import { cloudflareSubdomainManager } from '../services/cloudflareSubdomainManager';
import { paymentSubdomainIntegration } from '../services/paymentSubdomainIntegration';

const router = Router();

/**
 * Test endpoint to verify Cloudflare subdomain automation is working
 * This endpoint simulates the complete customer payment workflow
 */
router.post('/simulate-customer-signup', async (req, res) => {
  try {
    console.log('🧪 Testing complete customer signup workflow...');
    
    // Test data for a fictional scaffolding company
    const testCustomer = {
      businessName: "Test Scaffolding Solutions Ltd",
      email: `test-${Date.now()}@scaffolding.co.uk`,
      tradeType: "scaffolding"
    };
    
    console.log(`Testing with: ${testCustomer.businessName}`);
    
    // First, test Cloudflare connection
    try {
      const subdomains = await cloudflareSubdomainManager.listSubdomains();
      console.log(`✅ Cloudflare connected - Found ${subdomains.length} existing subdomains`);
    } catch (error) {
      throw new Error(`Cloudflare connection failed: ${error}`);
    }
    
    // Simulate the full payment workflow
    const result = await paymentSubdomainIntegration.simulatePaymentWorkflow(testCustomer);
    
    res.json({
      success: true,
      message: 'Customer signup test completed successfully',
      testData: testCustomer,
      result: result,
      instructions: [
        `Test customer portal should be available at: testscaffoldingsolutions.workdoc360.com`,
        `All customer data will be isolated to their subdomain`,
        `You can now set up real payment webhooks to automate this process`
      ]
    });
    
  } catch (error) {
    console.error('❌ Customer signup test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check CLOUDFLARE_API_TOKEN is valid',
        'Verify CLOUDFLARE_ZONE_ID is correct for workdoc360.com',
        'Ensure Cloudflare API permissions include Zone:Edit'
      ]
    });
  }
});

/**
 * Test Cloudflare connection and list existing subdomains
 */
router.get('/cloudflare-status', async (req, res) => {
  try {
    const subdomains = await cloudflareSubdomainManager.listSubdomains();
    
    res.json({
      success: true,
      cloudflareConnected: true,
      existingSubdomains: subdomains.length,
      subdomainList: subdomains.slice(0, 10).map(s => ({
        name: s.name,
        type: s.type,
        content: s.content
      })),
      message: 'Cloudflare connection successful - Ready to create customer subdomains'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      cloudflareConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Cloudflare connection failed - Check API credentials'
    });
  }
});

/**
 * Quick test to create a temporary subdomain
 */
router.post('/create-test-subdomain', async (req, res) => {
  try {
    const { businessName = 'Test Company Ltd' } = req.body;
    
    console.log(`Creating test subdomain for: ${businessName}`);
    
    // Create a temporary subdomain (you can delete this later)
    const subdomainUrl = await cloudflareSubdomainManager.createSubdomainForCustomer(
      `${businessName}-test`,
      999 // Temporary company ID
    );
    
    res.json({
      success: true,
      subdomainUrl,
      message: `Test subdomain created: ${subdomainUrl}`,
      note: 'This is a test subdomain - you can delete it using the delete endpoint'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as testCloudflareRoutes };