import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { Company } from '@shared/schema';

// Enhanced request interface to include company context
export interface CompanyRequest extends Request {
  company?: Company;
  subdomain?: string;
  isCompanySubdomain?: boolean;
}

/**
 * Middleware to detect company from subdomain and add to request context
 * Handles subdomains like: plastermaster.workdoc360.co.uk
 */
export async function detectCompanyFromSubdomain(
  req: CompanyRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Get hostname from headers (Cloudflare proxy support)
    const host = req.headers['host'] || req.headers['x-forwarded-host'] || req.hostname;
    const hostname = typeof host === 'string' ? host : req.hostname;
    console.log('Subdomain detection for hostname:', hostname);
    
    // Extract subdomain (first part before first dot)
    const parts = hostname.split('.');
    const subdomain = parts[0];
    
    // Handle root domain workdoc360.com (no subdomain)
    if (hostname === 'workdoc360.com' || hostname === 'www.workdoc360.com' || 
        hostname.includes('localhost') || hostname.includes('127.0.0.1') ||
        hostname.includes('.replit.dev') || hostname.includes('.repl.co') ||
        hostname.startsWith('workdoc360.com') || hostname.startsWith('www.workdoc360.com')) {
      console.log(`✅ Main domain detected: ${hostname} - serving main platform`);
      req.isCompanySubdomain = false;
      return next();
    }
    
    // Skip main platform domains
    const mainDomains = ['www', 'app', 'api', 'admin', 'localhost'];
    if (mainDomains.includes(subdomain) || parts.length < 2) {
      req.isCompanySubdomain = false;
      return next();
    }
    
    // Look up company by slug
    const company = await storage.getCompanyBySlug(subdomain);
    
    if (company) {
      req.company = company;
      req.subdomain = subdomain;
      req.isCompanySubdomain = true;
      console.log(`Company detected from subdomain: ${company.name} (${subdomain})`);
    } else {
      req.isCompanySubdomain = false;
      console.log(`No company found for subdomain: ${subdomain}`);
    }
    
    next();
  } catch (error) {
    console.error('Error in subdomain detection:', error);
    req.isCompanySubdomain = false;
    next();
  }
}

/**
 * Utility function to generate company slug from company name
 */
export function generateCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .replace(/-+/g, '') // Remove hyphens
    .substring(0, 20); // Limit length
}

/**
 * Middleware to require company context (for company-specific routes)
 */
export function requireCompanyContext(
  req: CompanyRequest, 
  res: Response, 
  next: NextFunction
) {
  if (!req.isCompanySubdomain || !req.company) {
    return res.status(404).json({ 
      error: 'Company subdomain required for this resource' 
    });
  }
  next();
}