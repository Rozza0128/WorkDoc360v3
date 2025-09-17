# Domain Setup Guide: Connecting workdoc360.com (via Cloudflare) to Replit

## Your Setup: workdoc360.com + Cloudflare Nameservers
Since you're using Cloudflare nameservers (molly.ns.cloudflare.com / wesley.ns.cloudflare.com), you need to configure DNS in **Cloudflare Dashboard**, not GoDaddy.

## Step-by-Step Process

### 1. Deploy Your Replit Application First
- Click "Deploy" in your Replit interface
- Wait for deployment to complete
- Note your `.replit.app` URL (e.g., `workdoc360-abc123.replit.app`)

### 2. Get Your Replit Deployment IP/CNAME
After deployment, Replit will provide you with:
- **CNAME Record**: `your-app.replit.app` (recommended)
- **A Record IP**: Static IP address (if CNAME not supported)

### 3. Configure DNS in Cloudflare Dashboard

**IMPORTANT: Use Cloudflare Dashboard, not GoDaddy**

1. **Log into Cloudflare Dashboard**
2. **Select workdoc360.com domain**
3. **Go to DNS → Records**
4. **Add these records after deploying:**

#### For Replit Deployments (2025 Method):
```
Type: A
Name: @ (root domain)
Value: [IP from Replit deployment]
TTL: Auto

Type: A
Name: www
Value: [Same IP from Replit deployment]
TTL: Auto

Type: TXT
Name: @ (root domain)
Value: [TXT verification from Replit]
TTL: Auto
```

#### Cloudflare Settings:
- **SSL/TLS Mode**: Full (Strict) - for HTTPS
- **Always Use HTTPS**: ON
- **Proxy Status**: Orange Cloud (Proxied) for CDN benefits

### 4. Configure Custom Domain in Replit
1. In your Replit deployment settings
2. Go to "Domains" section
3. Add your custom domain (e.g., `workdoc360.co.uk`)
4. Add both `www.workdoc360.co.uk` and `workdoc360.co.uk`

### 5. SSL Certificate
- Replit automatically provisions SSL certificates
- May take 5-15 minutes after DNS propagation
- Your site will be accessible via HTTPS

## Common Issues & Solutions

### DNS Propagation Delays
- Changes can take 24-48 hours to fully propagate
- Use `dig` or online DNS checkers to verify changes
- Clear your browser cache

### GoDaddy Specific Settings
- Disable GoDaddy's "Domain Forwarding" if enabled
- Turn off "Parking Page" services
- Ensure no conflicting A/CNAME records exist

### Verification Commands
Check DNS propagation:
```bash
# Check CNAME
dig CNAME workdoc360.co.uk

# Check A record  
dig A workdoc360.co.uk

# Online tools
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

## Environment Variables for Production
After domain is connected, ensure these are set:
- `ANTHROPIC_API_KEY` - For AI document assessment
- `SENDGRID_API_KEY` - For email notifications  
- `STRIPE_SECRET_KEY` - For payments
- `DATABASE_URL` - Auto-configured by Replit

## Testing Checklist
- [ ] Domain resolves to Replit IP
- [ ] Both www and non-www versions work
- [ ] SSL certificate is active (HTTPS)
- [ ] Application loads correctly
- [ ] Database connections work
- [ ] API endpoints respond properly

## Need Help?
If you're still having issues, check:
1. DNS record syntax is correct
2. No typos in domain names
3. GoDaddy account has proper permissions
4. Domain isn't locked or expired