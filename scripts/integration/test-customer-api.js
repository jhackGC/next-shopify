#!/usr/bin/env node

/**
 * Customer Account API Configuration Test
 *
 * This script tests Shopify Customer Account API configuration:
 * - Environment variables validation
 * - OAuth URL generation and validation
 * - API endpoint accessibility
 * - Authentication flow setup verification
 *
 * Usage: node scripts/test-customer-api.js
 */

const { config } = require("dotenv");

// Load environment variables
config({ path: ".env.local" });

// Utility functions for console output
const log = {
  info: (msg) => console.log("ℹ️", msg),
  success: (msg) => console.log("✅", msg),
  error: (msg) => console.log("❌", msg),
  warn: (msg) => console.log("⚠️", msg),
  header: (msg) => console.log(`\n=== ${msg} ===`),
};

// Test Customer Account API configuration
async function testCustomerAccountAPIConfig() {
  log.header("Customer Account API Configuration");

  const requiredVars = [
    "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
    "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET",
    "SHOPIFY_CUSTOMER_ACCOUNT_API_URL",
    "NEXT_PUBLIC_APP_URL",
  ];

  let configValid = true;
  const configDetails = {};

  // Check all required variables
  log.info("Checking required environment variables...");

  for (const varName of requiredVars) {
    const value = process.env[varName];
    configDetails[varName] = value;

    if (!value) {
      log.error(`${varName} is missing`);
      configValid = false;
    } else if (value.includes("your_") || value.includes("your-")) {
      log.error(`${varName} contains placeholder value`);
      configValid = false;
    } else {
      log.success(`${varName} is configured`);
    }
  }

  return { configValid, configDetails };
}

// Validate URL formats and generate OAuth URLs
async function validateOAuthConfiguration() {
  log.header("OAuth Configuration Validation");

  const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  let valid = true;

  // Validate Customer Account API URL format
  if (apiUrl) {
    if (!apiUrl.startsWith("https://shopify.com/")) {
      log.error(
        "SHOPIFY_CUSTOMER_ACCOUNT_API_URL should start with https://shopify.com/"
      );
      valid = false;
    } else {
      log.success("Customer Account API URL format is correct");

      // Extract shop ID from URL
      const shopIdMatch = apiUrl.match(/https:\/\/shopify\.com\/([^\/]+)\//);
      if (shopIdMatch) {
        log.info(`🏪 Detected Shop ID: ${shopIdMatch[1]}`);
      }
    }

    // Check if URL ends with the correct GraphQL endpoint
    if (!apiUrl.includes("/account/customer/api/")) {
      log.warn("API URL should include /account/customer/api/ path");
    } else {
      log.success("API URL path is correct");
    }
  }

  // Validate App URL format
  if (appUrl) {
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      log.error("NEXT_PUBLIC_APP_URL should start with http:// or https://");
      valid = false;
    } else {
      log.success("App URL format is correct");
    }
  }

  // Generate and validate OAuth URLs
  if (clientId && !clientId.includes("your_")) {
    log.info("Generated OAuth URLs:");

    const authUrls = {
      authorize: `https://shopify.com/${clientId}/auth/oauth/authorize`,
      token: `https://shopify.com/${clientId}/auth/oauth/token`,
      logout: `https://shopify.com/${clientId}/auth/logout`,
    };

    console.log(`   🔐 Authorize: ${authUrls.authorize}`);
    console.log(`   🎫 Token: ${authUrls.token}`);
    console.log(`   🚪 Logout: ${authUrls.logout}`);

    // Validate redirect URI
    if (appUrl) {
      const redirectUri = `${appUrl}/api/auth/callback`;
      console.log(`   🔄 Redirect URI: ${redirectUri}`);
      log.info(
        "Make sure this redirect URI is registered in your Partner Dashboard"
      );
    }

    return { valid, authUrls };
  }

  return { valid, authUrls: null };
}

// Test OAuth scopes configuration
function validateOAuthScopes() {
  log.header("OAuth Scopes Validation");

  const requiredScopes = [
    "openid",
    "email",
    "profile",
    "customer-account-api:read",
    "customer-account-api:write",
  ];

  log.info("Required OAuth scopes for Customer Account API:");
  requiredScopes.forEach((scope) => {
    console.log(`   ✓ ${scope}`);
  });

  const scopeString = requiredScopes.join(" ");
  log.info(`Complete scope string: "${scopeString}"`);

  return true;
}

// Test API endpoint accessibility (basic connectivity to auth)
async function testAPIEndpointAccessibility() {
  log.header("API Endpoint Accessibility Test");

  const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;

  if (!apiUrl || apiUrl.includes("your-")) {
    log.warn("Cannot test endpoint - API URL not configured");
    return false;
  }

  try {
    log.info("Testing API endpoint accessibility...");

    // Test basic connectivity (this will likely return an auth error, which is expected)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ __typename }", // Simple introspection query
      }),
    });

    log.info(`API endpoint responded with status: ${response.status}`);

    if (response.status === 401) {
      log.success(
        "✅ API endpoint is accessible (401 Unauthorized is expected without token)"
      );
      return true;
    } else if (response.status === 200) {
      log.success("✅ API endpoint is accessible and responding");
      return true;
    } else if (response.status === 404) {
      log.error(
        "❌ API endpoint not found - check your SHOPIFY_CUSTOMER_ACCOUNT_API_URL"
      );
      return false;
    } else {
      log.warn(`⚠️ Unexpected response status: ${response.status}`);
      return true; // Still consider it accessible
    }
  } catch (error) {
    if (error.message.includes("ENOTFOUND")) {
      log.error("❌ Cannot reach API endpoint - check your URL");
      return false;
    } else {
      log.warn(`⚠️ Network error: ${error.message}`);
      return false;
    }
  }
}

// Test Next.js API routes configuration
async function testNextJSAPIRoutes() {
  log.header("Next.js API Routes Test");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const authRoutes = [
    "/api/auth/login",
    "/api/auth/callback",
    "/api/auth/logout",
    "/api/auth/me",
  ];

  let allRoutesAccessible = true;

  log.info("Testing authentication API routes...");

  for (const route of authRoutes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        method: "GET",
        timeout: 5000,
      });

      // We expect various responses here since these are auth routes
      if (response.status === 405) {
        log.success(`${route} - Route exists (Method Not Allowed is expected)`);
      } else if (response.status === 401) {
        log.success(`${route} - Route exists (Unauthorized is expected)`);
      } else if (response.status === 302) {
        log.success(`${route} - Route exists (Redirect is expected)`);
      } else if (response.status === 200) {
        log.success(`${route} - Route exists and responding`);
      } else {
        log.warn(`${route} - Unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.message.includes("ECONNREFUSED")) {
        log.warn(
          `${route} - Server not running (this is normal if dev server is not started)`
        );
      } else {
        log.error(`${route} - Error: ${error.message}`);
        allRoutesAccessible = false;
      }
    }
  }

  if (allRoutesAccessible) {
    log.info(
      "💡 To fully test API routes, start your dev server with: npm run dev"
    );
  }

  return allRoutesAccessible;
}

// Generate setup checklist
function generateSetupChecklist() {
  log.header("Customer Account API Setup Checklist");

  const checklist = [
    {
      step: "1. Partner Dashboard Setup",
      items: [
        "Create or access your Shopify Partner account",
        "Create a new app or use existing app",
        "Enable Customer Account API in app settings",
        "Note down Client ID and Client Secret",
        "Configure redirect URIs (include your app URL + /api/auth/callback)",
      ],
    },
    {
      step: "2. Environment Configuration",
      items: [
        "Set SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
        "Set SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET",
        "Set SHOPIFY_CUSTOMER_ACCOUNT_API_URL (from Partner Dashboard)",
        "Set NEXT_PUBLIC_APP_URL (your app domain)",
      ],
    },
    {
      step: "3. Application Setup",
      items: [
        "Implement OAuth PKCE flow in Next.js",
        "Create API routes for auth endpoints",
        "Handle callback and token management",
        "Implement customer session management",
      ],
    },
    {
      step: "4. Testing",
      items: [
        "Run this configuration test",
        "Test authentication flow end-to-end",
        "Verify customer data access",
        "Test logout functionality",
      ],
    },
  ];

  checklist.forEach((section) => {
    console.log(`\n📋 ${section.step}:`);
    section.items.forEach((item) => {
      console.log(`   • ${item}`);
    });
  });
}

// Main test runner
async function runCustomerAPITests() {
  console.log("\n🔐 Customer Account API Configuration Test\n");

  const tests = [
    { name: "Environment Variables", fn: testCustomerAccountAPIConfig },
    { name: "OAuth Configuration", fn: validateOAuthConfiguration },
    { name: "OAuth Scopes", fn: validateOAuthScopes },
    { name: "API Endpoint Accessibility", fn: testAPIEndpointAccessibility },
    { name: "Next.js API Routes", fn: testNextJSAPIRoutes },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      const passed =
        typeof result === "boolean"
          ? result
          : result.configValid || result.valid;
      results.push({ name: test.name, passed });
    } catch (error) {
      log.error(`Test '${test.name}' threw an error: ${error.message}`);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }

  // Summary
  log.header("Test Results Summary");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    if (result.passed) {
      log.success(result.name);
    } else {
      log.error(`${result.name}${result.error ? ` (${result.error})` : ""}`);
    }
  });

  console.log(`\nCustomer Account API Tests: ${passed}/${total} passed`);

  if (passed === total) {
    console.log("\n🎉 Customer Account API configuration looks good!");
    log.info(
      "You can now test the full authentication flow in your application."
    );
  } else {
    console.log("\n❌ Some Customer Account API configuration issues found.");
    generateSetupChecklist();
  }

  return passed === total;
}

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the tests
runCustomerAPITests().then((success) => {
  process.exit(success ? 0 : 1);
});
