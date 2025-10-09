import { storage } from '../storage';
import type { Company } from '@shared/schema';

interface CloudflareAPIResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result?: any;
}

interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

/**
 * Cloudflare Subdomain Management Service
 * Handles automated subdomain creation for paying customers
 */
export class CloudflareSubdomainManager {
  private apiToken: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';
  private targetIP = 'workdoc360.com'; // Main domain that subdomains will point to

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';

    if (!this.apiToken) {
      throw new Error('CLOUDFLARE_API_TOKEN environment variable is required');
    }
    if (!this.zoneId) {
      throw new Error('CLOUDFLARE_ZONE_ID environment variable is required');
    }
  }

  /**
   * Create a subdomain for a paying customer
   * @param businessName - The business name to create subdomain from
   * @param companyId - The company ID to associate with the subdomain
   * @returns The created subdomain URL
   */
  async createSubdomainForCustomer(businessName: string, companyId: number): Promise<string> {
    try {
      // Generate a clean subdomain slug
      const subdomain = this.generateSubdomainSlug(businessName);

      // Check if subdomain already exists
      const existingRecord = await this.checkSubdomainExists(subdomain);
      if (existingRecord) {
        throw new Error(`Subdomain ${subdomain} already exists`);
      }

      // Create CNAME record pointing to main domain
      const record = await this.createDNSRecord(subdomain, 'CNAME', 'workdoc360.com');

      // Update company record with subdomain
      await storage.updateCompanySubdomain(companyId, subdomain);

      console.log(`✅ Created subdomain: ${subdomain}.workdoc360.com for company ID ${companyId}`);

      return `${subdomain}.workdoc360.com`;
    } catch (error) {
      console.error('Error creating subdomain:', error);
      throw error;
    }
  }

  /**
   * Generate a clean subdomain slug from business name
   */
  private generateSubdomainSlug(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
      .replace(/\s+/g, '') // Remove spaces
      .slice(0, 20); // Limit length
  }

  /**
   * Check if a subdomain already exists
   */
  private async checkSubdomainExists(subdomain: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/dns_records?name=${subdomain}.workdoc360.com`,
        {
          headers: ({
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          } as unknown) as HeadersInit,
        }
      );

      const data: CloudflareAPIResponse = await response.json();
      return data.success && data.result && data.result.length > 0;
    } catch (error) {
      console.error('Error checking subdomain existence:', error);
      return false;
    }
  }

  /**
   * Create a DNS record in Cloudflare
   */
  private async createDNSRecord(
    subdomain: string,
    type: 'A' | 'CNAME',
    content: string
  ): Promise<CloudflareRecord> {
    const recordData = {
      type,
      name: `${subdomain}.workdoc360.com`,
      content,
      ttl: 300, // 5 minutes TTL for fast propagation
    };

    const response = await fetch(
      `${this.baseUrl}/zones/${this.zoneId}/dns_records`,
      {
        method: 'POST',
        headers: ({
          'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
          'X-Auth-Key': this.apiToken,
          'Content-Type': 'application/json',
        } as unknown) as HeadersInit,
        body: JSON.stringify(recordData),
      }
    );

    const data: CloudflareAPIResponse = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }

    return data.result;
  }

  /**
   * Delete a subdomain (for testing or subscription cancellation)
   */
  async deleteSubdomain(subdomain: string): Promise<boolean> {
    try {
      // Find the record first
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/dns_records?name=${subdomain}.workdoc360.com`,
        {
          headers: ({
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          } as unknown) as HeadersInit,
        }
      );

      const data: CloudflareAPIResponse = await response.json();

      if (!data.success || !data.result || data.result.length === 0) {
        console.log(`No DNS record found for ${subdomain}`);
        return false;
      }

      // Delete the record
      const recordId = data.result[0].id;
      const deleteResponse = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/dns_records/${recordId}`,
        {
          method: 'DELETE',
          headers: ({
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          } as unknown) as HeadersInit,
        }
      );

      const deleteData: CloudflareAPIResponse = await deleteResponse.json();

      if (deleteData.success) {
        console.log(`✅ Deleted subdomain: ${subdomain}.workdoc360.com`);
        return true;
      } else {
        console.error('Error deleting subdomain:', deleteData.errors);
        return false;
      }
    } catch (error) {
      console.error('Error deleting subdomain:', error);
      return false;
    }
  }

  /**
   * List all subdomains for the domain
   */
  async listSubdomains(): Promise<CloudflareRecord[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/dns_records?per_page=100`,
        {
          headers: ({
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          } as unknown) as HeadersInit,
        }
      );

      const data: CloudflareAPIResponse = await response.json();

      if (data.success && data.result) {
        return data.result.filter((record: CloudflareRecord) =>
          record.name.includes('workdoc360.com') &&
          record.name !== 'workdoc360.com' &&
          record.name !== 'www.workdoc360.com'
        );
      }

      return [];
    } catch (error) {
      console.error('Error listing subdomains:', error);
      return [];
    }
  }
}

// Export singleton instance
export const cloudflareSubdomainManager = new CloudflareSubdomainManager();