#!/usr/bin/env node

/**
 * Environment Variables Validation Test
 * 
 * This script validates all required environment variables for Shopify integration:
 * - Checks if all required variables are present
 * - Validates variable formats and values
 * - Provides specific guidance for each variable
 * 
 * Usage: node scripts/test-environment.js
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Utility functions for console output
const log = {
  info: (msg) => console.log('ℹ️', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  warn: (msg) => console.log('⚠️', msg),
  header: (msg) => console.log(`\n=== ${msg} ===`),
};

// Environment variable validation
function validateEnvironmentVariables() {
  log.header('Environment Variables Validation');
  
  const requiredVars = {
    'SHOPIFY_STORE_DOMAIN': {
      value: process.env.SHOPIFY_STORE_DOMAIN,
      description: 'Your Shopify store domain (without https://)',
      example: 'your-store.myshopify.com',
      where: 'Shopify Admin → Settings → Domains'
    },
    'SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN': {
      value: process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
      description: 'Private Storefront API access token',
      example: 'shppa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      where: 'Shopify Admin → Apps → Headless App → Storefront API access tokens'
    },
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID': {
      value: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      description: 'Customer Account API Client ID',
      example: 'shp_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      where: 'Partner Dashboard → Your App → Customer Account API'
    },
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET': {
      value: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET,
      description: 'Customer Account API Client Secret',
      example: 'shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      where: 'Partner Dashboard → Your App → Customer Account API'
    },
    'SHOPIFY_CUSTOMER_ACCOUNT_API_URL': {
      value: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
      description: 'Customer Account API URL',
      example: 'https://shopify.com/your-shop-id/account/customer/api/2024-10/graphql',
      where: 'Partner Dashboard → Your App → Customer Account API settings'
    },
    'NEXT_PUBLIC_APP_URL': {
      value: process.env.NEXT_PUBLIC_APP_URL,
      description: 'Your application URL',
      example: 'http://localhost:3000',
      where: 'Set to your app URL (localhost for development)'
    }
  };

  let allValid = true;
  let detailedResults = [];

  console.log('Checking required environment variables...\n');

  for (const [varName, config] of Object.entries(requiredVars)) {
    const result = { name: varName, ...config };
    
    if (!config.value) {
      log.error(`${varName} is missing`);
      result.status = 'missing';
      allValid = false;
    } else if (config.value.includes('your_') || config.value.includes('your-')) {
      log.error(`${varName} contains placeholder value`);
      result.status = 'placeholder';
      allValid = false;
    } else {
      log.success(`${varName} is configured`);
      result.status = 'configured';
    }
    
    detailedResults.push(result);
  }

  // Additional validations
  log.header('Format Validations');

  // Validate domain format
  if (process.env.SHOPIFY_STORE_DOMAIN) {
    if (process.env.SHOPIFY_STORE_DOMAIN.includes('https://')) {
      log.error('SHOPIFY_STORE_DOMAIN should not include https:// prefix');
      allValid = false;
    } else {
      log.success('SHOPIFY_STORE_DOMAIN format is correct (no https:// prefix)');
    }

    if (!process.env.SHOPIFY_STORE_DOMAIN.endsWith('.myshopify.com')) {
      log.warn('SHOPIFY_STORE_DOMAIN should typically end with .myshopify.com');
    } else {
      log.success('SHOPIFY_STORE_DOMAIN ends with .myshopify.com');
    }
  }

  // Validate Customer Account API URL format
  const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  if (apiUrl) {
    if (!apiUrl.startsWith('https://shopify.com/')) {
      log.error('SHOPIFY_CUSTOMER_ACCOUNT_API_URL should start with https://shopify.com/');
      allValid = false;
    } else {
      log.success('SHOPIFY_CUSTOMER_ACCOUNT_API_URL format is correct');
    }
  }

  // Validate Next.js public URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
      log.warn('NEXT_PUBLIC_APP_URL should start with http:// or https://');
    } else {
      log.success('NEXT_PUBLIC_APP_URL format is correct');
    }
  }

  // Summary and guidance
  if (!allValid) {
    log.header('Setup Guidance');
    
    const failedVars = detailedResults.filter(r => r.status !== 'configured');
    
    failedVars.forEach(variable => {
      console.log(`\n📋 ${variable.name}:`);
      console.log(`   Description: ${variable.description}`);
      console.log(`   Example: ${variable.example}`);
      console.log(`   Where to find: ${variable.where}`);
    });

    console.log('\n💡 Quick setup tips:');
    console.log('1. Copy .env.example to .env.local');
    console.log('2. Replace placeholder values with your actual Shopify credentials');
    console.log('3. Get Storefront API token from Shopify Admin → Apps → Headless App');
    console.log('4. Get Customer Account API credentials from Partner Dashboard');
    console.log('5. Run this test again to verify your setup');
  }

  return allValid;
}

// Main function
async function runEnvironmentTest() {
  console.log('\n🔧 Environment Variables Test\n');

  try {
    const isValid = validateEnvironmentVariables();

    log.header('Test Results');
    
    if (isValid) {
      log.success('All environment variables are properly configured!');
      console.log('\n🎉 Environment setup is complete. You can now run other tests.');
      process.exit(0);
    } else {
      log.error('Some environment variables need attention.');
      console.log('\n❌ Please fix the configuration issues above and run this test again.');
      process.exit(1);
    }
  } catch (error) {
    log.error(`Environment test failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the test
runEnvironmentTest();
