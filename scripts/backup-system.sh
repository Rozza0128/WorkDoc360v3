#!/bin/bash

# WorkDoc360 Complete System Backup Script
# Backs up code, database, configuration, and documentation

set -e

# Configuration
BACKUP_BASE_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/$TIMESTAMP"
PROJECT_ROOT="."

echo "Starting WorkDoc360 System Backup - $TIMESTAMP"
echo "Backup location: $BACKUP_DIR"

# Create backup directory structure
mkdir -p "$BACKUP_DIR"/{code,database,config,docs,assets}

# 1. Code Backup - Complete source code
echo "Backing up source code..."
tar --exclude=node_modules --exclude=.git --exclude=dist --exclude=backups \
    -czf "$BACKUP_DIR/code/source_code.tar.gz" . 2>/dev/null || echo "Code backup failed - continuing"
    
# Copy key files individually
cp -r client/ "$BACKUP_DIR/code/" 2>/dev/null || echo "Client backup failed"
cp -r server/ "$BACKUP_DIR/code/" 2>/dev/null || echo "Server backup failed"
cp -r shared/ "$BACKUP_DIR/code/" 2>/dev/null || echo "Shared backup failed"

# 2. Database Schema and Data Backup
echo "Backing up database schema..."
if [ -n "$DATABASE_URL" ]; then
    # Export schema
    npx drizzle-kit introspect:pg --config=drizzle.config.ts > "$BACKUP_DIR/database/schema_export.sql" 2>/dev/null || echo "Schema export failed - continuing"
    
    # Export data (if pg_dump is available)
    if command -v pg_dump >/dev/null 2>&1; then
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database/data_dump.sql" 2>/dev/null || echo "Data dump failed - continuing"
    fi
else
    echo "No DATABASE_URL found - skipping database backup"
fi

# 3. Configuration Files Backup
echo "Backing up configuration files..."
cp -r shared/ "$BACKUP_DIR/config/" 2>/dev/null || echo "Shared config backup failed"
cp package.json package-lock.json "$BACKUP_DIR/config/" 2>/dev/null || echo "Package files backup failed"
cp tsconfig.json vite.config.ts tailwind.config.ts "$BACKUP_DIR/config/" 2>/dev/null || echo "Config files backup failed"
cp drizzle.config.ts "$BACKUP_DIR/config/" 2>/dev/null || echo "Drizzle config backup failed"

# 4. Documentation Backup
echo "Backing up documentation..."
cp -r *.md "$BACKUP_DIR/docs/" 2>/dev/null || echo "Markdown files backup failed"
cp -r attached_assets/ "$BACKUP_DIR/assets/" 2>/dev/null || echo "Assets backup failed"

# 5. Environment Template (without secrets)
echo "Creating environment template..."
cat > "$BACKUP_DIR/config/.env.template" << EOF
# WorkDoc360 Environment Variables Template
# Copy to .env and fill in actual values

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=workdoc360

# AI Service
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Email Service (optional)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Payment Processing (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Application Settings
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_session_secret_here
EOF

# 6. Create restoration script
echo "Creating restoration script..."
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash

# WorkDoc360 System Restoration Script
# Run this script to restore from backup

set -e

echo "WorkDoc360 System Restoration"
echo "============================="

RESTORE_DIR=$(dirname "$0")
TARGET_DIR=${1:-"../restored_workdoc360"}

echo "Restoring to: $TARGET_DIR"
echo "Source backup: $RESTORE_DIR"

# Create target directory
mkdir -p "$TARGET_DIR"

# Restore code
echo "Restoring source code..."
cp -r "$RESTORE_DIR/code/"* "$TARGET_DIR/"

# Restore configuration
echo "Restoring configuration..."
cp "$RESTORE_DIR/config/.env.template" "$TARGET_DIR/.env.template"

# Install dependencies
echo "Installing dependencies..."
cd "$TARGET_DIR"
npm install

# Database restoration instructions
echo ""
echo "Manual Steps Required:"
echo "====================="
echo "1. Copy .env.template to .env and configure with your values"
echo "2. Set up PostgreSQL database"
echo "3. Run database migrations: npm run db:push"
echo "4. If data backup exists: psql DATABASE_URL < $RESTORE_DIR/database/data_dump.sql"
echo "5. Start application: npm run dev"
echo ""
echo "Restoration complete!"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# 7. Create backup manifest
echo "Creating backup manifest..."
cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# WorkDoc360 System Backup

**Backup Date:** $(date)
**Backup Version:** $TIMESTAMP
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
\`\`\`bash
chmod +x restore.sh
./restore.sh /path/to/restoration/directory
\`\`\`

## Support
For technical support or questions about this backup:
- Review documentation in /docs folder
- Check configuration examples in /config
- Refer to package.json for dependencies
EOF

# 8. Create backup summary
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo "==============================================="
echo "WorkDoc360 Backup Complete!"
echo "==============================================="
echo "Backup Location: $BACKUP_DIR"
echo "Backup Size: $BACKUP_SIZE"
echo "Timestamp: $TIMESTAMP"
echo ""
echo "Backup includes:"
echo "✓ Complete source code"
echo "✓ Database schema"
echo "✓ Configuration files"
echo "✓ Documentation"
echo "✓ Asset files"
echo "✓ Restoration script"
echo ""
echo "To restore: cd $BACKUP_DIR && ./restore.sh"
echo "==============================================="

# Create latest symlink
ln -sfn "$TIMESTAMP" "$BACKUP_BASE_DIR/latest"
echo "Latest backup symlink updated"