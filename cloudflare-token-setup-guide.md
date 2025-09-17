# Cloudflare API Token Setup for Subdomain Automation

## Why Not Global API Key?
The Global API Key you provided gives full account access, which is less secure. For subdomain automation, we need a **Custom API Token** with limited, specific permissions.

## Create the Correct Token Type

### Step 1: Go to API Tokens Page
Visit: https://dash.cloudflare.com/profile/api-tokens

### Step 2: Create Custom Token
1. Click **"Create Token"**
2. Select **"Custom token"** (not "Use template")

### Step 3: Set Permissions
Configure exactly these permissions:
```
Zone Permissions:
- Zone:Edit (for workdoc360.com)
- Zone:Read (for workdoc360.com)

Account Permissions:
- None needed
```

### Step 4: Set Zone Resources
```
Zone Resources:
- Include: Specific zone
- Select: workdoc360.com
```

### Step 5: Optional Settings
```
Client IP Address Filtering: (leave blank)
TTL: (leave default or set to never expire)
```

### Step 6: Create and Copy
1. Click **"Continue to summary"**
2. Click **"Create Token"**
3. **Copy the token** - it will look like:
   `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

## Update Replit Secrets
Replace the current CLOUDFLARE_API_TOKEN with the new custom token.

## Test the Setup
Once updated, we can immediately test the automated subdomain creation system.

## Why This Token Type?
- **More secure**: Limited to only what's needed
- **Zone-specific**: Only works with workdoc360.com
- **Auditable**: Cloudflare tracks API token usage
- **Revokable**: Can be disabled without affecting other services