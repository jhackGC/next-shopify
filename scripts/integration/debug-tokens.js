#!/usr/bin/env node

/**
 * Debug Token Test
 *
 * Tests both private and public tokens separately to identify the issue
 */

const { config } = require("dotenv");

// Load environment variables
config({ path: ".env.local" });

async function testToken(token, tokenType) {
  console.log(`\n🔍 Testing ${tokenType} Token`);
  console.log(
    `Token format: ${token.substring(0, 10)}...${token.substring(
      token.length - 4
    )}`
  );

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const endpoint = `https://${domain}/api/2025-01/graphql.json`;

  const query = `
    query {
      shop {
        name
        primaryDomain { url }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error response: ${errorText}`);
      return false;
    }

    const result = await response.json();

    if (result.errors) {
      console.log(`GraphQL Errors: ${JSON.stringify(result.errors, null, 2)}`);
      return false;
    }

    console.log(`✅ ${tokenType} token works!`);
    console.log(`Shop: ${result.data.shop.name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${tokenType} token failed: ${error.message}`);
    return false;
  }
}

async function debugTokens() {
  console.log("🔧 Token Debugging\n");

  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN;

  if (!privateToken || !publicToken) {
    console.log("❌ Missing tokens in environment");
    return;
  }

  console.log(`Store: ${process.env.SHOPIFY_STORE_DOMAIN}`);

  // Test both tokens
  const privateWorks = await testToken(privateToken, "Private");
  const publicWorks = await testToken(publicToken, "Public");

  console.log("\n📊 Summary:");
  console.log(`Private token: ${privateWorks ? "✅ Works" : "❌ Failed"}`);
  console.log(`Public token: ${publicWorks ? "✅ Works" : "❌ Failed"}`);

  if (publicWorks && !privateWorks) {
    console.log(
      "\n💡 Recommendation: Use public token for now, investigate private token setup"
    );
  } else if (privateWorks && !publicWorks) {
    console.log("\n💡 Recommendation: Use private token as intended");
  } else if (!privateWorks && !publicWorks) {
    console.log(
      "\n💡 Both tokens failed - check your Shopify app configuration"
    );
  } else {
    console.log("\n💡 Both tokens work - you can use either one");
  }
}

debugTokens().catch(console.error);
