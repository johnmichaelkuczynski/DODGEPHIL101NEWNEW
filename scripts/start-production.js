#!/usr/bin/env node

/**
 * Production startup script optimized for Cloud Run deployment
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

console.log('🚀 Starting production server...');

// Verify production build exists
const buildExists = async () => {
  try {
    await fs.access('dist/index.js');
    await fs.access('dist/public');
    return true;
  } catch {
    return false;
  }
};

// Environment validation for Cloud Run
const validateEnvironment = () => {
  const required = [];
  const optional = ['AZURE_SPEECH_REGION', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
  
  console.log('📋 Environment validation:');
  
  // Check required environment variables
  let missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  // Report optional environment variables
  let missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.log('⚠️  Optional environment variables not set:', missingOptional);
  }
  
  // Cloud Run specific environment
  const port = process.env.PORT || '8080';
  console.log(`✅ Server will bind to port: ${port}`);
  
  if (process.env.DATABASE_URL) {
    console.log('✅ Database URL configured');
  } else {
    console.log('⚠️  No database URL - using memory storage');
  }
  
  return true;
};

const main = async () => {
  try {
    // Validate environment first
    validateEnvironment();
    
    // Check if build exists
    if (!(await buildExists())) {
      console.error('❌ Production build not found. Run "npm run build" first.');
      process.exit(1);
    }
    
    console.log('✅ Production build verified');
    
    // Set production environment
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '8080'
    };
    
    console.log('🎯 Starting Node.js server...');
    
    // Start the production server
    const server = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      env: env
    });
    
    // Handle server events
    server.on('error', (error) => {
      console.error('❌ Server startup error:', error);
      process.exit(1);
    });
    
    server.on('close', (code) => {
      console.log(`🛑 Server process exited with code: ${code}`);
      process.exit(code || 0);
    });
    
    // Handle shutdown signals for Cloud Run
    const shutdown = () => {
      console.log('🛑 Received shutdown signal, terminating server...');
      server.kill('SIGTERM');
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Production startup failed:', error);
    process.exit(1);
  }
};

main();