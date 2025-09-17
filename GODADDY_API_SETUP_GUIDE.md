# GoDaddy API Setup Guide

## Step-by-Step Instructions

### 1. **Visit GoDaddy Developer Portal**
Go to: **https://developer.godaddy.com/**

### 2. **Sign In**
- Click "Sign In" in the top right
- Use your existing GoDaddy account credentials
- (The same account that owns workdoc360.com)

### 3. **Create an Application**
- Click "Create Application" or "My Applications"
- Fill in the application details:
  - **Application Name:** `WorkDoc360 Subdomain Manager`
  - **Description:** `Automated subdomain creation for customer portals`
  - **Environment:** Choose "Production" (for live use)

### 4. **Get Your API Credentials**
After creating the application, you'll see:
- **API Key:** (looks like: `dPP1eXaMpLe_AaAaAaAaAaAaAaAa`)
- **API Secret:** (looks like: `BbBbBbBbBbBbBbBbBbBbBb`)

### 5. **Copy Both Values**
You'll need both the API Key and Secret for the system to work.

## What These Credentials Do

### **API Key + Secret = Full DNS Control**
- Create new subdomains automatically
- Update existing DNS records
- Delete old subdomains when needed
- All done programmatically without manual work

### **Security Note**
- These credentials give full control over your domain's DNS
- They're stored securely in Replit's environment variables
- Never share them publicly or commit them to code

## Test the Credentials

Once you have them, I can test the connection:
```
1. Add credentials to Replit environment
2. Test API connection with GoDaddy
3. Create a test subdomain (like: test1.workdoc360.co.uk)
4. Verify it works properly
```

## Troubleshooting

### **If you can't find the Developer Portal:**
- Make sure you're logged into the same GoDaddy account that owns workdoc360.com
- Some accounts may need to be upgraded for API access

### **If API access is restricted:**
- Contact GoDaddy support to enable API access for your account
- Mention you need it for automated subdomain management

### **Production vs Sandbox:**
- Choose "Production" environment for live customer use
- Sandbox is only for testing and won't work with your real domain

## Alternative: Manual Setup First

If you prefer to start without API access:
1. **Manually create 10 test subdomains** in GoDaddy DNS manager
2. **Test the customer signup flow** with pre-loaded subdomains
3. **Get API credentials later** for automation

Would you like me to guide you through either approach?