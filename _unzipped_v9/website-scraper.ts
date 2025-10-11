// Website scraping service for extracting company branding and details

interface CompanyDetails {
  companyName?: string;
  businessDescription?: string;
  services?: string[];
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  branding?: {
    logoUrl?: string;
    primaryColors?: string[];
    tagline?: string;
  };
  certifications?: string[];
  yearEstablished?: string;
  keyPersonnel?: Array<{
    name: string;
    role: string;
  }>;
}

export async function scrapeCompanyWebsite(websiteUrl: string): Promise<CompanyDetails> {
  try {
    // Normalize URL
    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    console.log(`Scraping website: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WorkDoc360 Document Generator Bot 1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract company details using simple text parsing
    const companyDetails: CompanyDetails = {};

    // Extract company name from title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      companyDetails.companyName = titleMatch[1].replace(/\s*[-|–]\s*.*/g, '').trim();
    }

    // Extract meta description for business description
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descriptionMatch) {
      companyDetails.businessDescription = descriptionMatch[1];
    }

    // Extract contact information
    companyDetails.contactInfo = {};
    
    // Phone numbers (UK format)
    const phoneMatches = html.match(/(?:tel:|phone:|call:?\s*)([+]?[\d\s\-\(\)]{10,})/gi);
    if (phoneMatches) {
      companyDetails.contactInfo.phone = phoneMatches[0]
        .replace(/tel:|phone:|call:?\s*/gi, '')
        .trim();
    }

    // Email addresses
    const emailMatches = html.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
    if (emailMatches) {
      // Filter out common non-business emails
      const businessEmails = emailMatches.filter(email => 
        !email.includes('noreply') && 
        !email.includes('example.com') &&
        !email.includes('yourdomain.com')
      );
      if (businessEmails.length > 0) {
        companyDetails.contactInfo.email = businessEmails[0];
      }
    }

    // Extract address (UK postcodes)
    const postcodeMatch = html.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/gi);
    if (postcodeMatch) {
      // Find text around postcode for fuller address
      const postcodeIndex = html.indexOf(postcodeMatch[0]);
      const surroundingText = html.substring(Math.max(0, postcodeIndex - 200), postcodeIndex + 100);
      const cleanText = surroundingText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      companyDetails.contactInfo.address = cleanText.trim();
    }

    // Extract services from common sections
    const servicesMatch = html.match(/(?:services|what we do|our work)[\s\S]*?<\/(?:div|section|ul)>/gi);
    if (servicesMatch) {
      const serviceText = servicesMatch[0].replace(/<[^>]*>/g, ' ');
      // Extract list items or common service keywords
      const services = serviceText.match(/(?:scaffolding|construction|building|renovation|maintenance|installation|repair|design|project management|health & safety)/gi);
      if (services) {
        companyDetails.services = Array.from(new Set(services.map(s => s.toLowerCase())));
      }
    }

    // Extract logo URL
    const logoMatches = html.match(/<img[^>]*(?:logo|brand)[^>]*src=["']([^"']+)["']/gi);
    if (logoMatches) {
      const logoMatch = logoMatches[0].match(/src=["']([^"']+)["']/i);
      if (logoMatch) {
        let logoUrl = logoMatch[1];
        // Convert relative URLs to absolute
        if (logoUrl.startsWith('/')) {
          logoUrl = new URL(logoUrl, url).href;
        } else if (!logoUrl.startsWith('http')) {
          logoUrl = new URL(logoUrl, url).href;
        }
        companyDetails.branding = { logoUrl };
      }
    }

    // Extract tagline from common locations
    const taglineMatch = html.match(/<h[1-6][^>]*>([^<]*(?:quality|professional|expert|leading|trusted|reliable)[^<]*)</i);
    if (taglineMatch) {
      companyDetails.branding = {
        ...companyDetails.branding,
        tagline: taglineMatch[1].trim()
      };
    }

    // Extract year established
    const yearMatch = html.match(/(?:established|founded|since)\s*(\d{4})/gi);
    if (yearMatch) {
      const year = yearMatch[0].match(/\d{4}/);
      if (year) {
        companyDetails.yearEstablished = year[0];
      }
    }

    // Extract certifications and accreditations
    const certificationKeywords = [
      'iso', 'cisrs', 'cscs', 'chas', 'safecontractor', 'constructionline', 
      'niceic', 'gas safe', 'fgas', 'ipaf', 'pasma', 'smsts', 'sssts'
    ];
    
    const certifications: string[] = [];
    certificationKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}[\\s\\-]*(?:certified|accredited|approved|registered|\\d+)?\\b`, 'gi');
      const matches = html.match(regex);
      if (matches) {
        certifications.push(...matches.map(match => match.trim()));
      }
    });

    if (certifications.length > 0) {
      companyDetails.certifications = Array.from(new Set(certifications));
    }

    console.log('Extracted company details:', companyDetails);
    return companyDetails;

  } catch (error) {
    console.error('Website scraping error:', error);
    return {
      companyName: new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname.replace('www.', '')
    };
  }
}

export function validateCompanyDetails(details: CompanyDetails): {
  isValid: boolean;
  missingFields: string[];
  suggestions: string[];
} {
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  if (!details.companyName) {
    missingFields.push('Company Name');
    suggestions.push('We need your official company name for document headers');
  }

  if (!details.businessDescription) {
    missingFields.push('Business Description');
    suggestions.push('A brief description helps us tailor your compliance documents');
  }

  if (!details.contactInfo?.address) {
    missingFields.push('Business Address');
    suggestions.push('Your registered address is required for official documents');
  }

  if (!details.services || details.services.length === 0) {
    missingFields.push('Key Services');
    suggestions.push('What are your main construction services? This helps us create relevant procedures');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    suggestions
  };
}