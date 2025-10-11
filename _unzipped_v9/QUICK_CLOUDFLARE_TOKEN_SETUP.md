# Quick Cloudflare API Token Setup (5 Minutes)

## What You're Looking At
You're currently in the Cloudflare API Tokens section - perfect! You can see "No API tokens" which confirms why the authentication wasn't working.

## Step-by-Step Instructions

### 1. Create API Token
Click the **"Create Token"** button

### 2. Choose Template
Select **"Custom token"** (gives you precise control over permissions)

### 3. Configure Token Settings
**Token name:** `WorkDoc360 Subdomain Manager`

**Permissions:** (Add these exact permissions)
- Zone : Edit : Include : workdoc360.com
- Zone : Read : Include : workdoc360.com

**Zone Resources:**
- Include : Specific zone : workdoc360.com

**Account Resources:** (Leave empty)

**Client IP Address Filtering:** (Leave empty)

**TTL:** (Leave as default)

### 4. Create and Copy Token
1. Click **"Continue to summary"**
2. Review the settings
3. Click **"Create Token"**
4. **COPY THE TOKEN** - it will look like: `abc123def456ghi789...`

### 5. Update Replit Secrets
1. Go to your Replit Secrets
2. Replace `CLOUDFLARE_API_TOKEN` with the new token
3. Remove `CLOUDFLARE_EMAIL` (not needed for API tokens)
4. Keep `CLOUDFLARE_ZONE_ID` as is

### 6. Get Zone ID (If Needed)
1. Go back to Cloudflare dashboard
2. Click on `workdoc360.com`
3. Copy the Zone ID from the right sidebar
4. Update `CLOUDFLARE_ZONE_ID` in Replit Secrets if needed

## Test After Setup
Once you've updated the token, we can immediately test:
```bash
node test-cloudflare-fixed.js
```

## What This Enables
- Automatic creation of customer subdomains (e.g., `plastermaster.workdoc360.com`)
- £65/month customers get instant branded portals
- Complete automation from payment to portal access

The technical system is ready - just needs this API token to go live!