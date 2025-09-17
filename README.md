# WorkDoc360 - Construction Compliance Management Platform

## Overview

WorkDoc360 is an advanced AI-powered construction compliance management platform specifically designed for the UK construction industry. The system combines real-time CSCS card verification using RPA technology with comprehensive personnel management and AI-driven document generation.

## Key Features

### 🏗️ CSCS Card Verification
- **RPA Photo Extraction**: Automated photo extraction from CSCS Smart Check website
- **Real-time Validation**: Live verification of CSCS cards with comprehensive status checking
- **All Card Types**: Support for all 12 CSCS card types and colors
- **Personnel Integration**: Automatic integration with personnel records system

### 👥 Personnel Management
- **Multiple Employment Types**: Permanent, temporary, subcontractor, agency, and apprentice workers
- **Contract Tracking**: Day rates, contract dates, and employment terms
- **Site Assignment**: Project codes and site-specific assignments
- **Insurance Management**: Coverage tracking and provider details
- **Compliance Monitoring**: Automated alerts for expiring certifications

### 🤖 AI Document Generation
- **Anthropic Claude Integration**: Advanced AI for intelligent document creation
- **UK Compliance**: British construction terminology and regulatory compliance
- **Trade-Specific Templates**: Specialized documents for different construction trades
- **Real-time Generation**: Instant document creation with professional formatting

### 🔐 Security & Access Control
- **Multi-tenant Architecture**: Company-based data separation
- **Role-based Access**: Admin, Manager, and User permission levels
- **Native Authentication**: Secure email/password system with session management
- **Data Protection**: GDPR-compliant data handling and storage

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude for document generation
- **RPA**: Puppeteer-based automation for photo extraction
- **Payment**: Stripe integration for subscription management

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone [repository-url] workdoc360
cd workdoc360

# Install dependencies
npm install

# Set up environment
cp .env.template .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

## API Integration

### Confluence Documentation
Automatically sync all documentation to Confluence:

```bash
# Configure Confluence integration
cp .env.confluence.template .env.confluence
# Edit with your Confluence details

# Test connection
node scripts/test-confluence.js

# Sync all documentation
node scripts/sync-to-confluence.js
```

### External Services
- **CSCS Smart Check**: For card verification
- **Anthropic API**: For AI document generation
- **SendGrid**: For email notifications
- **Stripe**: For payment processing

## System Architecture

### Multi-Company Support
- Company-based data isolation
- Role-based access control
- Scalable multi-tenant design

### Personnel Management
- Comprehensive employment type support
- Contract and rate management
- Site assignment tracking
- Insurance and compliance monitoring

### Document Generation
- AI-powered template system
- UK construction compliance
- Trade-specific customization
- Professional formatting

## Backup & Recovery

### Automated Backup System
```bash
# Run complete system backup
./scripts/backup-system.sh

# View backup contents
ls -la backups/latest/
```

### Backup Contents
- Complete source code
- Database schema and data
- Configuration files
- Documentation and assets
- Restoration scripts

## Support & Documentation

### Complete Documentation Package
- **System Overview**: Architecture and business context
- **User Guides**: Step-by-step instructions for all features
- **API Documentation**: Complete endpoint reference
- **Technical Guides**: Implementation and development details
- **Administration**: Backup, security, and maintenance procedures

### Getting Help
- Review comprehensive documentation in project files
- Check troubleshooting guides for common issues
- Contact technical support for assistance

## Business Value

### For Construction Companies
- Streamlined CSCS card verification process
- Comprehensive personnel record management
- Automated compliance documentation
- Real-time workforce tracking and monitoring

### For Site Managers
- Quick verification of worker credentials
- Easy access to personnel information
- Automated compliance alerts and notifications
- Professional document generation

### For Administrators
- Multi-company management capabilities
- Role-based access control
- Comprehensive backup and recovery
- Professional documentation and training materials

## License

This project is proprietary software developed for the UK construction industry.

---

**WorkDoc360** - Professional construction compliance management for the digital age.