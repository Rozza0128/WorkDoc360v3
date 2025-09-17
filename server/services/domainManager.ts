import { storage } from "../storage";

export interface DomainProvider {
  createSubdomain(subdomain: string): Promise<boolean>;
  deleteSubdomain(subdomain: string): Promise<boolean>;
  validateSubdomain(subdomain: string): boolean;
}

// Cloudflare DNS API implementation (recommended for automation)
export class CloudflareDomainManager implements DomainProvider {
  private apiToken: string;
  private zoneId: string;
  private baseDomain: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
    this.baseDomain = process.env.BASE_DOMAIN || 'workdoc360.co.uk';
  }

  async createSubdomain(subdomain: string): Promise<boolean> {
    if (!this.apiToken || !this.zoneId) {
      console.error('Cloudflare credentials not configured');
      return false;
    }

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'A',
          name: `${subdomain}.${this.baseDomain}`,
          content: process.env.REPLIT_IP || '0.0.0.0', // Will be set when deployed
          ttl: 300, // 5 minutes for quick updates
          proxied: true // Cloudflare proxy for SSL and performance
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created subdomain: ${subdomain}.${this.baseDomain}`);
        return true;
      } else {
        console.error('❌ Failed to create subdomain:', result.errors);
        return false;
      }
    } catch (error) {
      console.error('❌ Domain creation error:', error);
      return false;
    }
  }

  async deleteSubdomain(subdomain: string): Promise<boolean> {
    if (!this.apiToken || !this.zoneId) return false;

    try {
      // First, find the DNS record
      const listResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records?name=${subdomain}.${this.baseDomain}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const listResult = await listResponse.json();
      
      if (listResult.success && listResult.result.length > 0) {
        const recordId = listResult.result[0].id;
        
        // Delete the DNS record
        const deleteResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${recordId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const deleteResult = await deleteResponse.json();
        return deleteResult.success;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Domain deletion error:', error);
      return false;
    }
  }

  validateSubdomain(subdomain: string): boolean {
    // Check if subdomain is valid format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) return false;
    
    // Check length constraints
    if (subdomain.length < 3 || subdomain.length > 30) return false;
    
    // Check for reserved words
    const reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'support', 'help'];
    if (reserved.includes(subdomain)) return false;
    
    return true;
  }
}

// GoDaddy DNS API implementation (backup option)
export class GoDaddyDomainManager implements DomainProvider {
  private apiKey: string;
  private apiSecret: string;
  private baseDomain: string;

  constructor() {
    this.apiKey = process.env.GODADDY_API_KEY || '';
    this.apiSecret = process.env.GODADDY_API_SECRET || '';
    this.baseDomain = 'workdoc360.com';
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('GoDaddy API credentials not found. Please add GODADDY_API_KEY and GODADDY_API_SECRET to environment variables.');
    }
    
    console.log('✅ GoDaddy API credentials loaded successfully');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.godaddy.com/v1/domains', {
        method: 'GET',
        headers: {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('GoDaddy API test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('GoDaddy API connection test failed:', error);
      return false;
    }
  }

  async createSubdomain(subdomain: string): Promise<boolean> {

    try {
      const response = await fetch(
        `https://api.godaddy.com/v1/domains/${this.baseDomain}/records/A/${subdomain}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            data: '34.117.33.233',
            ttl: 3600
          }])
        }
      );

      if (response.ok) {
        console.log(`✅ Created subdomain: ${subdomain}.${this.baseDomain}`);
        return true;
      } else {
        console.error('❌ Failed to create subdomain:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Domain creation error:', error);
      return false;
    }
  }

  async deleteSubdomain(subdomain: string): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) return false;

    try {
      const response = await fetch(
        `https://api.godaddy.com/v1/domains/${this.baseDomain}/records/A/${subdomain}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('❌ Domain deletion error:', error);
      return false;
    }
  }

  validateSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9-]+$/;
    return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
  }
}

// Domain manager factory
export function createDomainManager(): DomainProvider {
  const provider = process.env.DNS_PROVIDER || 'cloudflare';
  
  switch (provider) {
    case 'godaddy':
      return new GoDaddyDomainManager();
    case 'cloudflare':
    default:
      return new CloudflareDomainManager();
  }
}

// Automated subdomain creation service
export class AutomatedSubdomainService {
  private domainManager: DomainProvider;

  constructor() {
    this.domainManager = createDomainManager();
  }

  async createCompanySubdomain(companyId: number, companyName: string): Promise<string | null> {
    // Generate slug from company name
    const baseSlug = this.generateSlug(companyName);
    let slug = baseSlug;
    let attempt = 0;

    // Try to find available slug
    while (attempt < 5) {
      if (attempt > 0) {
        slug = `${baseSlug}${attempt}`;
      }

      // Check if slug is valid
      if (!this.domainManager.validateSubdomain(slug)) {
        attempt++;
        continue;
      }

      // Check if slug exists in database
      const existingCompany = await storage.getCompanyBySlug(slug);
      if (!existingCompany) {
        // Try to create DNS record
        const dnsCreated = await this.domainManager.createSubdomain(slug);
        
        if (dnsCreated) {
          // Update company with slug
          await storage.updateCompany(companyId, { companySlug: slug });
          
          console.log(`✅ Company ${companyName} now available at: ${slug}.workdoc360.co.uk`);
          return slug;
        }
      }
      
      attempt++;
    }

    console.error(`❌ Failed to create subdomain for ${companyName} after ${attempt} attempts`);
    return null;
  }

  async deleteCompanySubdomain(companySlug: string): Promise<boolean> {
    try {
      const success = await this.domainManager.deleteSubdomain(companySlug);
      
      if (success) {
        console.log(`✅ Deleted subdomain: ${companySlug}.workdoc360.co.uk`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Failed to delete subdomain ${companySlug}:`, error);
      return false;
    }
  }

  private generateSlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 20); // Limit length
  }

  async checkSubdomainAvailability(slug: string): Promise<boolean> {
    if (!this.domainManager.validateSubdomain(slug)) {
      return false;
    }

    const existingCompany = await storage.getCompanyBySlug(slug);
    return !existingCompany;
  }
}

export const automatedSubdomainService = new AutomatedSubdomainService();