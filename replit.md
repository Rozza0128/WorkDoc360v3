# WorkDoc360 - Construction Compliance Management System

## Overview
WorkDoc360 is a comprehensive construction industry compliance management platform. It streamlines health and safety documentation, certification tracking, and regulatory compliance, specifically for scaffolding, plastering, and general building contractors. The system provides industry-specific compliance tools, automated tracking, and AI-powered document generation to enhance efficiency and ensure adherence to UK construction standards. The business vision is to provide a comprehensive, AI-first solution that addresses the specific compliance needs of UK construction trades, aiming for a significant share of the rapidly growing AI construction market.

## User Preferences
Preferred communication style: Simple, everyday language.
Pricing structure: Starts at £65/month with additional charges for extra users and custom requests.
Language: **CRITICAL - ALL CONTENT MUST USE UK ENGLISH AND BRITISH CONSTRUCTION TERMINOLOGY ONLY**
- Use British spellings (realise, optimise, specialise, centre, colour, etc.)
- Use British construction terms (site, programme, labour, etc.)
- Never use American terms (program, labor, optimize, etc.)
User management: Multi-level user privileges (Admin can change everything, users can upload).
Compliance notifications: Automated prompts for overdue documents and missing toolbox talks.
DNS Provider: Prefers GoDaddy (cost-effective) over Cloudflare for automated subdomain management.

## System Architecture
The application employs a modern full-stack architecture with **multi-tenant subdomain support** and **automated customer acquisition**. The frontend is a React Single Page Application (SPA) with server-side rendering capabilities, built with TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, and Framer Motion for a responsive and visually appealing user experience. The backend is a RESTful API server using Node.js with Express.js and TypeScript.

**Core System Integration**: The platform integrates multiple external services including Cloudflare (DNS automation), Stripe (payments), Anthropic Claude (AI document generation), SendGrid (email), UK CSCS API (card verification), and Neon PostgreSQL (database). This creates a complete automated workflow from customer payment (£65/month) to instant branded portal creation with full compliance management capabilities.

**Multi-Tenant Architecture**: Each customer gets their own branded subdomain (e.g., `plastermaster.workdoc360.com`) with company-specific homepages, isolated document storage, and personalized branding. **Subdomain management** uses pre-loaded subdomain pools with GoDaddy DNS integration. Current status: Manual DNS setup required due to API domain access limitations.

Core architectural decisions include:
- **UI/UX Decisions**: A construction-themed design with UK English text and British construction terminology, consistent branding, responsive layouts optimized for mobile site use, and accessible components (Radix UI). Enhanced features like interactive progress navigation, smart quick actions, and real-time data integration are prioritized.
- **Technical Implementations**:
    - **Authentication**: A native email/password authentication system with `bcrypt` for password hashing and PostgreSQL-backed session management. Token-based authentication is implemented for mobile API integration.
    - **Database**: PostgreSQL with Drizzle ORM for type-safe operations, deployed on Neon Database for scalability.
    - **AI Integration**: Anthropic Claude AI is used for intelligent, UK-specific compliance document generation, with explicit prompts for British English and construction terminology.
    - **Payment Processing**: Stripe for subscription management and payment processing, supporting a 12-month commitment model with tiered pricing.
    - **Email Services**: SendGrid for automated notifications and communications.
    - **Compliance System**: Features real-time CSCS card verification via the official UK CSCS Smart Check API, a comprehensive compliance tracking system (ComplianceTracker), and a toolbox talk management system (ToolboxTalkManager) adhering to HSE guidelines.
    - **Document Management**: Capabilities for uploading, categorizing, and tracking expiration of various compliance documents (CSCS Cards, Risk Assessments, Method Statements, Toolbox Talks). Includes a Premium Document Library with tiered access to templates, including ISO 9001:2015 documentation.
    - **User and Company Management**: Supports multi-tenant company structures with role-based access control (Admin, Manager, User) and comprehensive UK trade coverage across 26 categories.
    - **Mobile Strategy**: Prioritizes a Progressive Web App (PWA) for immediate mobile presence, with plans for a native React Native application.
- **System Design Choices**:
    - Clear separation of concerns between frontend and backend.
    - Focus on type safety across the entire stack using TypeScript and Drizzle ORM.
    - Multi-tenant architecture supporting various UK business types and construction trades.
    - Scalability achieved through serverless database architecture and stateless server design.
    - Automated Confluence API integration for documentation synchronization.
    - **Recent Addition (Aug 2025):** Comprehensive subdomain management system with Cloudflare API integration for instant automated customer portal assignment. **Status: DNS CONFIGURED (Aug 22, 2025)** - workdoc360.com domain properly routed to Replit server via Cloudflare proxy with SSL certificates.
    - **AI Trade Categorization System (Aug 22, 2025):** Implemented comprehensive AI-powered trade analysis system using OpenAI-style classification. The system can analyze unknown UK construction trades and automatically categorize them with relevant compliance requirements. Features include:
      - Intelligent trade type detection for scaffolding, cabling, window fitting, telecoms, etc.
      - UK-specific compliance mapping (NASC, CISRS, FENSA, BS EN standards)
      - Automatic addition of analyzed trades to the system database
      - User-friendly AI dialog with detailed compliance information
      - Enhanced onboarding flow with 35+ predefined trades plus dynamic discovery
    - **Current Status**: Development server fully operational with subdomain detection, database integration, AI trade analysis, and API functionality. Custom domain DNS routing established. **Final step needed**: Deploy to production mode for external custom domain access while maintaining development server for testing.

## External Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **AI**: Anthropic Claude AI (via `@anthropic-ai/sdk`)
- **Payment Processing**: Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **Email Service**: SendGrid (`@sendgrid/mail`)
- **Authentication**: Native authentication system (custom email/password, `bcrypt`, `express-session`, `connect-pg-simple`)
- **Frontend Frameworks/Libraries**: React, TypeScript, Vite, Wouter, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui, Radix UI, Lucide React, Framer Motion, next-themes.
- **Backend Frameworks/Libraries**: Node.js, Express.js, TypeScript, tsx.
- **ORM**: Drizzle ORM, drizzle-kit, drizzle-zod.
- **Development Tools**: ESBuild, PostCSS, Autoprefixer, Browserslist.
- **Utility Libraries**: date-fns, nanoid, memoizee, qrcode, recharts, vaul, input-otp, react-day-picker, react-resizable-panels, embla-carousel-react, cmdk, class-variance-authority, tailwind-merge, tailwindcss-animate, clsx.