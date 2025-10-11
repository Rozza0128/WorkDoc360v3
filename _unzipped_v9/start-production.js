#!/usr/bin/env node

/**
 * Start the app in production mode with custom domain support
 */

process.env.NODE_ENV = 'production';

// Start the production server
const { spawn } = require('child_process');

console.log('🚀 Starting WorkDoc360 in production mode...');
console.log('   This will serve your custom domain properly');
console.log('');

const server = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '5000'
  }
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});