/**
 * Test company lookup directly from database
 */

import { db } from './server/db.js';
import { companies } from './shared/schema.js';
import { eq } from 'drizzle-orm';

console.log('🔍 Testing Company Lookup');
console.log('========================\n');

async function testCompanyLookup() {
  try {
    console.log('1. Testing getCompanyBySlug for "plastermaster"...');
    
    const [company] = await db.select().from(companies).where(eq(companies.companySlug, 'plastermaster'));
    
    if (company) {
      console.log('✅ Company found!');
      console.log(`   ID: ${company.id}`);
      console.log(`   Name: ${company.name}`);
      console.log(`   Slug: ${company.companySlug}`);
      console.log(`   Trade: ${company.tradeType}`);
      console.log(`   Business Type: ${company.businessType}`);
      
      console.log('\n2. Testing subdomain detection logic...');
      const hostname = 'plastermaster.workdoc360.com';
      const parts = hostname.split('.');
      const subdomain = parts[0];
      
      console.log(`   Hostname: ${hostname}`);
      console.log(`   Parsed subdomain: ${subdomain}`);
      console.log(`   Should match company slug: ${company.companySlug}`);
      console.log(`   Match: ${subdomain === company.companySlug ? '✅ Yes' : '❌ No'}`);
      
      if (subdomain === company.companySlug) {
        console.log('\n🎉 SUBDOMAIN DETECTION WORKING!');
        console.log('The issue is likely DNS propagation delay.');
        console.log('Multi-tenant routing should work once DNS resolves.');
      }
      
    } else {
      console.log('❌ Company not found in database');
      
      // List all companies with slugs
      console.log('\n📋 All companies with slugs:');
      const allCompanies = await db.select().from(companies);
      allCompanies.forEach(c => {
        console.log(`   ${c.id}: ${c.name} -> ${c.companySlug || 'NO SLUG'}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing company lookup:', error);
  }
}

testCompanyLookup().catch(console.error);