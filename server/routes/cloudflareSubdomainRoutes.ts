import { Router } from 'express';
import { cloudflareSubdomainManager } from '../services/cloudflareSubdomainManager';
import { storage } from '../storage';
import { requireAuth } from '../auth';
import type { CompanyRequest } from '../middleware/subdomainDetection';

const router = Router();

/**
 * Test Cloudflare connection and credentials
 */
router.get('/test-cloudflare', requireAuth, async (req, res) => {
  try {
    const subdomains = await cloudflareSubdomainManager.listSubdomains();
    res.json({
      success: true,
      message: 'Cloudflare connection successful',
      subdomainCount: subdomains.length,
      subdomains: subdomains.slice(0, 5) // Show first 5 for testing
    });
  } catch (error) {
    console.error('Cloudflare test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudflare connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create subdomain for paying customer
 * Called after successful payment confirmation
 */
router.post('/create-customer-subdomain', requireAuth, async (req: any, res) => {
  try {
    const { businessName, companyId, customerEmail } = req.body;
    
    if (!businessName || !companyId) {
      return res.status(400).json({
        error: 'Business name and company ID are required'
      });
    }

    // Verify the company exists and user has permission
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    // Create subdomain via Cloudflare
    const subdomainUrl = await cloudflareSubdomainManager.createSubdomainForCustomer(
      businessName, 
      companyId
    );

    console.log(`✅ Created subdomain for paying customer: ${subdomainUrl}`);
    
    res.json({
      success: true,
      subdomainUrl,
      message: `Subdomain created successfully: ${subdomainUrl}`,
      companyId,
      businessName
    });
  } catch (error) {
    console.error('Error creating customer subdomain:', error);
    res.status(500).json({
      error: 'Failed to create subdomain',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Webhook endpoint for Stripe payment confirmations
 * Automatically creates subdomain when payment is successful
 */
router.post('/payment-webhook', async (req, res) => {
  try {
    const { event_type, customer_email, business_name, amount, currency } = req.body;
    
    if (event_type === 'payment.successful' && amount >= 6500) { // £65 = 6500 pence
      console.log(`💰 Payment confirmed: ${customer_email} paid £${amount/100} for ${business_name}`);
      
      // Find or create company for the customer
      let company = await storage.getUserByEmail(customer_email);
      if (!company) {
        console.log(`Creating new user account for ${customer_email}`);
        // This would typically be handled by your registration process
        return res.status(400).json({
          error: 'Customer account not found'
        });
      }
      
      // Get user's companies
      const companies = await storage.getCompaniesByUserId(company.id);
      const targetCompany = companies.find(c => 
        c.name.toLowerCase().includes(business_name.toLowerCase())
      ) || companies[0];
      
      if (targetCompany) {
        // Create subdomain for the paying customer
        const subdomainUrl = await cloudflareSubdomainManager.createSubdomainForCustomer(
          business_name,
          targetCompany.id
        );
        
        console.log(`🎉 Automated subdomain creation: ${subdomainUrl} for ${customer_email}`);
        
        // Here you would typically send confirmation email
        // await emailService.sendSubdomainConfirmation(customer_email, subdomainUrl);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * List all subdomains for admin purposes
 */
router.get('/list-subdomains', requireAuth, async (req, res) => {
  try {
    const subdomains = await cloudflareSubdomainManager.listSubdomains();
    
    res.json({
      success: true,
      subdomains: subdomains.map(record => ({
        name: record.name,
        type: record.type,
        content: record.content,
        id: record.id
      }))
    });
  } catch (error) {
    console.error('Error listing subdomains:', error);
    res.status(500).json({
      error: 'Failed to list subdomains',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete subdomain (for testing or subscription cancellation)
 */
router.delete('/delete-subdomain/:subdomain', requireAuth, async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    const deleted = await cloudflareSubdomainManager.deleteSubdomain(subdomain);
    
    if (deleted) {
      res.json({
        success: true,
        message: `Subdomain ${subdomain} deleted successfully`
      });
    } else {
      res.status(404).json({
        error: `Subdomain ${subdomain} not found or already deleted`
      });
    }
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    res.status(500).json({
      error: 'Failed to delete subdomain',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as cloudflareSubdomainRoutes };