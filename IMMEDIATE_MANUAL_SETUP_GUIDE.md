# 🎯 Immediate Manual DNS Setup - 5 Minutes

## Current Issue
workdoc360.com shows "Not Found" because the root domain DNS record is missing.

## Quick Fix in Cloudflare Dashboard

### Step 1: Access DNS Management
1. Go to https://dash.cloudflare.com
2. Log into your Cloudflare account
3. Click on **workdoc360.com** domain
4. Click **DNS** in the left menu
5. Click **Records** tab

### Step 2: Add Root Domain Record
Click **Add record** button and enter:

```
Type: A
Name: @
Content: 34.117.33.233
TTL: Auto
Proxy status: Proxied (orange cloud enabled)
```

Click **Save**

### Step 3: Test Results (after 5-10 minutes)
- https://workdoc360.com - Will work (currently shows "Not Found")
- https://www.workdoc360.com - Already works

## Optional: Customer Portal Subdomains
For your £65/month system, add these additional records:

```
company1     → 34.117.33.233 (Proxied)
company2     → 34.117.33.233 (Proxied)
company3     → 34.117.33.233 (Proxied)
business1    → 34.117.33.233 (Proxied)
business2    → 34.117.33.233 (Proxied)
construction1 → 34.117.33.233 (Proxied)
scaffolding1 → 34.117.33.233 (Proxied)
plastering1  → 34.117.33.233 (Proxied)
```

## What This Accomplishes
- Fixes "Not Found" error on workdoc360.com
- Enables customer portals (company1.workdoc360.com, etc.)
- Activates your automated £65/month subdomain assignment system
- Provides SSL certificates automatically via Cloudflare

## Business Impact
Your complete WorkDoc360 platform goes live immediately:
- Customer acquisition system operational
- Professional customer portal URLs
- £65/month revenue stream activated
- Multi-tenant architecture functional

The @ record pointing to 34.117.33.233 is the only missing piece.