#!/usr/bin/env node

/**
 * Button Functionality Test Script
 * Tests all major button interactions across the WorkDoc360 application
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 WorkDoc360 Button Functionality Analysis');
console.log('=========================================\n');

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function addIssue(type, component, issue, severity = 'warning') {
  results.issues.push({ type, component, issue, severity });
  if (severity === 'error') results.failed++;
  else if (severity === 'warning') results.warnings++;
  else results.passed++;
}

function analyzeComponent(filePath, componentName) {
  if (!fs.existsSync(filePath)) {
    addIssue('missing', componentName, 'File not found', 'error');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for onClick handlers
  const onClickMatches = content.match(/onClick\s*=\s*{([^}]*)}/g) || [];
  const buttonMatches = content.match(/<Button[^>]*>/g) || [];
  
  console.log(`\n📄 ${componentName}`);
  console.log(`   Buttons found: ${buttonMatches.length}`);
  console.log(`   Click handlers: ${onClickMatches.length}`);
  
  // Check for common issues
  buttonMatches.forEach((button, index) => {
    if (!button.includes('onClick') && !button.includes('type="submit"') && !button.includes('form=')) {
      addIssue('functionality', componentName, `Button ${index + 1} missing click handler`, 'warning');
    }
    
    if (button.includes('disabled') && !button.includes('disabled={')) {
      addIssue('ux', componentName, `Button ${index + 1} permanently disabled`, 'warning');
    }
  });

  // Check for form submissions
  const formSubmits = content.match(/onSubmit\s*=\s*{([^}]*)}/g) || [];
  if (formSubmits.length > 0) {
    console.log(`   Form submissions: ${formSubmits.length}`);
    addIssue('form', componentName, `Has ${formSubmits.length} form submission handlers`, 'pass');
  }

  // Check for navigation actions
  const navigationActions = content.match(/setLocation|useLocation|navigate/g) || [];
  if (navigationActions.length > 0) {
    console.log(`   Navigation actions: ${navigationActions.length}`);
    addIssue('navigation', componentName, `Has ${navigationActions.length} navigation actions`, 'pass');
  }

  // Check for mutation calls
  const mutations = content.match(/\.mutate\(\)/g) || [];
  if (mutations.length > 0) {
    console.log(`   API mutations: ${mutations.length}`);
    addIssue('api', componentName, `Has ${mutations.length} API mutation calls`, 'pass');
  }
}

// Test key components
const components = [
  ['client/src/pages/auth.tsx', 'Authentication Page'],
  ['client/src/pages/home.tsx', 'Home Page'],
  ['client/src/pages/dashboard.tsx', 'Dashboard'],
  ['client/src/pages/onboarding.tsx', 'Onboarding'],
  ['client/src/components/SmartDashboard.tsx', 'Smart Dashboard'],
  ['client/src/components/DocumentGenerator.tsx', 'Document Generator'],
  ['client/src/components/DocumentLibrary.tsx', 'Document Library'],
  ['client/src/components/UserRoleManagement.tsx', 'User Management'],
  ['client/src/components/BillingManagement.tsx', 'Billing Management'],
  ['client/src/components/PaymentButton.tsx', 'Payment Button'],
];

components.forEach(([file, name]) => {
  analyzeComponent(file, name);
});

// Generate summary report
console.log('\n\n📊 BUTTON FUNCTIONALITY SUMMARY');
console.log('================================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`❌ Errors: ${results.failed}`);

console.log('\n🔍 DETAILED ISSUES:');
if (results.issues.length === 0) {
  console.log('   No issues found! 🎉');
} else {
  results.issues.forEach((issue, index) => {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : '✅';
    console.log(`   ${icon} [${issue.component}] ${issue.issue}`);
  });
}

// Specific functionality tests
console.log('\n\n🧪 SPECIFIC FUNCTIONALITY TESTS');
console.log('================================');

// Test auth form submissions
if (fs.existsSync('client/src/pages/auth.tsx')) {
  const authContent = fs.readFileSync('client/src/pages/auth.tsx', 'utf8');
  
  console.log('\n🔐 Authentication Tests:');
  
  if (authContent.includes('onSubmit={loginForm.handleSubmit(onLogin)}')) {
    console.log('   ✅ Login form submission handler present');
  } else {
    console.log('   ❌ Login form submission handler missing');
  }
  
  if (authContent.includes('onSubmit={registerForm.handleSubmit(onRegister)}')) {
    console.log('   ✅ Register form submission handler present');
  } else {
    console.log('   ❌ Register form submission handler missing');
  }
  
  if (authContent.includes('loginMutation.mutate')) {
    console.log('   ✅ Login mutation call present');
  } else {
    console.log('   ❌ Login mutation call missing');
  }
  
  if (authContent.includes('registerMutation.mutate')) {
    console.log('   ✅ Register mutation call present');
  } else {
    console.log('   ❌ Register mutation call missing');
  }
}

// Test dashboard navigation
if (fs.existsSync('client/src/components/SmartDashboard.tsx')) {
  const dashboardContent = fs.readFileSync('client/src/components/SmartDashboard.tsx', 'utf8');
  
  console.log('\n🏠 Dashboard Tests:');
  
  if (dashboardContent.includes('onTabChange')) {
    console.log('   ✅ Tab change handler present');
  } else {
    console.log('   ❌ Tab change handler missing');
  }
  
  if (dashboardContent.includes('onClick={action.action}')) {
    console.log('   ✅ Quick action click handlers present');
  } else {
    console.log('   ❌ Quick action click handlers missing');
  }
}

// Test logout functionality
if (fs.existsSync('client/src/pages/home.tsx')) {
  const homeContent = fs.readFileSync('client/src/pages/home.tsx', 'utf8');
  
  console.log('\n🚪 Logout Tests:');
  
  if (homeContent.includes('/api/logout')) {
    console.log('   ✅ Logout API call present');
  } else {
    console.log('   ❌ Logout API call missing');
  }
  
  if (homeContent.includes('setLocation("/")')) {
    console.log('   ✅ Logout redirect present');
  } else {
    console.log('   ❌ Logout redirect missing');
  }
}

console.log('\n\n🎯 RECOMMENDATIONS');
console.log('==================');

if (results.failed > 0) {
  console.log('❌ Critical issues found that need immediate attention');
}

if (results.warnings > 0) {
  console.log('⚠️  Some buttons may need improved user experience');
}

if (results.passed > 0) {
  console.log('✅ Most button functionality appears to be working correctly');
}

console.log('\n   Next steps:');
console.log('   1. Review components with missing click handlers');
console.log('   2. Test form submissions manually');
console.log('   3. Verify navigation flows in browser');
console.log('   4. Check API mutation responses');

console.log('\n✨ Analysis complete!');