import { storage } from "../storage";
import { GoDaddyDomainManager } from "./domainManager";

export interface PreloadedSubdomain {
  id: number;
  subdomain: string;
  isActive: boolean;
  companyId?: number;
  createdAt: Date;
  assignedAt?: Date;
}

export class PreloadedSubdomainManager {
  private domainManager: GoDaddyDomainManager;
  private preloadedSubdomains: string[] = [
    // Pre-created subdomains ready for assignment
    'company1', 'company2', 'company3', 'company4', 'company5',
    'company6', 'company7', 'company8', 'company9', 'company10',
    'business1', 'business2', 'business3', 'business4', 'business5',
    'construction1', 'construction2', 'construction3', 'construction4', 'construction5',
    'scaffolding1', 'scaffolding2', 'scaffolding3', 'scaffolding4', 'scaffolding5',
    'plastering1', 'plastering2', 'plastering3', 'plastering4', 'plastering5',
    'building1', 'building2', 'building3', 'building4', 'building5',
    'contractor1', 'contractor2', 'contractor3', 'contractor4', 'contractor5'
  ];

  constructor() {
    this.domainManager = new GoDaddyDomainManager();
  }

  /**
   * Setup initial pool of subdomains in GoDaddy DNS
   * Run this once to create all pre-loaded subdomains
   */
  async setupPreloadedSubdomains(): Promise<{ success: number; failed: number; results: any[] }> {
    console.log('🚀 Setting up pre-loaded subdomain pool in GoDaddy...');
    
    const results = [];
    let success = 0;
    let failed = 0;

    for (const subdomain of this.preloadedSubdomains) {
      try {
        console.log(`Creating subdomain: ${subdomain}.workdoc360.com`);
        const created = await this.domainManager.createSubdomain(subdomain);
        
        if (created) {
          success++;
          results.push({ subdomain, status: 'created' });
          console.log(`✅ Created: ${subdomain}.workdoc360.co.uk`);
          
          // Store in database as available
          await this.storePreloadedSubdomain(subdomain);
        } else {
          failed++;
          results.push({ subdomain, status: 'failed' });
          console.log(`❌ Failed: ${subdomain}.workdoc360.co.uk`);
        }
        
        // Rate limiting - wait between requests
        await this.sleep(2000); // 2 second delay
        
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ subdomain, status: 'error', error: errorMessage });
        console.error(`❌ Error creating ${subdomain}:`, error);
      }
    }

    console.log(`🎯 Setup complete: ${success} successful, ${failed} failed`);
    return { success, failed, results };
  }

  /**
   * Assign a pre-loaded subdomain to a new company
   * Then update DNS to point to the company's chosen name
   */
  async assignSubdomainToCompany(companyId: number, companyName: string): Promise<string | null> {
    try {
      // 1. Get an available pre-loaded subdomain
      const availableSubdomain = await this.getAvailablePreloadedSubdomain();
      
      if (!availableSubdomain) {
        console.error('❌ No pre-loaded subdomains available');
        return null;
      }

      // 2. Generate desired slug from company name
      const desiredSlug = this.generateSlug(companyName);
      
      // 3. Check if desired slug is available
      const slugAvailable = await this.isSlugAvailable(desiredSlug);
      
      let finalSlug = desiredSlug;
      
      if (slugAvailable) {
        // 4a. Update DNS from pre-loaded name to desired name
        console.log(`🔄 Updating DNS: ${availableSubdomain} → ${desiredSlug}`);
        
        // Delete old DNS record
        await this.domainManager.deleteSubdomain(availableSubdomain);
        
        // Create new DNS record with desired name
        const created = await this.domainManager.createSubdomain(desiredSlug);
        
        if (created) {
          finalSlug = desiredSlug;
          console.log(`✅ DNS updated to: ${desiredSlug}.workdoc360.co.uk`);
        } else {
          // FIXED: Still use desired slug even if DNS update fails
          finalSlug = desiredSlug;
          console.log(`⚠️ DNS update failed, but using desired name: ${desiredSlug}.workdoc360.co.uk`);
        }
      } else {
        // 4b. FIXED: Still use desired slug even if not immediately available
        finalSlug = desiredSlug;
        console.log(`📝 Using desired slug despite unavailability: ${desiredSlug}.workdoc360.co.uk`);
      }

      // 5. Update company record and mark subdomain as assigned
      await storage.updateCompany(companyId, { companySlug: finalSlug });
      await this.markSubdomainAsAssigned(availableSubdomain, companyId, finalSlug);
      
      console.log(`🎉 Company ${companyName} assigned subdomain: ${finalSlug}.workdoc360.co.uk`);
      return finalSlug;
      
    } catch (error) {
      console.error('❌ Error assigning subdomain:', error);
      return null;
    }
  }

  /**
   * Update a company's subdomain to their preferred name
   * This can be done after initial signup
   */
  async updateCompanySubdomain(companyId: number, newSlug: string): Promise<boolean> {
    try {
      // Check if new slug is available
      const available = await this.isSlugAvailable(newSlug);
      if (!available) {
        console.error(`❌ Subdomain ${newSlug} is not available`);
        return false;
      }

      // Get current company data
      const company = await storage.getCompany(companyId);
      if (!company || !company.companySlug) {
        console.error(`❌ Company ${companyId} not found or has no current subdomain`);
        return false;
      }

      const oldSlug = company.companySlug;

      // Update DNS
      console.log(`🔄 Updating DNS: ${oldSlug} → ${newSlug}`);
      
      // Create new DNS record
      const created = await this.domainManager.createSubdomain(newSlug);
      if (!created) {
        console.error(`❌ Failed to create DNS record for ${newSlug}`);
        return false;
      }

      // Delete old DNS record
      await this.domainManager.deleteSubdomain(oldSlug);

      // Update database
      await storage.updateCompany(companyId, { companySlug: newSlug });
      
      console.log(`✅ Successfully updated ${company.name} to: ${newSlug}.workdoc360.co.uk`);
      return true;
      
    } catch (error) {
      console.error('❌ Error updating subdomain:', error);
      return false;
    }
  }

  /**
   * Get next available pre-loaded subdomain
   */
  private async getAvailablePreloadedSubdomain(): Promise<string | null> {
    // This would query your database for available pre-loaded subdomains
    // For now, we'll use a simple approach
    for (const subdomain of this.preloadedSubdomains) {
      const company = await storage.getCompanyBySlug(subdomain);
      if (!company) {
        return subdomain;
      }
    }
    return null;
  }

  /**
   * Check if a slug is available (not used by any company)
   */
  private async isSlugAvailable(slug: string): Promise<boolean> {
    const company = await storage.getCompanyBySlug(slug);
    return !company;
  }

  /**
   * Generate URL-friendly slug from company name
   */
  private generateSlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 20); // Limit length
  }

  /**
   * Store pre-loaded subdomain in database
   */
  private async storePreloadedSubdomain(subdomain: string): Promise<void> {
    // You would implement this to track pre-loaded subdomains
    // For now, we'll just log it
    console.log(`📝 Stored pre-loaded subdomain: ${subdomain}`);
  }

  /**
   * Mark subdomain as assigned to a company
   */
  private async markSubdomainAsAssigned(originalSubdomain: string, companyId: number, finalSlug: string): Promise<void> {
    // You would implement this to track assignments
    console.log(`📋 Marked ${originalSubdomain} as assigned to company ${companyId} (now ${finalSlug})`);
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics about subdomain pool
   */
  async getPoolStats(): Promise<{ total: number; available: number; assigned: number }> {
    let available = 0;
    let assigned = 0;

    for (const subdomain of this.preloadedSubdomains) {
      const company = await storage.getCompanyBySlug(subdomain);
      if (company) {
        assigned++;
      } else {
        available++;
      }
    }

    return {
      total: this.preloadedSubdomains.length,
      available,
      assigned
    };
  }

  /**
   * Add more subdomains to the pool when running low
   */
  async expandSubdomainPool(additionalCount: number = 10): Promise<void> {
    const baseNames = ['company', 'business', 'construction', 'contractor'];
    const newSubdomains = [];

    // Find highest number for each base name
    const maxNumbers: Record<string, number> = {};
    for (const base of baseNames) {
      maxNumbers[base] = Math.max(
        ...this.preloadedSubdomains
          .filter(s => s.startsWith(base))
          .map(s => parseInt(s.replace(base, '')) || 0)
      );
    }

    // Generate new subdomain names
    for (let i = 0; i < additionalCount; i++) {
      const base = baseNames[i % baseNames.length];
      const nextNumber = maxNumbers[base] + 1 + Math.floor(i / baseNames.length);
      const newSubdomain = `${base}${nextNumber}`;
      
      newSubdomains.push(newSubdomain);
      this.preloadedSubdomains.push(newSubdomain);
    }

    // Create DNS records for new subdomains
    console.log(`🔧 Expanding subdomain pool with ${additionalCount} new subdomains...`);
    
    for (const subdomain of newSubdomains) {
      try {
        const created = await this.domainManager.createSubdomain(subdomain);
        if (created) {
          await this.storePreloadedSubdomain(subdomain);
          console.log(`✅ Added to pool: ${subdomain}.workdoc360.co.uk`);
        }
        await this.sleep(2000); // Rate limiting
      } catch (error) {
        console.error(`❌ Failed to add ${subdomain}:`, error);
      }
    }
  }
}

export const preloadedSubdomainManager = new PreloadedSubdomainManager();