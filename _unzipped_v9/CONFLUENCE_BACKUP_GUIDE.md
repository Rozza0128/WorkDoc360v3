# WorkDoc360 Complete System Backup & Confluence Documentation

## Executive Summary

This document provides comprehensive backup procedures and Confluence documentation structure for the WorkDoc360 construction compliance management platform. The system handles CSCS card verification, personnel management, and AI-powered document generation for UK construction companies.

## System Architecture Overview

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Anthropic Claude for document generation
- **Authentication**: Native email/password system with session management
- **Payment**: Stripe integration for subscription management

### Key Components
1. **CSCS Verification System** - RPA-based photo extraction and card validation
2. **Personnel Management** - Comprehensive workforce tracking (permanent, temporary, contractors, agency)
3. **Document Generation** - AI-powered compliance document creation
4. **Compliance Tracking** - Real-time monitoring and alerts
5. **Multi-tenant Architecture** - Company-based access control

## Backup Procedures

### 1. Automated Backup System

The backup script `scripts/backup-system.sh` creates comprehensive backups including:

```bash
# Run complete system backup
./scripts/backup-system.sh
```

**Backup Contents:**
- Source code (excluding node_modules, .git)
- Database schema and data
- Configuration files
- Documentation
- Asset files
- Environment templates
- Restoration scripts

### 2. Database Backup

```bash
# Manual database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Schema-only backup
pg_dump --schema-only $DATABASE_URL > schema_$(date +%Y%m%d).sql

# Data-only backup
pg_dump --data-only $DATABASE_URL > data_$(date +%Y%m%d).sql
```

### 3. Code Repository Backup

```bash
# Create Git bundle for offline backup
git bundle create workdoc360_$(date +%Y%m%d).bundle --all

# Export specific branch
git archive --format=tar.gz --prefix=workdoc360/ HEAD > workdoc360_$(date +%Y%m%d).tar.gz
```

### 4. Environment Configuration Backup

Critical environment variables to backup (without exposing secrets):

```env
# Database
DATABASE_URL
PGHOST, PGPORT, PGUSER, PGDATABASE

# AI Services
ANTHROPIC_API_KEY

# Email
SENDGRID_API_KEY

# Payment
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY

# Application
NODE_ENV, PORT, SESSION_SECRET
```

## Confluence Documentation Structure

### Page Hierarchy

```
WorkDoc360 Documentation
├── 1. System Overview
│   ├── Architecture Diagram
│   ├── Technology Stack
│   └── Security Model
├── 2. Installation & Setup
│   ├── Prerequisites
│   ├── Local Development
│   ├── Production Deployment
│   └── Environment Configuration
├── 3. User Guides
│   ├── Getting Started
│   ├── Company Management
│   ├── CSCS Card Verification
│   ├── Personnel Management
│   └── Document Generation
├── 4. API Documentation
│   ├── Authentication Endpoints
│   ├── Company Management API
│   ├── CSCS Verification API
│   ├── Document Generation API
│   └── Personnel Management API
├── 5. Technical Guides
│   ├── Database Schema
│   ├── Frontend Architecture
│   ├── Backend Architecture
│   ├── RPA System Setup
│   └── AI Integration
├── 6. Administration
│   ├── User Management
│   ├── System Monitoring
│   ├── Backup Procedures
│   ├── Security Configuration
│   └── Troubleshooting
├── 7. Business Processes
│   ├── Compliance Workflows
│   ├── Verification Procedures
│   ├── Document Templates
│   └── Reporting Guidelines
└── 8. Maintenance
    ├── Update Procedures
    ├── Performance Monitoring
    ├── Security Updates
    └── Disaster Recovery
```

### Key Documentation Pages

#### 1. System Overview Page

**Title:** WorkDoc360 - Construction Compliance Management Platform

**Content:**
- Executive summary of platform capabilities
- Business value proposition
- Target user base (UK construction companies)
- Key features overview
- Integration capabilities

#### 2. Architecture Documentation

**Title:** Technical Architecture & System Design

**Content:**
- System architecture diagram
- Database schema documentation
- API architecture
- Security model
- Scalability considerations
- Technology stack rationale

#### 3. CSCS Verification Guide

**Title:** CSCS Card Verification System

**Content:**
- RPA system overview
- Photo extraction process
- Card validation procedures
- Personnel record management
- Employment type classification
- Compliance tracking workflows

#### 4. Personnel Management Guide

**Title:** Comprehensive Personnel Management

**Content:**
- Employment type classification
- Contract management
- Site assignment tracking
- Insurance requirements
- Induction procedures
- Compliance monitoring

#### 5. AI Document Generation

**Title:** AI-Powered Document Generation

**Content:**
- Claude AI integration
- Document template system
- Generation workflows
- Quality assurance procedures
- Customization options
- UK compliance requirements

### Confluence Templates

#### Page Template: API Endpoint Documentation

```markdown
# [Endpoint Name]

## Overview
Brief description of endpoint purpose and functionality.

## Endpoint Details
- **URL**: `/api/endpoint-path`
- **Method**: GET/POST/PUT/DELETE
- **Authentication**: Required/Optional
- **Permissions**: Admin/Manager/User

## Request Format
```json
{
  "parameter": "value",
  "required_field": "string"
}
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

## Error Responses
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Code Examples
### JavaScript/TypeScript
```typescript
const response = await apiRequest('POST', '/api/endpoint', data);
```

### cURL
```bash
curl -X POST "http://localhost:5000/api/endpoint" \
  -H "Content-Type: application/json" \
  -d '{"parameter":"value"}'
```

## Testing
- Unit test examples
- Integration test scenarios
- Expected outcomes

## Related Documentation
- Links to related endpoints
- Business process documentation
- User guides
```

#### Page Template: User Guide

```markdown
# [Feature Name] User Guide

## Overview
Brief description of feature and its business purpose.

## Prerequisites
- Required permissions
- System requirements
- Setup steps

## Step-by-Step Instructions

### Task 1: [Action Name]
1. Navigate to [location]
2. Click [button/link]
3. Enter [required information]
4. Verify [expected result]

### Task 2: [Action Name]
1. [Detailed steps]

## Screenshots
[Include relevant screenshots with annotations]

## Troubleshooting

### Common Issues
**Issue**: Problem description
**Solution**: Step-by-step resolution

## Best Practices
- Recommended workflows
- Efficiency tips
- Security considerations

## Related Features
- Links to related functionality
- Integration points
- Business workflows
```

## Backup Automation & Scheduling

### Cron Job Setup

```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /path/to/workdoc360/scripts/backup-system.sh >> /var/log/workdoc360-backup.log 2>&1

# Weekly full backup on Sundays at 1 AM
0 1 * * 0 /path/to/workdoc360/scripts/backup-system.sh --full >> /var/log/workdoc360-backup-weekly.log 2>&1
```

### Backup Retention Policy

```bash
# Cleanup script - keep last 30 daily backups, 12 weekly backups
find backups/ -name "20*" -type d -mtime +30 -not -name "*_sunday" -delete
find backups/ -name "*_sunday" -type d -mtime +84 -delete
```

## Disaster Recovery Procedures

### 1. Complete System Restoration

```bash
# From backup
cd backups/latest
./restore.sh /opt/workdoc360-restored

# Configure environment
cp .env.template .env
# Edit .env with production values

# Database restoration
createdb workdoc360_restored
psql workdoc360_restored < database/data_dump.sql

# Start system
npm run build
npm start
```

### 2. Database Recovery

```bash
# Create new database
createdb workdoc360_recovery

# Restore from backup
psql workdoc360_recovery < backup_YYYYMMDD.sql

# Update application configuration
# Point DATABASE_URL to recovered database
```

### 3. Partial Recovery

```bash
# Restore specific components
cp backups/latest/config/shared/* shared/
cp backups/latest/code/server/* server/
npm install
npm run build
```

## Monitoring & Maintenance

### Health Check Endpoints

```bash
# Application health
curl http://localhost:5000/api/health

# Database connectivity
curl http://localhost:5000/api/db-health

# System metrics
curl http://localhost:5000/api/metrics
```

### Log Monitoring

```bash
# Application logs
tail -f logs/application.log

# Database logs
tail -f /var/log/postgresql/postgresql.log

# Backup logs
tail -f /var/log/workdoc360-backup.log
```

## Security Considerations

### Backup Security
- Encrypt sensitive backups
- Secure storage locations
- Access control for backup files
- Regular backup integrity verification

### Environment Security
- Secure secret management
- Regular security updates
- Access logging and monitoring
- SSL/TLS configuration

## Contact Information

### Technical Support
- **Primary**: System Administrator
- **Secondary**: Development Team
- **Emergency**: 24/7 Support Hotline

### Business Contacts
- **Product Owner**: Business Stakeholder
- **Compliance Officer**: Regulatory Compliance
- **Operations Manager**: Day-to-day Operations

---

*Document Version: 1.0*  
*Last Updated: $(date)*  
*Next Review: $(date -d "+3 months")*