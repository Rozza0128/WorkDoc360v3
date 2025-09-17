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
