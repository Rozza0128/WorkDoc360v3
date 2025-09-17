# WorkDoc360 - Construction Compliance Management System

## Overview

WorkDoc360 is a comprehensive construction industry compliance management platform designed to streamline health and safety documentation, certification tracking, and regulatory compliance for construction trades. The system specializes in scaffolding, plastering, and general building contractors, providing industry-specific compliance tools and automated tracking systems.

## User Preferences

Preferred communication style: Simple, everyday language.
Pricing structure: Starts at £65/month with additional charges for extra users and custom requests.
Language: **CRITICAL - ALL CONTENT MUST USE UK ENGLISH AND BRITISH CONSTRUCTION TERMINOLOGY ONLY**
- Use British spellings (realise, optimise, specialise, centre, colour, etc.)
- Use British construction terms (site, programme, labour, etc.)
- Never use American terms (program, labor, optimize, etc.)
User management: Multi-level user privileges (Admin can change everything, users can upload).
Compliance notifications: Automated prompts for overdue documents and missing toolbox talks.

## Complete Technology Stack

### Frontend Technologies
- **React 18**: Core UI framework for building interactive user interfaces
- **TypeScript**: Type-safe JavaScript for better development experience and error prevention
- **Vite**: Fast build tool and development server with hot module replacement
- **Wouter**: Lightweight client-side routing library (alternative to React Router)
- **TanStack Query (React Query)**: Server state management, caching, and data fetching
- **React Hook Form**: Efficient form handling with minimal re-renders
- **Zod**: Runtime type validation and schema validation for forms and APIs

### UI/UX Design System
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality, accessible UI components built on Radix UI
- **Radix UI**: Headless, accessible component primitives for complex UI elements
- **Lucide React**: Beautiful, customizable SVG icons
- **React Icons**: Additional icon library for company logos and specialized icons
- **Framer Motion**: Animation library for smooth transitions and interactions
- **next-themes**: Dark/light theme switching system

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, minimalist web framework for Node.js
- **TypeScript**: Type-safe server-side development
- **tsx**: TypeScript execution environment for development

### Database & ORM
- **PostgreSQL**: Robust, feature-rich relational database
- **Neon Database**: Serverless PostgreSQL for scalable cloud deployment
- **Drizzle ORM**: Type-safe, lightweight ORM for database operations
- **drizzle-kit**: Database migration and introspection toolkit
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation

### Authentication & Security
- **Native Authentication**: Custom email/password authentication system
- **bcrypt**: Password hashing for secure credential storage
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store for scalability
- **passport**: Authentication middleware (for extensibility)
- **speakeasy**: Two-factor authentication (TOTP) support

### AI & Document Generation
- **Anthropic Claude AI**: Advanced AI for intelligent document generation
- **@anthropic-ai/sdk**: Official SDK for Anthropic API integration
- **AI-Powered Templates**: Custom construction industry compliance document generation

### Payment Processing
- **Stripe**: Payment processing and subscription management
- **@stripe/stripe-js**: Stripe JavaScript SDK for frontend integration
- **@stripe/react-stripe-js**: React components for Stripe payment forms

### Email Services
- **SendGrid**: Email delivery service for notifications and communications
- **@sendgrid/mail**: SendGrid SDK for email sending capabilities

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS post-processor for Tailwind CSS
- **Autoprefixer**: Automatic CSS vendor prefixing
- **Browserslist**: Browser compatibility configuration

### Additional Libraries
- **date-fns**: Modern date utility library for date manipulation
- **nanoid**: Unique ID generation for database records
- **memoizee**: Function memoization for performance optimization
- **qrcode**: QR code generation for mobile app integration
- **recharts**: Data visualization and charting library
- **vaul**: Drawer component for mobile-friendly interfaces
- **input-otp**: One-time password input component
- **react-day-picker**: Date picker component for forms
- **react-resizable-panels**: Resizable panel layouts
- **embla-carousel-react**: Carousel component for image galleries
- **cmdk**: Command menu component for quick actions
- **class-variance-authority**: Utility for creating variant-based component APIs
- **tailwind-merge**: Utility for merging Tailwind CSS classes
- **tailwindcss-animate**: Animation utilities for Tailwind CSS
- **clsx**: Utility for constructing className strings conditionally

### Mobile Integration
- **WebSocket (ws)**: Real-time communication for mobile app integration
- **Token-based API Authentication**: Separate authentication system for mobile apps
- **Cross-platform API Design**: RESTful APIs compatible with React Native/Flutter

### Development Environment
- **Replit**: Cloud development environment and hosting platform
- **Environment Variables**: Secure configuration management
- **Hot Module Replacement**: Real-time development updates
- **TypeScript Strict Mode**: Enhanced type checking and error prevention

### Deployment & Infrastructure
- **Replit Deployments**: Cloud hosting and deployment platform
- **PostgreSQL Sessions**: Scalable session storage
- **Asset Management**: File storage for document attachments
- **SSL/TLS**: Secure HTTPS connections
- **CDN Support**: Fast content delivery for static assets

### System Architecture
The application follows a modern full-stack architecture with clear separation of concerns:
- **Frontend**: React SPA with server-side rendering capabilities
- **Backend**: RESTful API server with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **Authentication**: Native system with session-based web auth and token-based mobile auth
- **AI Integration**: Anthropic Claude for intelligent document generation
- **Payment Processing**: Stripe for subscription management
- **Email Service**: SendGrid for automated notifications

## Key Components

### Authentication System
- **Provider**: Replit Auth integration for seamless user management
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Role-based access control at company level
- **Security**: HTTP-only cookies with secure flags in production

### Database Schema
- **Users**: Core user profiles with Replit Auth integration
- **Companies**: Multi-tenant company structure with trade type specialization
- **Company Users**: Role-based company membership system
- **Compliance Documents**: Structured storage for various compliance types:
  - CSCS Cards with expiration tracking
  - Risk Assessments
  - Method Statements
  - Toolbox Talks
  - General Compliance Items

### Comprehensive UK Trade Coverage
- **Core Building Trades**: General Contractors, Bricklayers, Carpenters, Roofers, Concrete Specialists
- **Building Services & MEP**: Electricians (18th Edition), Plumbers (Gas Safe), Heating Engineers, HVAC Specialists
- **Finishing Trades**: Plasterers, Painters & Decorators, Flooring Specialists, Glaziers, Ceiling Fixers
- **Specialized Trades**: Scaffolders (CISRS), Steel Erectors, Insulation Specialists, Demolition, Asbestos Removal
- **Infrastructure & Civil**: Groundworkers, Drainage Specialists, Highways, Utilities Contractors
- **Emerging Specialties**: Renewable Energy Installers, Modular Construction, Historic Restoration, Sustainability Consultants

### User Interface Components
- **Dashboard**: Real-time compliance metrics and alerts
- **Onboarding**: Multi-step company setup with trade selection
- **Document Management**: Upload, categorization, and expiration tracking
- **Reporting**: Compliance status visualization and export capabilities

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Company Selection**: Users can belong to multiple companies with different roles
3. **Document Upload**: Files processed and categorized by compliance type
4. **Compliance Tracking**: Automated monitoring of certification expiration dates
5. **Notification System**: Alerts for upcoming renewals and compliance deadlines
6. **Reporting**: Real-time dashboard updates via TanStack Query

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless for scalable data storage
- **Authentication**: Replit Auth service for user management
- **Email**: SendGrid integration for notification delivery
- **File Storage**: Asset management system for document storage

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Server-side bundling for production deployment
- **TypeScript**: Type safety across the entire stack

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Consistent icon system
- **React Hook Form**: Efficient form state management
- **Date-fns**: Date manipulation and formatting

## Deployment Strategy

### Development Environment
- **Server**: Development server with hot reload via tsx
- **Client**: Vite development server with HMR
- **Database**: Drizzle schema synchronization with `db:push`

### Production Build
- **Client**: Vite static build optimized for production
- **Server**: ESBuild bundle with external package resolution
- **Database**: Migration-based schema updates via Drizzle Kit

### Environment Configuration
- **Database**: CONNECTION_STRING via environment variables
- **Authentication**: Replit Auth configuration with domain validation
- **Security**: Session secrets and secure cookie configuration
- **Email**: SendGrid API key configuration

### Deployment Architecture
- **Static Assets**: Client build output served from `/dist/public`
- **API Server**: Express.js server handling `/api` routes
- **Session Storage**: PostgreSQL sessions table for scalability
- **File Storage**: Attached assets directory for document storage

The system is designed for scalability with serverless database architecture and stateless server design, making it suitable for multi-tenant construction company deployments.

## Recent Changes (July 2025)

### Micro Business Tier Implementation (July 21, 2025)
- **Added £35/month Micro Business Plan**: New entry-level tier targeting sole traders and micro businesses
- **4-Tier Pricing Structure**: Micro (£35/month, 1 user), Essential (£65/month, 3 users), Professional (£129/month, 10 users), Enterprise (£299/month, 50 users)
- **Responsive Grid Layout**: Updated pricing display from 3-column to responsive 2/4-column layout for better mobile experience
- **Feature Matrix Updates**: All features updated to include Micro plan inclusions (basic features included, premium features excluded)
- **Strategic Market Positioning**: Fills gap between basic £50-100 safety apps and £500+ enterprise solutions
- **Sole Trader Focus**: Specifically designed for single-person construction businesses requiring basic compliance

### Comprehensive UI/UX Enhancement & Critical Fixes (July 15, 2025)
- **Fixed ISO Compliance Fake Data**: Removed 90% fake compliance score - now correctly shows 0% baseline
- **Fixed Dashboard Button Functionality**: Added click handlers to "Create New", "Record Talk", and "Create New" buttons with proper navigation
- **Enhanced Document Generator**: Improved template selection with enhanced visual feedback, accessibility, and responsive design
- **SEO Implementation**: Added comprehensive meta tags, page titles, Open Graph tags, and favicon for better search visibility
- **CSS System Overhaul**: Implemented consistent CSS custom properties for construction orange branding and improved color system
- **Mobile Responsiveness**: Enhanced mobile layouts across DocumentGenerator, auth forms, and dashboard components
- **Accessibility Improvements**: Added ARIA labels, keyboard navigation, focus states, and proper semantic markup
- **Form Layout Enhancement**: Improved spacing, visual hierarchy, and user feedback across all forms
- **Loading States**: Added consistent loading indicators with spinner animations and proper disabled states
- **Navigation Flow**: Dashboard quick action buttons now properly navigate to Documents/Library tabs with visual feedback
- **Visual Polish**: Added border accents, improved card designs, enhanced button styling, and consistent iconography

### Critical Onboarding Bug Resolution (July 15, 2025)
- **Fixed Company Creation Schema Issue**: Resolved critical bug where `insertCompanySchema` was excluding `ownerId` field during validation
- **Database Constraint Violation Eliminated**: Fixed null `owner_id` constraint violations preventing company creation
- **Authentication Flow Verified**: Confirmed user sessions properly maintained through company creation process
- **End-to-End Testing Completed**: Verified complete onboarding flow from frontend form to database insertion
- **Mobile Interface Confirmed**: Onboarding form displays correctly on mobile devices with proper field validation
- **API Endpoint Functionality**: All company CRUD operations working correctly with proper user authorization

### Watermarked Demo System & Free Trial Elimination (July 15, 2025)
- **Implemented Protected Demo**: Created heavily watermarked demo experience for logged-in users
- **Full Feature Demonstration**: Demo shows complete UI experience with realistic companies and data
- **Watermark Protection**: Multiple visible watermarks, dashed borders, demo badges, and locked features
- **Subscription Conversion**: Clear prompts throughout demo directing to subscription signup
- **Eliminated Free Trials**: Removed all free trial messaging to prevent document exploitation
- **Subscription-Only Model**: All access requires 12-month subscription commitment (£65/month minimum)
- **Demo for Logged Users**: Demo available at /demo route for authenticated users only
- **Revenue Protection**: Demo showcases value while preventing actual document generation without payment

### 12-Month Subscription Model Implementation (July 15, 2025)
- **Eliminated Free Trial System**: Removed free trial to prevent document exploitation without payment commitment
- **Contract-Based Subscriptions**: All plans now require 12-month minimum commitment with no free usage
- **Dual Payment Options**: Monthly billing (12 payments) or yearly billing (17% savings with upfront payment)
- **Annual Discount Structure**: Save 2 months with yearly payments (£650/year vs £780 monthly for Essential)
- **Enhanced Database Schema**: Added contract tracking fields (contractStartDate, contractEndDate, nextBillingDate)
- **Interactive Pricing Component**: Toggle between monthly/yearly views with real-time savings calculations
- **Payment Status Management**: Users start with 'pending_payment' status until subscription is activated
- **Clear Contract Terms**: Prominent display of commitment requirements and payment options
- **Revenue Protection**: Ensures customer investment before accessing premium document generation features

### Comprehensive UK Construction Trade Expansion (July 14, 2025)
- **Complete Industry Coverage**: Expanded from 3 narrow trades to comprehensive UK construction industry support
- **26 Distinct Trade Categories**: Core Building, Building Services & MEP, Finishing, Specialized, Infrastructure, and Emerging trades
- **Professional Trade Organization**: Categorized trade selection with industry-specific compliance requirements
- **Enhanced AI Chatbot**: Updated with complete UK trade coverage and specific compliance guidance for all trades
- **Inclusive User Experience**: No trade feels excluded or like an afterthought - every UK construction business supported
- **Landing Page Transformation**: Updated from narrow scaffold/plaster focus to comprehensive industry coverage
- **Database Schema Updates**: Enhanced trade type support for all UK construction specialties

### Enhanced UK Business Type Support (July 14, 2025)
- **Complete UK Business Structure Support**: Updated sign-up journey to accommodate all UK business types
- **Business Type Options**: Limited Company, Sole Trader, Partnership, LLP, Charity/Non-profit, Other
- **Dynamic Form Labels**: Context-aware field labels (Company Name vs Business Name, UTR vs Registration Number)
- **Registration Guidance**: Specific help text for each business type (Companies House, HMRC UTR, etc.)
- **Database Schema Enhancement**: Added businessType field with proper UK classifications
- **Mobile-Responsive AI Chatbot**: Fixed mobile interface with touch-friendly controls and responsive sizing
- **Professional UX**: Adaptive placeholders and validation messages for different business structures

### Mobile App API Integration (July 14, 2025)
- **Token-Based Authentication**: Added mobile-specific API endpoints for app integration
- **Dual Authentication System**: Web uses session-based auth, mobile uses Bearer tokens
- **Mobile API Routes**: `/api/mobile/login`, `/api/mobile/register`, `/api/mobile/user`
- **Shared Data Access**: All existing API endpoints work with both web and mobile authentication
- **Development Guide**: Comprehensive mobile app integration documentation with React Native/Flutter examples
- **Security Foundation**: Basic token system ready for JWT upgrade in production
- **Cross-Platform Ready**: API architecture supports iOS, Android, and cross-platform frameworks

## Recent Changes (July 2025)

### Collaborative Document Annotation & Review System (July 14, 2025)
- **Complete Annotation System**: Multi-type annotations (comments, suggestions, approvals, rejections) with priority levels
- **Professional Review Workflows**: Technical, compliance, quality, and final approval review types with status tracking
- **Enhanced Database Schema**: Added document_annotations and document_reviews tables with full audit trails
- **DocumentReviewSystem Component**: Comprehensive interface for collaborative document feedback and approval
- **DocumentReviewModal Integration**: Seamless modal interface accessible from document library
- **API Security**: Role-based access controls for all annotation and review operations
- **Review Status Tracking**: Visual badges showing document review progress and approval status
- **Team Collaboration**: Threaded comments and multi-reviewer support for comprehensive document validation

### Premium Document Library System Implementation (July 14, 2025)
- **Tiered Document Access**: Basic health & safety for Essential plan, full ISO 9001 suite for Professional/Enterprise
- **Strategic Value Proposition**: ISO 9001:2015 quality management documents as premium feature
- **Trade-Specific Templates**: Tailored document sets for scaffolders, plasterers, and general builders
- **Document Library Interface**: Professional document management with upgrade prompts for premium features
- **Comprehensive Coverage**: Quality Manual, procedures, policies, and health & safety documentation
- **Construction Industry Focus**: All templates use UK English and British construction terminology
- **Clear Pricing Tiers**: Basic compliance included, advanced ISO 9001 requires Professional plan (£129/month)
- **Template Categories**: ISO 9001 (Premium), Health & Safety (Included), and Other document classifications

### UI/UX Improvements (July 14, 2025)
- **Text Rendering Fix**: Resolved shimmer-text CSS clipping issue preventing full display of "Construction Compliance?"
- **Enhanced Shimmer Effects**: Improved gradient text animation with better overflow handling and line spacing

### Native Authentication System Implementation (July 14, 2025)
- **Complete Replit Auth Removal**: Converted from external Replit Auth to native email/password system
- **Self-Contained User Management**: No external signups required - customers register directly with WorkDoc360
- **Enhanced Security**: Implemented bcrypt password hashing with salt generation
- **Professional Auth Interface**: Two-column auth page with login/register tabs, construction industry branding
- **Updated Customer Journey**: Landing page → /auth → Home dashboard → Company onboarding
- **Database Schema Evolution**: Added password, emailVerified fields to users table
- **Session Management**: PostgreSQL-backed session storage with secure cookies

## Recent Changes (Previous)

### Pricing Structure Implementation
- Updated pricing to start at £65/month for Essential plan (3 users included)
- Professional plan: £129/month (10 users included)
- Enterprise plan: £299/month (50 users included)
- Add-on pricing: £15/£12/£8 per additional user based on plan
- Custom requests: £150/hour for bespoke requirements

### User Role Management System
- Implemented multi-level user privileges:
  - **Admin**: Full access, can change all settings, manage billing, remove users
  - **Manager**: Document management, user invitations, compliance oversight
  - **User**: Document viewing, file uploads, toolbox talk recording
- Created UserRoleManagement component for company user administration
- Added role-based access controls throughout the application

### Compliance Alert System
- Developed ComplianceAlerts component with UK construction terminology
- Automated prompts for:
  - CSCS cards expiring within 30 days
  - Risk assessments due for review
  - Missing toolbox talks (HSE requirement: 4 per month minimum)
  - Overdue compliance items
- Email notification system with SendGrid integration
- Industry-specific messaging using British construction language

### Email Notification Templates
- CSCS card expiry reminders with UK compliance requirements
- Daily toolbox talk prompts for HSE compliance
- Risk assessment review notifications for CDM 2015 compliance
- Professional email templates with construction industry terminology

### UK Language Localization
- Updated all interface text to use UK English spellings
- Implemented British construction industry terminology throughout
- Trade specialisation (not specialization) terminology
- Compliance messaging aligned with UK regulations (HSE, CDM 2015, CSCS requirements)

### Custom Trade Consultation System (July 2025)
- Added "Other Trade (Not Listed)" option for businesses outside standard categories
- Bespoke document research service at £150/hour
- Custom consultation form capturing:
  - Detailed business description
  - Main work activities and processes
  - Equipment and materials used
  - Specific safety challenges
- Dedicated consultation workflow with estimated timelines
- Professional consultation process with detailed quotes before work begins

### Site Manager Integration Framework (July 16, 2025)
- **Dual Application Architecture**: Added navigation integration for separate site manager application
- **Navigation Enhancement**: Customer Login (blue) and Site Manager (amber) options in main navigation
- **Cross-Platform Strategy**: Site manager app runs as separate application with dedicated interface
- **Future Integration Ready**: Navigation framework prepared for site manager app URL integration
- **Visual Differentiation**: Construction-themed icons (User for customers, HardHat for site managers)
- **Mobile Responsive**: Both desktop and mobile navigation include site manager access option
- **Coming Soon Status**: Placeholder functionality until site manager application deployment

## Competitive Analysis (July 16, 2025)

### Market Overview
The UK construction compliance software market is experiencing rapid growth, with the global AI construction market projected to reach £22.68 billion by 2032 (24.6% annual growth). Key market segments include document management, health & safety compliance, and AI-powered document generation.

### Direct Competitors

#### **Premium Enterprise Solutions (£500+ per month)**
- **Procore**: Leading global platform with extensive document control, BIM integration, custom pricing for large firms
- **Autodesk Construction Cloud**: Enterprise-level with AI-powered capabilities, Construction IQ for risk analysis
- **Access Construction (COINS)**: UK-specific accounting and compliance features, tailored pricing for established firms

#### **Mid-Market Solutions (£200-500 per month)**
- **Buildertrend**: £99-£499/month, established document organization and project management
- **PlanRadar**: Document sharing with BIM collaboration, 30-day free trial approach
- **Bluebeam**: PDF markups and secure cloud storage, starting £200/month

#### **Health & Safety Specialists (£50-200 per month)**
- **MY Compliance Management**: £159/month for 100 users, comprehensive HSEQ module approach
- **Health & Safety Xpert**: Annual subscriptions, UK small builder focus with risk assessments
- **Work Wallet**: Freemium model with mobile-first safety inspections and contractor gateway
- **TeamWorkSmart**: Custom pricing, real-time safety inspections with offline capability

### WorkDoc360's Competitive Positioning

#### **Unique Advantages**
1. **AI-First Document Generation**: Advanced Anthropic Claude integration for intelligent compliance document creation
2. **UK Construction Focus**: Exclusive British terminology, all major trades covered (26 categories vs competitors' generic approaches)
3. **Subscription Commitment Model**: 12-month contracts eliminate document exploitation (competitors offer free trials)
4. **Comprehensive Trade Coverage**: From core building to emerging specialties (renewable energy, modular construction)
5. **Professional Tier Strategy**: ISO 9001:2015 quality management documents as premium differentiator

#### **Pricing Strategy Analysis**
- **WorkDoc360 Essential**: £65/month (3 users) - competitive with specialist solutions
- **WorkDoc360 Professional**: £129/month (10 users) - positioned between mid-market and enterprise
- **Market Positioning**: Premium value at competitive pricing, avoiding race-to-bottom free trial model

#### **Technology Differentiation**
- **Modern Stack**: React/TypeScript frontend vs competitors' legacy systems
- **Native Authentication**: Self-contained user management vs external dependencies
- **Mobile-First API**: Prepared for native mobile app integration
- **Real-Time Collaboration**: Advanced annotation and review system for document workflows

### Market Gaps & Opportunities

#### **Underserved Segments**
1. **Small-Medium UK Contractors**: Gap between basic safety apps (£50-100) and enterprise solutions (£500+)
2. **Trade-Specific Compliance**: Competitors offer generic construction vs WorkDoc360's trade-specialised approach
3. **AI Document Intelligence**: Most platforms add AI features vs WorkDoc360's AI-first architecture
4. **UK Regulatory Focus**: Global platforms adapted vs purpose-built UK compliance solution

#### **Emerging Trends (2025)**
- **AI Document Analysis**: 24.6% annual growth in AI construction applications
- **Mobile-First Adoption**: Field teams demanding offline-capable, touch-optimised interfaces
- **Regulatory Tightening**: 60,000+ CSCS cards expired end 2024, driving compliance urgency
- **Integration Demands**: Construction firms seeking unified platforms vs multiple point solutions

### Strategic Recommendations

#### **Immediate Competitive Actions**
1. **Emphasise AI Advantage**: Position as only true AI-native platform in UK construction compliance
2. **Trade Specialisation Marketing**: Highlight comprehensive UK trade coverage vs competitors' limited scope
3. **Professional Tier Push**: ISO 9001 documents as clear differentiator from basic safety platforms
4. **Customer Success Stories**: Document ROI vs expensive enterprise solutions and inadequate basic tools

#### **Long-Term Market Strategy**
1. **Mobile App Development**: Native iOS/Android apps to compete with mobile-first competitors
2. **Enterprise Integration**: API partnerships with major UK construction software (SAGE, etc.)
3. **Industry Certification**: Pursue official endorsements from UK trade associations
4. **Advanced AI Features**: Predictive compliance analytics, automated risk scoring beyond document generation