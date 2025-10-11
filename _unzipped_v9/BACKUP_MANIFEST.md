# WorkDoc360 System Backup

**Backup Date:** Thu Jul 24 07:29:46 PM UTC 2025
**Backup Version:** 20250724_192931
**System Status:** Complete backup of WorkDoc360 construction compliance platform

## Backup Contents

### 1. Source Code (/code)
- Complete React/TypeScript frontend
- Node.js/Express backend
- All components and utilities
- Configuration files

### 2. Database (/database)
- Database schema export
- Data dump (if available)
- Migration files

### 3. Configuration (/config)
- Shared schemas and types
- Package dependencies
- Build and development configs
- Environment template

### 4. Documentation (/docs)
- All markdown documentation
- Technical guides
- API documentation

### 5. Assets (/assets)
- Attached files and images
- Static resources

## Technology Stack
- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Drizzle ORM
- AI: Anthropic Claude integration
- Authentication: Native email/password system

## Key Features Included
- CSCS card verification with RPA system
- Personnel management for all employment types
- AI-powered document generation
- Compliance tracking and alerts
- Multi-company support with role-based access

## Restoration
Run the restore.sh script to restore this backup:
```bash
chmod +x restore.sh
./restore.sh /path/to/restoration/directory
```

## Support
For technical support or questions about this backup:
- Review documentation in /docs folder
- Check configuration examples in /config
- Refer to package.json for dependencies
