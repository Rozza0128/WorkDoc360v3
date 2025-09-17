import fetch from 'node-fetch';

export interface GoDaddyDNSRecord {
  type: string;
  name: string;
  data: string;
  ttl?: number;
}

export class GoDaddyService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.godaddy.com/v1';
  private replitIP = '34.117.33.233'; // Your Replit deployment IP

  constructor() {
    this.apiKey = process.env.GODADDY_API_KEY || '';
    this.apiSecret = process.env.GODADDY_API_SECRET || '';
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('GoDaddy API credentials not found in environment variables');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/domains`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      console.log('GoDaddy API test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('GoDaddy API connection test failed:', error);
      return false;
    }
  }

  async createSubdomain(domain: string, subdomain: string): Promise<boolean> {
    try {
      console.log(`Creating subdomain: ${subdomain}.${domain} → ${this.replitIP}`);
      
      const records: GoDaddyDNSRecord[] = [
        {
          type: 'A',
          name: subdomain,
          data: this.replitIP,
          ttl: 3600
        }
      ];

      const response = await fetch(`${this.baseUrl}/domains/${domain}/records`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(records)
      });

      if (response.ok) {
        console.log(`✅ Subdomain created: ${subdomain}.${domain}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to create subdomain: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('Error creating subdomain:', error);
      return false;
    }
  }

  async deleteSubdomain(domain: string, subdomain: string): Promise<boolean> {
    try {
      console.log(`Deleting subdomain: ${subdomain}.${domain}`);
      
      const response = await fetch(`${this.baseUrl}/domains/${domain}/records/A/${subdomain}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (response.ok) {
        console.log(`✅ Subdomain deleted: ${subdomain}.${domain}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to delete subdomain: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting subdomain:', error);
      return false;
    }
  }

  async listDNSRecords(domain: string): Promise<GoDaddyDNSRecord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/domains/${domain}/records`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        const records = await response.json() as GoDaddyDNSRecord[];
        return records;
      } else {
        console.error('Failed to fetch DNS records:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      return [];
    }
  }

  async ensureRootDomain(domain: string): Promise<boolean> {
    try {
      console.log(`Ensuring root domain ${domain} points to ${this.replitIP}`);
      
      // Get existing records
      const existingRecords = await this.listDNSRecords(domain);
      const rootARecord = existingRecords.find(r => r.type === 'A' && (r.name === '@' || r.name === domain));
      
      if (rootARecord && rootARecord.data === this.replitIP) {
        console.log(`✅ Root domain ${domain} already correctly configured`);
        return true;
      }

      // Create/update root A record
      const records: GoDaddyDNSRecord[] = [
        {
          type: 'A',
          name: '@',
          data: this.replitIP,
          ttl: 3600
        }
      ];

      const response = await fetch(`${this.baseUrl}/domains/${domain}/records/A/@`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(records)
      });

      if (response.ok) {
        console.log(`✅ Root domain configured: ${domain} → ${this.replitIP}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to configure root domain: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('Error configuring root domain:', error);
      return false;
    }
  }

  async renameSubdomain(domain: string, oldSubdomain: string, newSubdomain: string): Promise<boolean> {
    try {
      console.log(`Renaming subdomain: ${oldSubdomain}.${domain} → ${newSubdomain}.${domain}`);
      
      // Create new subdomain
      const createSuccess = await this.createSubdomain(domain, newSubdomain);
      if (!createSuccess) {
        return false;
      }

      // Delete old subdomain
      const deleteSuccess = await this.deleteSubdomain(domain, oldSubdomain);
      if (!deleteSuccess) {
        console.warn(`Warning: Failed to delete old subdomain ${oldSubdomain}.${domain}`);
      }

      console.log(`✅ Subdomain renamed: ${oldSubdomain}.${domain} → ${newSubdomain}.${domain}`);
      return true;
    } catch (error) {
      console.error('Error renaming subdomain:', error);
      return false;
    }
  }
}