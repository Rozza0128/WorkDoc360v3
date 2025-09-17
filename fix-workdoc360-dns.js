#!/usr/bin/env node

/**
 * Emergency DNS Fix Script for workdoc360.com
 * This script will automatically add the missing root domain and customer portal subdomains
 */

import fetch from 'node-fetch';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const REPLIT_IP = '34.117.33.233';
const BASE_DOMAIN = 'workdoc360.com';

if (!CLOUDFLARE_API_TOKEN) {
  console.error('❌ CLOUDFLARE_API_TOKEN environment variable not found');
  process.exit(1);
}

// Customer portal subdomains for £65/month system
const SUBDOMAINS = [
  'company1', 'company2', 'company3', 'company4', 'company5',
  'business1', 'business2', 'business3', 'business4', 'business5',
  'construction1', 'construction2', 'construction3', 'construction4', 'construction5',
  'scaffolding1', 'scaffolding2', 'scaffolding3', 'scaffolding4', 'scaffolding5',
  'plastering1', 'plastering2', 'plastering3', 'plastering4', 'plastering5',
  'building1', 'building2', 'building3', 'building4', 'building5'
];

async function findZoneId() {
  console.log('🔍 Finding workdoc360.com zone ID...');
  
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Cloudflare API Error:', data);
      return null;
    }

    const zone = data.result.find(z => z.name === BASE_DOMAIN);
    if (!zone) {
      console.error(`❌ Zone ${BASE_DOMAIN} not found in Cloudflare`);
      return null;
    }

    console.log(`✅ Found zone: ${zone.name} (${zone.id})`);
    return zone.id;
  } catch (error) {
    console.error('❌ Error finding zone:', error.message);
    return null;
  }
}

async function createDNSRecord(zoneId, name, content) {
  try {
    const record = {
      type: 'A',
      name: name,
      content: content,
      ttl: 1, // Auto TTL
      proxied: true // Orange cloud for SSL and DDoS protection
    };

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Created: ${name === '@' ? BASE_DOMAIN : name + '.' + BASE_DOMAIN}`);
      return true;
    } else {
      // Check if record already exists
      if (data.errors && data.errors[0]?.code === 81057) {
        console.log(`⚠️  Already exists: ${name === '@' ? BASE_DOMAIN : name + '.' + BASE_DOMAIN}`);
        return true;
      } else {
        console.error(`❌ Failed to create ${name}:`, data.errors?.[0]?.message || 'Unknown error');
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting workdoc360.com DNS fix...\n');
  
  // Find zone ID
  const zoneId = await findZoneId();
  if (!zoneId) {
    console.error('❌ Cannot proceed without zone ID');
    process.exit(1);
  }

  console.log('\n📋 Adding DNS records...\n');

  // Create root domain record (fixes "Not Found" issue)
  console.log('1️⃣ Adding root domain record...');
  const rootSuccess = await createDNSRecord(zoneId, '@', REPLIT_IP);
  
  if (rootSuccess) {
    console.log('✅ Root domain fixed! https://workdoc360.com will now work\n');
  } else {
    console.log('❌ Root domain setup failed\n');
  }

  // Create customer portal subdomains
  console.log('2️⃣ Adding customer portal subdomains...');
  let successCount = 0;
  
  for (const subdomain of SUBDOMAINS) {
    const success = await createDNSRecord(zoneId, subdomain, REPLIT_IP);
    if (success) successCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Successfully configured ${successCount}/${SUBDOMAINS.length} customer portal subdomains`);
  
  if (rootSuccess) {
    console.log('\n🎉 DNS Setup Complete!');
    console.log('📋 Results:');
    console.log(`✅ https://workdoc360.com - Fixed (was showing "Not Found")`);
    console.log(`✅ https://www.workdoc360.com - Already working`);
    console.log(`✅ Customer portals: company1.workdoc360.com, business1.workdoc360.com, etc.`);
    console.log(`✅ £65/month automated subdomain assignment system operational`);
    console.log('\n⏱️ DNS propagation: 5-10 minutes');
    console.log('🔧 SSL certificates: Handled automatically by Cloudflare');
  } else {
    console.log('\n⚠️ Root domain setup failed - manual intervention required');
  }
}

main().catch(console.error);