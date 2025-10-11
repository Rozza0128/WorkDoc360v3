# WorkDoc360 Multi-Tenant Subdomain Architecture

## Overview
Each customer gets their own branded subdomain with personalised homepage and isolated workspace.

## Subdomain Structure
```
https://plastermaster.workdoc360.co.uk     ← PlasterMaster's portal
https://robbson.workdoc360.co.uk           ← Rob & Son's portal  
https://app.workdoc360.co.uk               ← Main platform (unbranded)
https://www.workdoc360.co.uk               ← Marketing website
```

## Implementation Plan

### 1. Subdomain Detection Middleware
```typescript
// middleware/subdomainDetection.ts
export function detectCompanyFromSubdomain(req: Request): Company | null {
  const hostname = req.hostname;
  const subdomain = hostname.split('.')[0];
  
  // Skip main domains
  if (['www', 'app', 'api', 'admin'].includes(subdomain)) {
    return null;
  }
  
  // Find company by subdomain
  return await storage.getCompanyBySlug(subdomain);
}
```

### 2. Company Slug Generation
- **PlasterMaster** → `plastermaster.workdoc360.co.uk`
- **Rob & Son Scaffolding** → `robbson.workdoc360.co.uk`
- **ABC Construction Ltd** → `abcconstruction.workdoc360.co.uk`

### 3. Branded Homepage Features
Each company subdomain shows:
- **Company logo** and branding colours
- **Personalised dashboard** with company name
- **Isolated document library** (only their documents)
- **Company-specific navigation** and menus
- **Custom compliance templates** for their trade type

### 4. Benefits for Customers
- **Professional appearance**: `plastermaster.workdoc360.co.uk` 
- **Brand recognition**: Company logo everywhere
- **Security**: Cannot see other companies' data
- **Simplified workflow**: Direct access to their portal
- **Mobile bookmarking**: Easy to save company portal

### 5. Technical Implementation
- **DNS**: Wildcard CNAME `*.workdoc360.co.uk` → main server
- **Routing**: Subdomain detection in Express middleware
- **Authentication**: Already supports `req.hostname` routing
- **Storage**: Company-specific object storage areas
- **Theming**: Dynamic CSS based on company branding

### 6. Migration Strategy
1. Add `companySlug` field to companies table
2. Create subdomain detection middleware  
3. Update authentication to handle company context
4. Implement company-specific homepage layouts
5. Test with PlasterMaster subdomain
6. Roll out to all existing customers

### 7. DNS Configuration Required
```
*.workdoc360.co.uk    CNAME    your-app.replit.app
plastermaster         CNAME    your-app.replit.app  
robbson               CNAME    your-app.replit.app
```

### 8. Example Customer Experience

**Before (Generic):**
```
User logs in → Generic dashboard → Search for their company → Access documents
```

**After (Branded):**
```
Visit plastermaster.workdoc360.co.uk → Branded login → Personalised dashboard → Their documents
```

## Database Schema Changes
```sql
ALTER TABLE companies ADD COLUMN company_slug VARCHAR(100) UNIQUE;
UPDATE companies SET company_slug = 'plastermaster' WHERE id = 17;
UPDATE companies SET company_slug = 'robbson' WHERE id = 18;
```

This creates a white-label experience where each customer feels like they have their own dedicated compliance platform.