import { storage } from '../storage';
import { cloudflareSubdomainManager } from './cloudflareSubdomainManager';

/**
 * Integration service for automated subdomain creation upon payment
 * This handles the complete workflow from payment to subdomain assignment
 */
export class PaymentSubdomainIntegration {
  
  /**
   * Complete workflow for new paying customer
   * Called when customer completes £65/month payment
   */
  async createCustomerPortal(customerData: {
    email: string;
    businessName: string;
    tradeType: string;
    paymentAmount: number;
    paymentCurrency: string;
  }): Promise<{
    success: boolean;
    subdomainUrl?: string;
    companyId?: number;
    error?: string;
  }> {
    try {
      console.log(`🚀 Starting customer portal creation for ${customerData.email}`);
      
      // Step 1: Verify payment amount (£65 minimum)
      const minimumAmount = 6500; // £65 in pence
      if (customerData.paymentAmount < minimumAmount) {
        throw new Error(`Payment amount £${customerData.paymentAmount/100} is below minimum £65`);
      }
      
      // Step 2: Find or create user account
      let user = await storage.getUserByEmail(customerData.email);
      if (!user) {
        console.log(`Creating new user account for ${customerData.email}`);
        user = await storage.createUser({
          email: customerData.email,
          password: 'temp-password-will-be-reset', // Will be set during account setup
          firstName: customerData.businessName.split(' ')[0] || 'Business',
          lastName: 'Owner',
          emailVerified: true,
          selectedPlan: 'professional',
          planStatus: 'active'
        });
      }
      
      // Step 3: Create company for the business
      const company = await storage.createCompany({
        name: customerData.businessName,
        businessType: customerData.tradeType,
        ownerId: user.id,
        companySlug: '' // Will be set by subdomain creation
      });
      
      console.log(`✅ Created company: ${company.name} (ID: ${company.id})`);
      
      // Step 4: Create Cloudflare subdomain
      const subdomainUrl = await cloudflareSubdomainManager.createSubdomainForCustomer(
        customerData.businessName,
        company.id
      );
      
      console.log(`🌐 Subdomain created: ${subdomainUrl}`);
      
      // Step 5: Return success with portal details
      return {
        success: true,
        subdomainUrl,
        companyId: company.id
      };
      
    } catch (error) {
      console.error('Error creating customer portal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Simulate a payment webhook for testing
   * This shows how the system responds to actual payment events
   */
  async simulatePaymentWorkflow(testData: {
    businessName: string;
    email: string;
    tradeType: string;
  }): Promise<string> {
    console.log(`🧪 TESTING: Simulating payment workflow for ${testData.businessName}`);
    
    const result = await this.createCustomerPortal({
      email: testData.email,
      businessName: testData.businessName,
      tradeType: testData.tradeType,
      paymentAmount: 6500, // £65
      paymentCurrency: 'GBP'
    });
    
    if (result.success) {
      return `SUCCESS: Customer portal created at ${result.subdomainUrl}`;
    } else {
      throw new Error(`FAILED: ${result.error}`);
    }
  }
  
  /**
   * Get portal status for a customer
   */
  async getCustomerPortalStatus(email: string): Promise<{
    hasPortal: boolean;
    subdomainUrl?: string;
    companyName?: string;
    subscriptionStatus?: string;
  }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { hasPortal: false };
      }
      
      const companies = await storage.getCompaniesByUserId(user.id);
      const activeCompany = companies[0]; // Use first company for now
      
      if (activeCompany && activeCompany.companySlug) {
        return {
          hasPortal: true,
          subdomainUrl: `${activeCompany.companySlug}.workdoc360.com`,
          companyName: activeCompany.name,
          subscriptionStatus: 'active'
        };
      }
      
      return { hasPortal: false };
    } catch (error) {
      console.error('Error checking portal status:', error);
      return { hasPortal: false };
    }
  }
}

export const paymentSubdomainIntegration = new PaymentSubdomainIntegration();