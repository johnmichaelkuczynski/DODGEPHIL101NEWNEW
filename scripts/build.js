#!/usr/bin/env node

/**
 * Enhanced build script for proper ES module deployment
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

console.log('🏗️  Starting enhanced build process...');

// Step 1: Build frontend with Vite
console.log('1️⃣  Building frontend with Vite...');
const viteBuild = spawn('vite', ['build'], { stdio: 'inherit' });

viteBuild.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed');
  console.log('2️⃣  Building backend with esbuild...');
  
  // Step 2: Build backend with enhanced esbuild configuration
  const esbuildArgs = [
    'server/index.ts',
    '--platform=node',
    '--target=node18',
    '--format=esm',
    '--bundle',
    '--external:@neondatabase/serverless',
    '--external:drizzle-orm',
    '--external:bcrypt',
    '--external:express',  
    '--external:express-session',
    '--external:cookie-parser',
    '--external:multer',
    '--external:openai',
    '--external:@anthropic-ai/sdk',
    '--external:@paypal/paypal-server-sdk',
    '--external:microsoft-cognitiveservices-speech-sdk',
    '--outdir=dist',
    '--log-level=warning'
  ];
  
  const esbuild = spawn('esbuild', esbuildArgs, { stdio: 'inherit' });
  
  esbuild.on('close', async (code) => {
    if (code !== 0) {
      console.error('❌ Backend build failed');
      process.exit(1);
    }
    
    console.log('✅ Backend build completed');
    console.log('3️⃣  Post-processing build...');
    
    // Step 3: Create package.json for production dependencies
    const productionPackageJson = {
      type: "module",
      dependencies: {
        "@neondatabase/serverless": "*",
        "drizzle-orm": "*", 
        "bcrypt": "*",
        "express": "*",
        "express-session": "*",
        "cookie-parser": "*",
        "multer": "*",
        "openai": "*",
        "@anthropic-ai/sdk": "*",
        "@paypal/paypal-server-sdk": "*",
        "microsoft-cognitiveservices-speech-sdk": "*"
      }
    };
    
    try {
      await fs.writeFile(
        path.join('dist', 'package.json'), 
        JSON.stringify(productionPackageJson, null, 2)
      );
      console.log('✅ Production package.json created');
    } catch (err) {
      console.warn('⚠️  Could not create production package.json:', err.message);
    }
    
    console.log('🎉 Build process completed successfully!');
    console.log('📦 Ready for deployment');
  });
  
  esbuild.on('error', (error) => {
    console.error('❌ Backend build error:', error);
    process.exit(1);
  });
});

viteBuild.on('error', (error) => {
  console.error('❌ Frontend build error:', error);
  process.exit(1);
});