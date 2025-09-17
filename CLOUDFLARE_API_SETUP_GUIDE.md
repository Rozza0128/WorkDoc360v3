# Cloudflare API Setup for WorkDoc360 Subdomain Automation

## Current Status
You have the automated subdomain system fully built, but need to create the Cloudflare API credentials to enable it.

## Step-by-Step Setup

### 1. Log into Cloudflare
Go to: https://dash.cloudflare.com

### 2. Get Your Zone ID
1. Click on your `workdoc360.com` domain
2. On the right sidebar, copy the **Zone ID** (32-character string)
3. Replace the current CLOUDFLARE_ZONE_ID in Replit Secrets

### 3. Create API Token (Recommended Method)
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Select **"Custom token"**
4. Set these permissions:
   ```
   Zone Permissions:
   - Zone:Edit (Include: workdoc360.com)
   - Zone:Read (Include: workdoc360.com)
   ```
5. Click **"Continue to summary"** → **"Create Token"**
6. Copy the token and replace CLOUDFLARE_API_TOKEN in Replit Secrets
7. Remove CLOUDFLARE_EMAIL (not needed for API tokens)

### 4. Alternative: Global API Key (Less Secure)
If you prefer to use the Global API Key:
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find **"Global API Key"** section
3. Click **"View"** and copy the key
4. Keep the current CLOUDFLARE_EMAIL setting
5. Use this key as CLOUDFLARE_API_TOKEN

## Test the Setup
Once configured, test with:
```bash
node test-cloudflare-fixed.js
```

## What This Enables
- **Automatic subdomain creation** when customers pay £65/month
- **Instant customer portals** like `plastermaster.workdoc360.com`
- **Complete data isolation** per customer
- **Professional branding** for each paying customer

## Business Impact
- **Zero manual work** for new customer onboarding
- **Scalable architecture** for unlimited paying customers
- **Professional appearance** with branded subdomains
- **Immediate portal access** after payment

The technical system is 100% ready - just needs these API credentials to go live.