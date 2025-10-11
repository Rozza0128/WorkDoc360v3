# WorkDoc360 - Complete API Reference

## API Overview
WorkDoc360 provides a comprehensive RESTful API for construction compliance management with automated customer acquisition. All endpoints support multi-tenant architecture with company-specific data isolation.

**Base URL**: `https://workdoc360.com/api` or `https://{company-subdomain}.workdoc360.com/api`

---

## 🔐 Authentication APIs

### Standard Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/user
```

### Two-Factor Authentication
```http
POST /api/auth/setup-2fa
POST /api/auth/enable-2fa
POST /api/auth/verify-2fa
POST /api/auth/disable-2fa
POST /api/auth/generate-backup-codes
```

### Mobile Authentication (Token-based)
```http
POST /api/mobile/login
POST /api/mobile/register
GET  /api/mobile/user
```
**Headers**: `Authorization: Bearer {token}`

### Development Authentication (DEV only)
```http
POST /api/auth/test-login
POST /api/auth/test-logout
```

---

## 🏢 Company Management APIs

### Company Operations
```http
POST /api/companies                    # Create new company
GET  /api/companies                    # List user's companies
GET  /api/companies/{id}               # Get company details
PUT  /api/companies/{id}               # Update company
```

### Company Subdomain Management
```http
PUT  /api/companies/{id}/subdomain     # Update company subdomain
GET  /api/company/homepage             # Multi-tenant homepage data
PUT  /api/company/{id}/branding        # Update company branding
```

### Company Metrics & Analytics
```http
GET  /api/companies/{id}/metrics       # Compliance dashboard metrics
```

---

## 🌐 Cloudflare DNS Automation APIs

### Subdomain Creation
```http
GET  /api/cloudflare/test-cloudflare                 # Test Cloudflare connection
POST /api/cloudflare/create-customer-subdomain      # Create customer subdomain
```

### Test & Development
```http
POST /api/test/simulate-customer-signup    # Test complete customer workflow
GET  /api/test/cloudflare-status          # Check Cloudflare connection
POST /api/test/create-test-subdomain       # Create temporary test subdomain
```

---

## 👥 User & Team Management APIs

### Company Users
```http
POST /api/companies/{id}/users           # Add user to company
GET  /api/companies/{id}/users           # List company users
PUT  /api/companies/{id}/users/{userId}  # Update user role
DELETE /api/companies/{id}/users/{userId} # Remove user
```

---

## 🎯 CSCS Card Management APIs

### CSCS Operations
```http
POST /api/companies/{id}/cscs-cards      # Add CSCS card
GET  /api/companies/{id}/cscs-cards      # List company CSCS cards
PUT  /api/companies/{id}/cscs-cards/{cardId} # Update CSCS card
DELETE /api/companies/{id}/cscs-cards/{cardId} # Delete CSCS card
```

### CSCS Verification
```http
POST /api/cscs/verify-card               # Verify CSCS card with UK API
POST /api/cscs/verify-image              # AI-powered image verification
GET  /api/cscs/card-types               # List available card types
```

---

## 📋 Risk Assessment APIs

### Risk Assessment Operations
```http
POST /api/companies/{id}/risk-assessments    # Create risk assessment
GET  /api/companies/{id}/risk-assessments    # List risk assessments
GET  /api/companies/{id}/risk-assessments/{assessmentId} # Get specific assessment
PUT  /api/companies/{id}/risk-assessments/{assessmentId} # Update risk assessment
DELETE /api/companies/{id}/risk-assessments/{assessmentId} # Delete risk assessment
```

### Risk Assessment Templates
```http
GET  /api/risk-assessment-templates         # List available templates
GET  /api/risk-assessment-templates/{type}  # Get template by trade type
```

---

## 📝 Method Statement APIs

### Method Statement Operations
```http
POST /api/companies/{id}/method-statements     # Create method statement
GET  /api/companies/{id}/method-statements     # List method statements
GET  /api/companies/{id}/method-statements/{statementId} # Get specific statement
PUT  /api/companies/{id}/method-statements/{statementId} # Update method statement
DELETE /api/companies/{id}/method-statements/{statementId} # Delete method statement
```

---

## 🗣️ Toolbox Talk APIs

### Toolbox Talk Operations
```http
POST /api/companies/{id}/toolbox-talks       # Create toolbox talk
GET  /api/companies/{id}/toolbox-talks       # List toolbox talks
GET  /api/companies/{id}/toolbox-talks/{talkId} # Get specific talk
PUT  /api/companies/{id}/toolbox-talks/{talkId} # Update toolbox talk
DELETE /api/companies/{id}/toolbox-talks/{talkId} # Delete toolbox talk
```

### Toolbox Talk Analytics
```http
GET  /api/companies/{id}/toolbox-talks/stats # Monthly statistics
GET  /api/companies/{id}/toolbox-talks/attendance/{talkId} # Attendance records
```

---

## ✅ Compliance Management APIs

### Compliance Items
```http
POST /api/companies/{id}/compliance-items    # Create compliance item
GET  /api/companies/{id}/compliance-items    # List compliance items
GET  /api/companies/{id}/compliance-items/overdue # List overdue items
PUT  /api/companies/{id}/compliance-items/{itemId}/status # Update status
```

### Compliance Tracking
```http
GET  /api/companies/{id}/compliance/dashboard # Compliance dashboard
GET  /api/companies/{id}/compliance/alerts    # Active compliance alerts
GET  /api/companies/{id}/compliance/score     # Overall compliance score
```

---

## 📄 Document Generation APIs

### AI Document Creation
```http
POST /api/companies/{id}/documents/generate  # Generate document with AI
GET  /api/companies/{id}/documents/generated # List generated documents
GET  /api/companies/{id}/documents/generated/{docId} # Get specific document
```

### Document Templates
```http
GET  /api/document-templates                 # List available templates
GET  /api/document-templates/{category}     # Templates by category
GET  /api/document-templates/iso9001        # ISO 9001 templates (Premium)
```

### Document Export & Download
```http
GET  /api/documents/{docId}/download         # Download document
POST /api/documents/{docId}/export          # Export to different format
GET  /api/documents/{docId}/preview         # Preview document
```

---

## 📤 File Upload APIs

### Company Logo Upload
```http
POST /api/companies/{id}/upload-logo        # Upload company logo
```
**Content-Type**: `multipart/form-data`
**Accepted**: JPG, PNG, SVG, GIF (max 10MB)

### Document Upload
```http
POST /api/companies/{id}/upload-documents   # Upload compliance documents
POST /api/companies/{id}/assess-documents   # Upload for AI assessment
```
**Content-Type**: `multipart/form-data`
**Accepted**: PDF, DOC, DOCX, TXT, XLS, XLSX (max 10MB)

---

## 🔧 Administrative APIs

### Subdomain Pool Management
```http
POST /api/admin/setup-subdomains            # Setup subdomain pool
GET  /api/admin/subdomain-stats             # Pool statistics
POST /api/admin/expand-subdomain-pool       # Add more subdomains
```

### System Health & Monitoring
```http
GET  /api/health                            # System health check
GET  /api/status                            # Service status
GET  /api/version                           # API version info
```

---

## 📊 Analytics & Reporting APIs

### Company Analytics
```http
GET  /api/companies/{id}/analytics/overview      # Company overview stats
GET  /api/companies/{id}/analytics/compliance    # Compliance analytics
GET  /api/companies/{id}/analytics/documents     # Document analytics
GET  /api/companies/{id}/analytics/team          # Team activity analytics
```

### Compliance Reports
```http
GET  /api/companies/{id}/reports/compliance      # Generate compliance report
GET  /api/companies/{id}/reports/cscs-expiry     # CSCS expiry report
GET  /api/companies/{id}/reports/overdue-items   # Overdue items report
```

---

## 🎨 Content Management APIs

### Homepage Content (Multi-tenant)
```http
GET  /api/company/homepage                   # Company-specific homepage
PUT  /api/company/content                    # Update company content
GET  /api/company/branding                   # Get branding settings
```

---

## 💳 Payment Integration APIs

### Subscription Management
```http
POST /api/payments/create-subscription       # Create Stripe subscription
GET  /api/payments/subscription-status       # Check subscription status
POST /api/payments/update-subscription       # Update subscription
POST /api/payments/cancel-subscription       # Cancel subscription
```

### Payment Webhooks
```http
POST /api/webhooks/stripe                    # Stripe webhook handler
POST /api/webhooks/payment-success           # Payment success handler
```

---

## 📧 Email & Notification APIs

### Email Services
```http
POST /api/email/send-welcome                 # Send welcome email
POST /api/email/compliance-alert             # Send compliance alerts
POST /api/email/document-reminder            # Send document reminders
```

### Notification Settings
```http
GET  /api/companies/{id}/notifications       # Get notification settings
PUT  /api/companies/{id}/notifications       # Update notification settings
```

---

## 🔍 Search & Filter APIs

### Document Search
```http
GET  /api/companies/{id}/documents/search?q={query}     # Search documents
GET  /api/companies/{id}/documents/filter?type={type}   # Filter by type
```

### Company Search
```http
GET  /api/companies/search?name={name}       # Search companies by name
GET  /api/users/search?email={email}         # Search users by email
```

---

## 📱 Mobile-Specific APIs

### Mobile Dashboard
```http
GET  /api/mobile/dashboard/{companyId}       # Mobile dashboard data
GET  /api/mobile/quick-actions/{companyId}   # Quick action buttons
GET  /api/mobile/notifications/{companyId}   # Mobile notifications
```

### Offline Sync
```http
GET  /api/mobile/sync/{companyId}            # Get data for offline sync
POST /api/mobile/sync/{companyId}           # Upload offline changes
```

---

## 🎯 API Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Multi-tenant Response (Subdomains)
```json
{
  "isCompanySubdomain": true,
  "company": {
    "id": 17,
    "name": "PlasterMaster",
    "logoUrl": "...",
    "brandingColors": { ... }
  },
  "data": { ... }
}
```

---

## 🔒 Authentication & Permissions

### Permission Levels
- **Admin**: Full company access and management
- **Manager**: Team management and document creation
- **Team Leader**: Document creation and team oversight  
- **Worker**: View access and basic document upload

### API Key Authentication (Future)
```http
Authorization: Bearer {api_key}
X-Company-ID: {company_id}
```

---

## 🌐 Multi-Tenant Architecture

### Subdomain Detection
All APIs automatically detect company context from subdomain:
- `plastermaster.workdoc360.com` → Company: PlasterMaster
- Data isolation enforced at API level
- Company branding applied automatically

### Company Context Headers
```http
X-Company-Subdomain: plastermaster
X-Is-Company-Subdomain: true
X-Company-ID: 17
```

---

## 📝 API Versioning

### Current Version: v1
- Base path: `/api/`
- Future versions: `/api/v2/`
- Backwards compatibility maintained for 12 months

### Version Headers
```http
API-Version: 1.0
X-API-Version: 1.0
```

---

## ⚡ Rate Limiting

### Standard Limits
- **Authenticated users**: 1000 requests/hour
- **Anonymous users**: 100 requests/hour
- **File uploads**: 50 requests/hour
- **AI generation**: 20 requests/hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1629123456
```

---

## 🛠️ API Tools & Testing

### Testing Endpoints
- **Postman Collection**: Available for all endpoints
- **Swagger UI**: Interactive API documentation
- **Test Environment**: `https://test.workdoc360.com/api`

### API Status
- **Live Demo**: https://plastermaster.workdoc360.com/api
- **Production**: 100% operational
- **Uptime**: 99.9% SLA

This comprehensive API reference covers all endpoints in the WorkDoc360 platform, designed specifically for UK construction compliance management with automated customer acquisition capabilities.