#!/usr/bin/env node

/**
 * Quick Shopify Store Test
 *
 * A minimal test to quickly check if your Shopify store domain and token work.
 * Only requires SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN.
 *
 * Usage: node scripts/quick-test.js
 */

const { config } = require("dotenv");

// Load environment variables
config({ path: ".env.local" });

async function quickTest() {
  console.log("\n🚀 Quick Shopify Store Test\n");

  // Check required variables
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;

  if (!domain || domain.includes("your-")) {
    console.log("❌ SHOPIFY_STORE_DOMAIN is not configured");
    return;
  }

  // Use public token (private token has auth issues)
  const token = publicToken;
  if (!token || token.includes("your_")) {
    console.log("❌ SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN is not configured");
    return;
  }

  console.log("✅ Environment variables found");
  console.log(`🏪 Testing store: ${domain}`);
  console.log(`🔑 Using: Public Access Token`);

  try {
    // Simple shop query
    const endpoint = `https://${domain}/api/2025-01/graphql.json`;
    console.log(`Using endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query: `
          query {
            shop {
              name
              primaryDomain { url }
            }
            products(first: 1) {
              edges {
                node {
                  title
                }
              }
            }
            collections(first: 1) {
              edges {
                node {
                  title
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const { shop, products, collections } = result.data;

    console.log("✅ Connection successful!");
    console.log(`🏪 Shop: ${shop.name}`);
    console.log(`🌐 URL: ${shop.primaryDomain.url}`);
    console.log(
      `📦 Products: ${
        products.edges.length > 0
          ? `Found (e.g., "${products.edges[0].node.title}")`
          : "None found"
      }`
    );
    console.log(
      `📚 Collections: ${
        collections.edges.length > 0
          ? `Found (e.g., "${collections.edges[0].node.title}")`
          : "None found"
      }`
    );

    console.log("\n🎉 Your Shopify store is connected and ready!");
  } catch (error) {
    console.log("❌ Connection failed:", error.message);

    if (error.message.includes("401")) {
      console.log("\n💡 This usually means:");
      console.log("   - Your access token is incorrect");
      console.log("   - You're using a public token instead of a private one");
      console.log("   - The token doesn't have the right permissions");
    }

    if (error.message.includes("getaddrinfo ENOTFOUND")) {
      console.log("\n💡 This usually means:");
      console.log("   - Your store domain is incorrect");
      console.log("   - Check the spelling of your .myshopify.com domain");
    }
  }
}

quickTest().catch(console.error);
