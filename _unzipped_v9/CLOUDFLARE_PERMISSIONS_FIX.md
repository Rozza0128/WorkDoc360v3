# Cloudflare API Token Permissions Fix

## Current Status ✅❌
- **Token Authentication**: ✅ Working perfectly
- **Zone Access**: ✅ Can read zone information  
- **DNS Permissions**: ❌ Missing DNS:Edit permission

## The Issue
Your current API token only has Zone:Read permission but needs DNS:Edit to create subdomains for customer portals.

## Quick Fix (2 minutes)

### Option 1: Edit Existing Token (Recommended)
1. Go to [Cloudflare Dashboard > My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Find your existing token `uyruel1iFWjNDH-1ova2Mm6U3C9KoGlvg2YPFdw5`
3. Click "Edit" 
4. Add permission: **DNS:Edit** for zone `workdoc360.com`
5. Save changes

### Option 2: Create New Token (Alternative)
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom Token" template
4. Set permissions:
   - **Zone:Read** for zone `workdoc360.com`
   - **DNS:Edit** for zone `workdoc360.com`
5. Copy the new token and replace it in Replit Secrets

## Business Impact Once Fixed
- ✅ Instant subdomain creation for £65/month customers
- ✅ Automated branded portals (e.g., `plastermaster.workdoc360.com`)
- ✅ Zero manual work for customer onboarding
- ✅ Professional customer experience with custom domains

## Test Results After Fix
The system will automatically create:
1. Customer pays £65/month → Triggers subdomain creation
2. `businessname.workdoc360.com` created instantly
3. Customer gets isolated portal with their branding
4. Complete data separation per customer

**Ready to test immediately once you update the token permissions!**