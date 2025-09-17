#!/bin/bash

# WorkDoc360 Quick Backup Script
# Creates immediate backup and optionally syncs with Confluence

set -e

echo "🚀 WorkDoc360 Quick Backup Starting..."

# Create timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="backups/quick-backup-$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to copy with error handling
safe_copy() {
    if [ -e "$1" ]; then
        cp -r "$1" "$2" 2>/dev/null || echo "⚠️  Could not copy $1"
    fi
}

# Backup critical files and directories
echo "📁 Backing up source code..."
safe_copy "client" "$BACKUP_DIR/"
safe_copy "server" "$BACKUP_DIR/"
safe_copy "shared" "$BACKUP_DIR/"
safe_copy "scripts" "$BACKUP_DIR/"

echo "📄 Backing up configuration..."
safe_copy "package.json" "$BACKUP_DIR/"
safe_copy "package-lock.json" "$BACKUP_DIR/"
safe_copy "tsconfig.json" "$BACKUP_DIR/"
safe_copy "vite.config.ts" "$BACKUP_DIR/"
safe_copy "tailwind.config.ts" "$BACKUP_DIR/"
safe_copy "drizzle.config.ts" "$BACKUP_DIR/"
safe_copy "components.json" "$BACKUP_DIR/"
safe_copy ".replit" "$BACKUP_DIR/"
safe_copy ".gitignore" "$BACKUP_DIR/"

echo "📚 Backing up documentation..."
safe_copy "replit.md" "$BACKUP_DIR/"
safe_copy "*.md" "$BACKUP_DIR/" 2>/dev/null || true

echo "🖼️  Backing up assets..."
safe_copy "attached_assets" "$BACKUP_DIR/"
safe_copy "uploaded_assets" "$BACKUP_DIR/"

# Create backup manifest
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
WorkDoc360 Quick Backup
======================
Created: $(date)
Timestamp: $TIMESTAMP
Host: $(hostname)
User: $(whoami)
Directory: $(pwd)

Contents:
- Source code (client, server, shared)
- Configuration files
- Documentation
- Assets and uploads
- Build configurations

Restoration:
1. Extract backup to project directory
2. Run: npm install
3. Set up environment variables
4. Run: npm run db:push
5. Start: npm run dev
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "📦 Backup size: $BACKUP_SIZE"

# Compress if zip is available
if command -v zip &> /dev/null; then
    echo "🗜️  Compressing backup..."
    cd backups
    zip -rq "quick-backup-$TIMESTAMP.zip" "quick-backup-$TIMESTAMP"
    rm -rf "quick-backup-$TIMESTAMP"
    echo "✅ Compressed backup created: backups/quick-backup-$TIMESTAMP.zip"
else
    echo "✅ Backup created: $BACKUP_DIR"
fi

echo "🎉 Quick backup completed successfully!"

# Optional: Run full backup system if available
if [ "$1" = "--full" ] && [ -f "scripts/backup-system.js" ]; then
    echo ""
    echo "🔄 Running comprehensive backup system..."
    node scripts/backup-system.js backup
fi

# Optional: Sync with Confluence
if [ "$1" = "--sync" ] || [ "$2" = "--sync" ]; then
    if [ -f "scripts/backup-system.js" ]; then
        echo ""
        echo "🔄 Syncing with Confluence..."
        node scripts/backup-system.js sync
    else
        echo "⚠️  Confluence sync not available (backup-system.js not found)"
    fi
fi