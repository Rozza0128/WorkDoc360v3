import fetch from 'node-fetch';

interface CloudflareRecord {
  type: string;
  name: string;
  content: string;
  ttl: number;
}

export class CloudflareDomainManager {
  private apiToken: string;
  private zoneId: string;
  private baseDomain: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
    this.baseDomain = 'workdoc360.com';
    
    if (!this.apiToken) {
      throw new Error('Cloudflare API token not found. Please add CLOUDFLARE_API_TOKEN to environment variables.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as any;
        console.log(`✅ Cloudflare API connected. Found ${data.result.length} zones.`);
        
        // Find workdoc360.com zone
        const targetZone = data.result.find((zone: any) => zone.name === this.baseDomain);
        if (targetZone) {
          this.zoneId = targetZone.id;
          console.log(`✅ Found ${this.baseDomain} zone: ${this.zoneId}`);
          return true;
        } else {
          console.log(`❌ ${this.baseDomain} zone not found in Cloudflare`);
          return false;
        }
      } else {
        const error = await response.text();
        console.error('❌ Cloudflare API connection failed:', error);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Cloudflare connection error:', error.message);
      return false;
    }
  }

  async createSubdomain(subdomain: string): Promise<boolean> {
    if (!this.zoneId) {
      console.error('❌ Zone ID not set. Call testConnection() first.');
      return false;
    }

    try {
      const record: CloudflareRecord = {
        type: 'A',
        name: subdomain,
        content: '34.117.33.233',
        ttl: 3600
      };

      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created subdomain: ${subdomain}.${this.baseDomain}`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create ${subdomain}:`, error);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error creating ${subdomain}:`, error.message);
      return false;
    }
  }

  async deleteSubdomain(subdomain: string): Promise<boolean> {
    if (!this.zoneId) {
      console.error('❌ Zone ID not set. Call testConnection() first.');
      return false;
    }

    try {
      // First, find the record ID
      const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records?name=${subdomain}.${this.baseDomain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!listResponse.ok) {
        console.error('❌ Failed to list DNS records');
        return false;
      }

      const listData = await listResponse.json() as any;
      const record = listData.result.find((r: any) => r.name === `${subdomain}.${this.baseDomain}`);

      if (!record) {
        console.log(`⚠️ Record ${subdomain}.${this.baseDomain} not found`);
        return false;
      }

      // Delete the record
      const deleteResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${record.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (deleteResponse.ok) {
        console.log(`✅ Deleted subdomain: ${subdomain}.${this.baseDomain}`);
        return true;
      } else {
        const error = await deleteResponse.text();
        console.error(`❌ Failed to delete ${subdomain}:`, error);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error deleting ${subdomain}:`, error.message);
      return false;
    }
  }

  async setupRootDomain(): Promise<boolean> {
    if (!this.zoneId) {
      console.error('❌ Zone ID not set. Call testConnection() first.');
      return false;
    }

    try {
      const record: CloudflareRecord = {
        type: 'A',
        name: '@',
        content: '34.117.33.233',
        ttl: 3600
      };

      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (response.ok) {
        console.log(`✅ Root domain configured: ${this.baseDomain}`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Failed to configure root domain:', error);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error configuring root domain:', error.message);
      return false;
    }
  }
}