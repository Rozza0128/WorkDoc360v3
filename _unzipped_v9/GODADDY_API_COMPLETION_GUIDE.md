# 🔧 Complete GoDaddy API Fix Guide

## Current Issue
The GoDaddy API credentials return "UNABLE_TO_AUTHENTICATE" - they are completely invalid.

## Step-by-Step Fix Process

### 1. Access GoDaddy Developer Portal
1. **Log into the GoDaddy account that owns workdoc360.com**
2. **Go to:** https://developer.godaddy.com/keys
3. **Verify domain ownership:** Check that workdoc360.com appears in "My Domains"

### 2. Delete Current Invalid API Key
1. **Find the existing API key** (if any)
2. **Delete it completely** to avoid confusion
3. **Clear any cached credentials**

### 3. Create New Production API Key
1. **Click "Create New API Key"**
2. **Environment:** Select **"Production"** (NOT OTE/Test)
3. **Name:** "WorkDoc360 Subdomain Manager"
4. **Permissions:** Ensure "Domain Management" is enabled
5. **Click "Create"**

### 4. Copy Credentials Immediately
**IMPORTANT:** Credentials are only shown once!

Copy both values exactly:
- **API Key:** (34 characters, starts with letters)
- **API Secret:** (22 characters)

### 5. Update Replit Secrets
1. **Go to Replit Secrets panel**
2. **Update GODADDY_API_KEY** with the new API key
3. **Update GODADDY_API_SECRET** with the new API secret
4. **Save changes**

### 6. Test the Fix
After updating secrets, test with:
```bash
curl -X POST http://localhost:5000/api/dev/test-godaddy-setup
```

Expected result: `{"success": true, "message": "GoDaddy API connection successful"}`

### 7. Deploy Subdomain Pool
Once authentication works:
```bash
curl -X POST http://localhost:5000/api/dev/setup-subdomain-pool
```

This will create 25+ subdomains automatically for instant customer assignment.

## Common Issues & Solutions

### Issue: Still getting "UNABLE_TO_AUTHENTICATE"
**Solution:** The API key was created under a different GoDaddy account
- Verify you're logged into the account that owns workdoc360.com
- Check "My Domains" section shows workdoc360.com

### Issue: "ACCESS_DENIED" after authentication works
**Solution:** Domain permissions not granted
- Recreate API key with explicit domain management permissions
- Ensure "Production" environment (not OTE)

### Issue: API key format looks wrong
**Solution:** Copy credentials exactly as shown
- No spaces or line breaks
- Include all characters
- Don't modify the format

## Verification Steps
After fixing, you should see:
1. ✅ Authentication test passes
2. ✅ Domain list includes workdoc360.com  
3. ✅ Subdomain creation succeeds
4. ✅ Customer assignment works instantly

## Business Impact
Once fixed, customers can get instant subdomains:
- £65/month automatic subdomain assignment
- company1.workdoc360.com, company2.workdoc360.com, etc.
- Fully automated customer portal creation

The entire automated system is ready - it just needs valid GoDaddy credentials.