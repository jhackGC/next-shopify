#!/usr/bin/env node

/**
 * Shopify Connectivity Test Script
 * 
 * This script tests all Shopify API connections:
 * - Storefront API (products, collections)
 * - Customer Account API configuration
 * - Environment variable validation
 * 
 * Usage: node scripts/test-shopify-connectivity.js
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  maxProducts: 5,
  maxCollections: 3,
  timeout: 10000, // 10 seconds
};

// Utility functions for console output
const log = {
  info: (msg) => console.log('ℹ️', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  warn: (msg) => console.log('⚠️', msg),
  header: (msg) => console.log(`\n=== ${msg} ===`),
};

// GraphQL request helper
async function graphqlRequest(url, query, variables = {}, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

// Environment variable validation
function validateEnvironmentVariables() {
  log.header('Environment Variables Validation');
  
  const requiredVars = {
    'SHOPIFY_STORE_DOMAIN': process.env.SHOPIFY_STORE_DOMAIN,
    'SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID': process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET': process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET,
    'SHOPIFY_CUSTOMER_ACCOUNT_API_URL': process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
  };

  let allValid = true;

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (!value || value.includes('your_') || value.includes('your-')) {
      log.error(`${varName} is missing or contains placeholder value`);
      allValid = false;
    } else {
      log.success(`${varName} is configured`);
    }
  }

  // Validate domain format
  if (process.env.SHOPIFY_STORE_DOMAIN?.includes('https://')) {
    log.error('SHOPIFY_STORE_DOMAIN should not include https:// prefix');
    allValid = false;
  }

  // Validate domain ends with .myshopify.com
  if (process.env.SHOPIFY_STORE_DOMAIN && !process.env.SHOPIFY_STORE_DOMAIN.endsWith('.myshopify.com')) {
    log.warn('SHOPIFY_STORE_DOMAIN should end with .myshopify.com');
  }

  return allValid;
}

// Test Storefront API connectivity
async function testStorefrontAPI() {
  log.header('Storefront API Connectivity Test');

  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN) {
    log.error('Missing required Storefront API environment variables');
    return false;
  }

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  };

  try {
    // Test shop info query
    log.info('Testing shop information query...');
    const shopQuery = `
      query GetShop {
        shop {
          name
          description
          primaryDomain {
            url
          }
          currencyCode
        }
      }
    `;

    const result = await graphqlRequest(apiUrl, shopQuery, {}, headers);
    log.success(`Connected to shop: ${result.shop.name}`);
    log.info(`Shop domain: ${result.shop.primaryDomain.url}`);
    log.info(`Currency: ${result.shop.currencyCode}`);

    return true;
  } catch (error) {
    log.error(`Storefront API connection failed: ${error.message}`);
    if (error.message.includes('401')) {
      log.error('Authentication failed - check your SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN');
    }
    return false;
  }
}

// Test Products API
async function testProductsAPI() {
  log.header('Products API Test');

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  };

  try {
    log.info(`Fetching ${TEST_CONFIG.maxProducts} products...`);
    const productsQuery = `
      query GetProducts($first: Int!) {
        products(first: $first, sortKey: BEST_SELLING) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              availableForSale
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(apiUrl, productsQuery, { first: TEST_CONFIG.maxProducts }, headers);
    const products = result.products.edges;

    if (products.length === 0) {
      log.warn('No products found in your store');
      return true; // Not an error, just empty store
    }

    log.success(`Found ${products.length} products`);
    products.forEach((edge, index) => {
      const product = edge.node;
      log.info(`${index + 1}. ${product.title} (${product.handle})`);
      log.info(`   Price: ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`);
      log.info(`   Available: ${product.availableForSale ? 'Yes' : 'No'}`);
      if (product.variants.edges.length > 0) {
        const variant = product.variants.edges[0].node;
        log.info(`   Stock: ${variant.quantityAvailable || 'Unknown'}`);
      }
    });

    return true;
  } catch (error) {
    log.error(`Products API test failed: ${error.message}`);
    return false;
  }
}

// Test Collections API
async function testCollectionsAPI() {
  log.header('Collections API Test');

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  };

  try {
    log.info(`Fetching ${TEST_CONFIG.maxCollections} collections...`);
    const collectionsQuery = `
      query GetCollections($first: Int!) {
        collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
                altText
              }
              products(first: 3) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(apiUrl, collectionsQuery, { first: TEST_CONFIG.maxCollections }, headers);
    const collections = result.collections.edges;

    if (collections.length === 0) {
      log.warn('No collections found in your store');
      return true; // Not an error, just empty store
    }

    log.success(`Found ${collections.length} collections`);
    collections.forEach((edge, index) => {
      const collection = edge.node;
      log.info(`${index + 1}. ${collection.title} (${collection.handle})`);
      if (collection.description) {
        log.info(`   Description: ${collection.description.substring(0, 100)}${collection.description.length > 100 ? '...' : ''}`);
      }
      log.info(`   Products: ${collection.products.edges.length} (showing first 3)`);
      collection.products.edges.forEach((productEdge) => {
        log.info(`     - ${productEdge.node.title}`);
      });
    });

    return true;
  } catch (error) {
    log.error(`Collections API test failed: ${error.message}`);
    return false;
  }
}

// Test Customer Account API configuration
async function testCustomerAccountAPIConfig() {
  log.header('Customer Account API Configuration Test');

  const requiredVars = [
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID',
    'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET',
    'SHOPIFY_CUSTOMER_ACCOUNT_API_URL',
  ];

  let configValid = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('your-')) {
      log.error(`${varName} is not properly configured`);
      configValid = false;
    } else {
      log.success(`${varName} is configured`);
    }
  }

  // Validate URL format
  const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  if (apiUrl && !apiUrl.startsWith('https://shopify.com/')) {
    log.error('SHOPIFY_CUSTOMER_ACCOUNT_API_URL should start with https://shopify.com/');
    configValid = false;
  } else if (apiUrl) {
    log.success('Customer Account API URL format is correct');
  }

  // Test OAuth URLs construction
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  if (clientId && !clientId.includes('your_')) {
    const authUrls = {
      authorize: `https://shopify.com/${clientId}/auth/oauth/authorize`,
      token: `https://shopify.com/${clientId}/auth/oauth/token`,
      logout: `https://shopify.com/${clientId}/auth/logout`,
    };

    log.info('Generated OAuth URLs:');
    log.info(`  Authorize: ${authUrls.authorize}`);
    log.info(`  Token: ${authUrls.token}`);
    log.info(`  Logout: ${authUrls.logout}`);
  }

  return configValid;
}

// Test API routes (if server is running)
async function testAPIRoutes() {
  log.header('API Routes Test');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const routes = [
    '/api/storefront/collections',
    '/api/storefront/products',
  ];

  let allRoutesWorking = true;

  for (const route of routes) {
    try {
      log.info(`Testing ${route}...`);
      const response = await fetch(`${baseUrl}${route}`, {
        timeout: TEST_CONFIG.timeout,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          log.success(`${route} is working`);
        } else {
          log.error(`${route} returned error: ${data.error}`);
          allRoutesWorking = false;
        }
      } else {
        log.error(`${route} returned status: ${response.status}`);
        allRoutesWorking = false;
      }
    } catch (error) {
      log.warn(`${route} is not accessible (server may not be running): ${error.message}`);
      // Don't mark as failure since server might not be running
    }
  }

  return allRoutesWorking;
}

// Main test runner
async function runTests() {
  console.log('\n🏪 Shopify Connectivity Test Suite\n');

  const tests = [
    { name: 'Environment Variables', fn: validateEnvironmentVariables },
    { name: 'Storefront API', fn: testStorefrontAPI },
    { name: 'Products API', fn: testProductsAPI },
    { name: 'Collections API', fn: testCollectionsAPI },
    { name: 'Customer Account API Config', fn: testCustomerAccountAPIConfig },
    { name: 'API Routes', fn: testAPIRoutes },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log.error(`Test '${test.name}' threw an error: ${error.message}`);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }

  // Summary
  log.header('Test Results Summary');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    if (result.passed) {
      log.success(result.name);
    } else {
      log.error(`${result.name}${result.error ? ` (${result.error})` : ''}`);
    }
  });

  console.log(`\nTests: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Your Shopify integration is ready.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check your configuration.');
    
    // Helpful tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure all environment variables in .env.local are properly set');
    console.log('2. Verify your Shopify store domain (without https://)');
    console.log('3. Check that your Storefront API private access token is correct');
    console.log('4. Ensure Customer Account API credentials are from Partner Dashboard');
    console.log('5. For API routes test, make sure the Next.js dev server is running');
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});
