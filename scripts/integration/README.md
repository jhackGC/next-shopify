# Integration Tests

This folder contains integration tests for the Shopify Next.js application. These tests validate real external API connectivity and service configuration.

## Files

- `test-environment.js` - Environment variables validation
- `test-storefront.js` - Shopify Storefront API integration tests
- `test-customer-api.js` - Customer Account API configuration tests
- `test-shopify-connectivity.js` - Complete integration test suite
- `quick-test.js` - Fast store connectivity test

## Usage

Run individual tests:

```bash
npm run test:env        # Environment validation
npm run test:storefront # Storefront API
npm run test:customer   # Customer Account API
npm run test:quick      # Quick connectivity test
```

Run complete suite:

```bash
npm run test:shopify    # All integration tests
```

## Purpose

These integration tests:

- ✅ Test real API connectivity to Shopify services
- ✅ Validate environment configuration
- ✅ Check external service accessibility
- ✅ Provide setup guidance and troubleshooting

They are **not unit tests** - they test actual integration with external services and are designed for setup validation and troubleshooting configuration issues.
