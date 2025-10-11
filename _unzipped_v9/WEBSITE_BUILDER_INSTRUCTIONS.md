# WorkDoc360 Website Builder - Replit Development Instructions

## Project Overview
Build a professional website builder application specifically for UK construction businesses that integrates with the existing WorkDoc360 compliance platform. This will allow WorkDoc360 customers to generate high-quality business websites alongside their compliance documentation.

## Technical Requirements

### Core Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon Database recommended)
- **ORM**: Drizzle ORM for type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Anthropic Claude API for content generation
- **Authentication**: JWT tokens for API integration with WorkDoc360

### Project Structure
```
workdoc360-website-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── templates/         # Website template definitions
├── shared/                # Shared types and schemas
└── templates/             # Static website template assets
```

## Database Schema

### Core Tables
```sql
-- Website projects
CREATE TABLE websites (
  id SERIAL PRIMARY KEY,
  workdoc360_company_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255),
  template_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Website content sections
CREATE TABLE website_sections (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL, -- hero, about, services, contact, etc.
  content JSONB NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- Template definitions
CREATE TABLE website_templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  trade_types TEXT[], -- Array of applicable trades
  template_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- AI-generated content cache
CREATE TABLE generated_content (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  content_type VARCHAR(100) NOT NULL,
  prompt_hash VARCHAR(255) NOT NULL,
  generated_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Core Features to Implement

### 1. Template System
Create 8-10 professional templates specifically for construction trades:

**Template Categories:**
- **Scaffolding Specialists**: Industrial, safety-focused design
- **Plasterers**: Clean, modern finish showcase
- **General Builders**: Versatile, project portfolio focus
- **Electricians**: Technical, certification-heavy layout
- **Plumbers**: Emergency-ready, trust-building design
- **Roofers**: Weather-resistant, durability emphasis
- **Painters/Decorators**: Visual portfolio, colour-rich design
- **Flooring Specialists**: Texture and material showcase

### 2. AI Content Generation Service
```typescript
// Content generation service
interface ContentGenerationRequest {
  companyName: string;
  tradeType: string;
  businessDescription?: string;
  serviceAreas: string[];
  yearsInBusiness?: number;
  specialties: string[];
  contentType: 'hero' | 'about' | 'services' | 'testimonials';
}

// AI service using Anthropic Claude
export class WebsiteContentGenerator {
  async generateHeroSection(request: ContentGenerationRequest): Promise<HeroContent> {
    // Use Claude to generate compelling hero content
    // Focus on UK construction terminology
    // Include strong CTAs for quotes/consultations
  }
  
  async generateAboutSection(request: ContentGenerationRequest): Promise<AboutContent> {
    // Generate professional about content
    // Emphasize certifications, experience, local presence
  }
  
  async generateServicesSection(request: ContentGenerationRequest): Promise<ServicesContent> {
    // Create trade-specific service descriptions
    // Include pricing hints and project types
  }
}
```

### 3. Website Builder Interface
Build a drag-and-drop interface with:

**Core Editor Components:**
- **Template Selector**: Grid of construction-themed templates
- **Content Editor**: WYSIWYG editor for each section
- **AI Content Assistant**: One-click content generation
- **Media Manager**: Upload logos, project photos, certificates
- **SEO Manager**: Meta tags, schema markup for local business
- **Mobile Preview**: Responsive design testing

### 4. Integration with WorkDoc360

**API Integration Points:**
```typescript
// Authentication endpoint
POST /api/auth/workdoc360
{
  "token": "workdoc360_jwt_token",
  "companyId": 123
}

// Sync company data
GET /api/companies/{companyId}/sync
Response: {
  "name": "Elite Scaffolding Ltd",
  "tradeType": "scaffolder",
  "address": "Manchester, M1 4AE",
  "phone": "0161 234 5678",
  "email": "info@elitescaffolding.co.uk",
  "logo": "https://workdoc360.com/logos/company123.png"
}

// Website creation from WorkDoc360
POST /api/websites/create-from-workdoc360
{
  "companyId": 123,
  "templateId": "scaffolding-pro",
  "autoGenerate": true
}
```

### 5. Publishing & Hosting System

**Subdomain Generation:**
- Format: `{company-name}.workdoc360sites.com`
- Automatic SSL certificates
- CDN delivery for fast loading

**Custom Domain Support:**
- DNS configuration instructions
- SSL certificate management
- Domain verification process

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1)
1. **Set up project structure** with Vite + React + Express
2. **Implement database schema** with Drizzle ORM
3. **Create authentication system** for WorkDoc360 integration
4. **Build basic template system** with 3 starter templates
5. **Implement content management** for website sections

### Phase 2: AI Content Generation (Week 2)
1. **Integrate Anthropic Claude API** for content generation
2. **Create content generation prompts** for UK construction businesses
3. **Build AI content interface** in the website builder
4. **Implement content caching** to reduce API costs
5. **Add content revision system** for user edits

### Phase 3: Website Builder UI (Week 3)
1. **Create template selection interface**
2. **Build section-by-section editor**
3. **Implement media upload system**
4. **Add mobile responsive preview**
5. **Create SEO optimization tools**

### Phase 4: Publishing & Integration (Week 4)
1. **Implement website publishing system**
2. **Set up subdomain generation**
3. **Create WorkDoc360 API integration**
4. **Build customer dashboard**
5. **Add analytics and performance monitoring**

## Key Prompts for AI Content Generation

### Hero Section Prompt
```
Generate a compelling hero section for a UK {tradeType} business called {companyName}.

Requirements:
- Use British English exclusively
- Emphasize local service areas: {serviceAreas}
- Include trust indicators (insurance, certifications)
- Strong call-to-action for free quotes
- Professional but approachable tone
- Mention {yearsInBusiness} years experience if provided

Return JSON:
{
  "headline": "Main hero headline",
  "subheadline": "Supporting text",
  "ctaText": "Call-to-action button text",
  "trustIndicators": ["Fully insured", "CSCS certified", etc.]
}
```

### Services Section Prompt
```
Generate a services section for {companyName}, a {tradeType} business in the UK.

Trade-specific requirements:
- For scaffolders: Include CISRS, TG20:13, commercial/industrial work
- For plasterers: Wet trades, interior/exterior, specialist finishes
- For electricians: 18th Edition, NICEIC, domestic/commercial splits
- For plumbers: Gas Safe, emergency services, boiler installations

Return 4-6 services with descriptions focusing on customer benefits.
Use British terminology and emphasize quality, safety, compliance.
```

## Design Guidelines

### UI/UX Principles
- **Mobile-first design**: Construction businesses need mobile-friendly sites
- **Fast loading**: Optimize for site speed and SEO
- **Local SEO focus**: Schema markup for construction businesses
- **Trust-building elements**: Certifications, insurance, testimonials prominent
- **Clear contact methods**: Phone numbers, quote forms, service areas

### Brand Consistency
- Use WorkDoc360 colour palette for admin interface
- Construction-themed design elements
- Professional typography suitable for business websites
- Consistent button styles and form designs

## Security & Performance

### Security Requirements
- **Input sanitization** for all user content
- **XSS protection** in website preview/publishing
- **Rate limiting** on AI content generation
- **Secure file uploads** with virus scanning
- **HTTPS enforcement** for all published sites

### Performance Optimization
- **Image optimization** with WebP conversion
- **CSS/JS minification** for published sites
- **CDN delivery** for static assets
- **Database query optimization** with proper indexing
- **Caching strategy** for generated content

## Testing Strategy

### Unit Tests
- Test all AI content generation functions
- Validate template rendering logic
- Test WorkDoc360 API integration
- Verify website publishing process

### Integration Tests
- End-to-end website creation flow
- Cross-browser compatibility testing
- Mobile responsiveness verification
- Performance testing under load

## Deployment Instructions

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# AI Integration
ANTHROPIC_API_KEY=your_claude_api_key

# WorkDoc360 Integration
WORKDOC360_API_URL=https://workdoc360.com/api
WORKDOC360_API_SECRET=shared_secret_key

# Publishing
SITES_DOMAIN=workdoc360sites.com
CDN_URL=https://cdn.workdoc360sites.com
SSL_CERT_PATH=/etc/ssl/certs/
```

### Production Deployment
1. **Set up CI/CD pipeline** with automated testing
2. **Configure staging environment** for testing
3. **Set up monitoring** with error tracking
4. **Implement backup strategy** for customer websites
5. **Create rollback procedures** for safe deployments

## Success Metrics

### Key Performance Indicators
- **Website creation time**: Target under 10 minutes
- **Content generation quality**: 90%+ customer satisfaction
- **Site performance**: PageSpeed score 90+
- **Mobile optimization**: 100% responsive design
- **SEO effectiveness**: Local search visibility improvement

### User Experience Goals
- **Intuitive interface**: Minimal learning curve
- **Professional output**: Business-ready websites
- **Fast publishing**: Instant preview, quick deployment
- **Reliable hosting**: 99.9% uptime guarantee
- **Customer support**: Integrated help and tutorials

This website builder will significantly enhance WorkDoc360's value proposition by providing customers with a complete digital presence solution alongside their compliance documentation needs.