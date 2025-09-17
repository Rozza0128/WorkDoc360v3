// Setup script for Rob & Son Scaffolding premium test account
// Run with: node scripts/setup-rob-account.js

import { createRobAndSonAccount, createSampleDocuments } from '../server/createPremiumAccount.js';

async function setupAccount() {
  try {
    console.log('🚀 Setting up Rob & Son Scaffolding premium test account...\n');
    
    const result = await createRobAndSonAccount();
    
    // Create sample documents for testing
    await createSampleDocuments(result.company.id, result.user.id);
    
    console.log('\n📋 ACCOUNT READY FOR DOCUMENT UPLOAD TESTING:');
    console.log('===============================================');
    console.log(`Login URL: http://localhost:5000${result.loginUrl}`);
    console.log(`Email: ${result.credentials.email}`);
    console.log(`Password: ${result.credentials.password}`);
    console.log(`Company ID: ${result.company.id}`);
    console.log('Plan: Professional (£129/month) with ISO 9001 access');
    console.log('Status: Active subscription (no payment required)');
    console.log('\n✅ Ready to upload your Rob & Son documents for AI assessment!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupAccount();