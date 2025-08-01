#!/usr/bin/env node

/**
 * Storefront API Test
 * 
 * This script tests Shopify Storefront API connectivity:
 * - Shop information and basic connectivity
 * - Products API functionality
 * - Collections API functionality
 * - Data structure validation
 * 
 * Usage: node scripts/test-storefront.js
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

// Test basic Storefront API connectivity
async function testStorefrontConnection() {
  log.header('Storefront API Connection Test');

  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN) {
    log.error('Missing required Storefront API environment variables');
    log.info('Required: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN');
    return false;
  }

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  };

  try {
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
          paymentSettings {
            acceptedCardBrands
            countryCode
          }
        }
      }
    `;

    const result = await graphqlRequest(apiUrl, shopQuery, {}, headers);
    
    log.success(`Successfully connected to shop: ${result.shop.name}`);
    log.info(`🌐 Shop URL: ${result.shop.primaryDomain.url}`);
    log.info(`💰 Currency: ${result.shop.currencyCode}`);
    log.info(`🌍 Country: ${result.shop.paymentSettings.countryCode}`);
    
    if (result.shop.description) {
      log.info(`📝 Description: ${result.shop.description.substring(0, 100)}${result.shop.description.length > 100 ? '...' : ''}`);
    }

    return true;
  } catch (error) {
    log.error(`Storefront API connection failed: ${error.message}`);
    
    if (error.message.includes('401')) {
      log.error('🔐 Authentication failed - check your SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN');
      log.info('💡 Make sure you\'re using the PRIVATE access token, not the public one');
    } else if (error.message.includes('ENOTFOUND')) {
      log.error('🌐 Domain not found - check your SHOPIFY_STORE_DOMAIN');
      log.info('💡 Should be: your-store.myshopify.com (without https://)');
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
    log.info(`Fetching up to ${TEST_CONFIG.maxProducts} products...`);
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
              productType
              availableForSale
              createdAt
              updatedAt
              featuredImage {
                url
                altText
                width
                height
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              tags
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(apiUrl, productsQuery, { first: TEST_CONFIG.maxProducts }, headers);
    const products = result.products.edges;

    if (products.length === 0) {
      log.warn('No products found in your store');
      log.info('💡 This is not an error - your store might be empty or all products are hidden');
      return true;
    }

    log.success(`Found ${products.length} products`);
    
    // Display detailed product information
    products.forEach((edge, index) => {
      const product = edge.node;
      console.log(`\n📦 Product ${index + 1}: ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Vendor: ${product.vendor || 'N/A'}`);
      console.log(`   Type: ${product.productType || 'N/A'}`);
      console.log(`   Available: ${product.availableForSale ? '✅ Yes' : '❌ No'}`);
      console.log(`   Price Range: ${product.priceRange.minVariantPrice.amount} - ${product.priceRange.maxVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`);
      console.log(`   Variants: ${product.variants.edges.length}`);
      console.log(`   Tags: ${product.tags.length > 0 ? product.tags.slice(0, 3).join(', ') : 'None'}`);
      
      if (product.featuredImage) {
        console.log(`   Featured Image: ${product.featuredImage.width}x${product.featuredImage.height}px`);
      }
      
      // Show variant details
      if (product.variants.edges.length > 0) {
        console.log(`   📋 Variants:`);
        product.variants.edges.forEach((variantEdge, vIndex) => {
          const variant = variantEdge.node;
          const options = variant.selectedOptions.map(opt => `${opt.name}: ${opt.value}`).join(', ');
          console.log(`     ${vIndex + 1}. ${variant.title} - ${variant.price.amount} ${variant.price.currencyCode} (${options})`);
          console.log(`        Stock: ${variant.quantityAvailable || 'Unknown'}, Available: ${variant.availableForSale ? 'Yes' : 'No'}`);
        });
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
    log.info(`Fetching up to ${TEST_CONFIG.maxCollections} collections...`);
    const collectionsQuery = `
      query GetCollections($first: Int!) {
        collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              description
              updatedAt
              image {
                url
                altText
                width
                height
              }
              products(first: 5) {
                edges {
                  node {
                    id
                    title
                    handle
                    availableForSale
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
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
      log.info('💡 This is not an error - your store might not have any collections set up');
      return true;
    }

    log.success(`Found ${collections.length} collections`);
    
    // Display detailed collection information
    collections.forEach((edge, index) => {
      const collection = edge.node;
      console.log(`\n📚 Collection ${index + 1}: ${collection.title}`);
      console.log(`   Handle: ${collection.handle}`);
      console.log(`   Updated: ${new Date(collection.updatedAt).toLocaleDateString()}`);
      
      if (collection.description) {
        console.log(`   Description: ${collection.description.substring(0, 100)}${collection.description.length > 100 ? '...' : ''}`);
      }
      
      if (collection.image) {
        console.log(`   Image: ${collection.image.width}x${collection.image.height}px`);
      }
      
      console.log(`   Products: ${collection.products.edges.length} (showing first 5)`);
      
      if (collection.products.edges.length > 0) {
        console.log(`   📦 Products in this collection:`);
        collection.products.edges.forEach((productEdge, pIndex) => {
          const product = productEdge.node;
          console.log(`     ${pIndex + 1}. ${product.title} (${product.handle})`);
          console.log(`        Price: ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`);
          console.log(`        Available: ${product.availableForSale ? '✅' : '❌'}`);
        });
      }
    });

    return true;
  } catch (error) {
    log.error(`Collections API test failed: ${error.message}`);
    return false;
  }
}

// Test API performance and limitations
async function testAPIPerformance() {
  log.header('API Performance Test');

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  };

  try {
    log.info('Testing API response time...');
    
    const startTime = Date.now();
    const quickQuery = `
      query QuickTest {
        shop {
          name
        }
        products(first: 1) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `;

    await graphqlRequest(apiUrl, quickQuery, {}, headers);
    const responseTime = Date.now() - startTime;
    
    log.success(`API response time: ${responseTime}ms`);
    
    if (responseTime < 500) {
      log.success('🚀 Excellent response time');
    } else if (responseTime < 1000) {
      log.info('⚡ Good response time');
    } else {
      log.warn('🐌 Slow response time - check your connection');
    }

    return true;
  } catch (error) {
    log.error(`Performance test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runStorefrontTests() {
  console.log('\n🏪 Shopify Storefront API Test Suite\n');

  const tests = [
    { name: 'Storefront Connection', fn: testStorefrontConnection },
    { name: 'Products API', fn: testProductsAPI },
    { name: 'Collections API', fn: testCollectionsAPI },
    { name: 'API Performance', fn: testAPIPerformance },
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

  console.log(`\nStorefront API Tests: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('\n🎉 All Storefront API tests passed! Your store integration is working perfectly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some Storefront API tests failed.');
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Verify SHOPIFY_STORE_DOMAIN is correct (without https://)');
    console.log('2. Check SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN is the private token');
    console.log('3. Ensure your Shopify store is active and accessible');
    console.log('4. Try running test-environment.js first to validate configuration');
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the tests
runStorefrontTests();
