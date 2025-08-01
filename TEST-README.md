# Shopify Integration Tests

This directory contains **integration tests** that validate your Shopify setup by testing real API connectivity, environment configuration, and external service accessibility. These are not unit tests - they test the actual integration between your application and Shopify services.

## Available Integration Tests

### 🚀 Quick Test (Recommended for initial setup)

```bash
npm run test:quick
```

**Purpose**: Fast validation of basic store connectivity  
**Location**: `scripts/integration/quick-test.js`  
**Requirements**: Only `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN`

### 🔧 Environment Variables Test

```bash
npm run test:env
```

**Purpose**: Validates all environment variable configuration and formats  
**Location**: `scripts/integration/test-environment.js`  
**Tests**: Variable presence, format validation, placeholder detection

### 🏪 Storefront API Test

```bash
npm run test:storefront
```

**Purpose**: Tests Shopify Storefront API connectivity and data retrieval  
**Location**: `scripts/integration/test-storefront.js`  
**Tests**: Shop info, products API, collections API, performance

### 🔐 Customer Account API Test

```bash
npm run test:customer
```

**Purpose**: Validates Customer Account API configuration and OAuth setup  
**Location**: `scripts/integration/test-customer-api.js`  
**Tests**: OAuth URLs, API endpoint accessibility, Next.js routes

### 📦 Complete Integration Test Suite

```bash
npm run test:shopify
```

**Purpose**: Runs all integration tests in sequence  
**Location**: `scripts/integration/test-shopify-connectivity.js`  
**Tests**: All of the above plus API routes testing

## What Integration Tests Validate

### ✅ Environment Variables Validation

- Checks that all required environment variables are configured
- Validates domain format (should not include `https://`)
- Ensures no placeholder values are present
- **Purpose**: Prevents configuration errors before attempting API calls

### 🏪 Storefront API Integration

- **Shop Information**: Tests real connection to your Shopify store
- **Products API**: Fetches and displays actual products from your store
- **Collections API**: Retrieves actual collections and their products
- **Performance**: Measures API response times
- **Purpose**: Validates that your store credentials work and data is accessible

### 🔐 Customer Account API Integration

- Validates all Customer Account API environment variables
- Checks OAuth URL format compliance and generation
- Tests API endpoint accessibility
- Validates Next.js authentication routes
- **Purpose**: Ensures OAuth authentication flow is properly configured

### 🌐 Next.js API Routes Integration

- Tests your server-side API routes (`/api/storefront/*`, `/api/auth/*`)
- Requires your development server to be running
- **Purpose**: Validates that your application's API layer works correctly

## Integration vs Unit Testing

**These are Integration Tests** - they test:

- ✅ Real external API connectivity
- ✅ Environment configuration
- ✅ Service-to-service communication
- ✅ End-to-end data flow

**Unit Tests would test** (not included):

- Individual functions in isolation
- Component rendering with mocked data
- Business logic without external dependencies
- Pure functions and utilities

## Integration Test Results

The integration tests provide clear output showing:

- ✅ **Passing tests**: Real connectivity and configuration is working
- ❌ **Failing tests**: Issues with external services or configuration
- ⚠️ **Warnings**: Non-critical issues that should be reviewed
- ℹ️ **Information**: Additional details about your setup

## Expected Results with Placeholder Values

When using the default `.env.local` with placeholder values, integration tests should show:

- ✅ Environment Variables (format validation passes)
- ❌ Storefront API (401 Unauthorized - expected with placeholder token)
- ❌ Products API (401 Unauthorized - expected with placeholder token)
- ❌ Collections API (401 Unauthorized - expected with placeholder token)
- ✅ Customer Account API Config (URL format validation passes)
- ❌ API Routes (500 errors - expected with placeholder credentials)

**This is normal!** The tests validate that your configuration format is correct, even when using placeholder values.

## Setting Up Real Credentials

To get all tests passing, replace the placeholder values in `.env.local`:

### 1. Shopify Store Configuration

```bash
SHOPIFY_STORE_DOMAIN=your-actual-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN=your_actual_private_token
```

**Get these from**: Shopify Admin → Apps → Your Headless App → Storefront API access tokens

### 2. Customer Account API Credentials

```bash
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_actual_client_id
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=your_actual_client_secret
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your-shop-id/account/customer/api/2024-10/graphql
```

**Get these from**: Partner Dashboard → Your App → Customer Account API settings

## Troubleshooting

### 401 Unauthorized Errors

- Check your `SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN`
- Ensure you're using the **private** token, not the public one
- Verify your store domain is correct

### 500 Server Errors (API Routes)

- Make sure your Next.js development server is running
- Check that all environment variables are properly set
- Look at the server console for detailed error messages

### Configuration Issues

- Domain should not include `https://` prefix
- All values should be actual credentials, not placeholders
- Customer Account API URL should start with `https://shopify.com/`

## Security Note

These integration tests only read environment variables and make read-only API calls to external services. They never modify your store data, expose sensitive information, or perform write operations. They are safe to run in any environment.
