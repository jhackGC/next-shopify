import type { Customer } from "@/types/shopify";
import { GraphQLClient } from "graphql-request";
import { cookies } from "next/headers";

// Server-side Customer Account API client
const customerAccountClient = new GraphQLClient(
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL!,
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

// Configuration for Customer Account API (server-side only)
const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
// Extract shop ID from the API URL instead of the client ID
const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL!;
const shopId = apiUrl.match(/shopify\.com\/([^\/]+)\//)?.[1] || "";

export const SERVER_CUSTOMER_CONFIG = {
  clientId,
  clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET!, // Now we can use a secret!
  apiUrl,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,

  scopes: [
    "openid",
    "email",
    "profile",
    "customer-account-api:read",
    "customer-account-api:write",
  ].join(" "),

  authUrls: {
    authorize: `https://${process.env.SHOPIFY_STORE_DOMAIN}/account/customer/api/auth/oauth/authorize`,
    token: `https://${process.env.SHOPIFY_STORE_DOMAIN}/account/customer/api/auth/oauth/token`,
    logout: `https://${process.env.SHOPIFY_STORE_DOMAIN}/account/customer/api/auth/logout`,
  },
} as const;

// Server-side authentication functions
export async function getCustomerFromSession(): Promise<Customer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("shopify_customer_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const authenticatedClient = new GraphQLClient(
      SERVER_CUSTOMER_CONFIG.apiUrl,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const query = `
      query GetCustomer {
        customer {
          id
          email
          firstName
          lastName
          phone
          createdAt
          updatedAt
        }
      }
    `;

    const response = await authenticatedClient.request<{ customer: Customer }>(
      query
    );
    return response.customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

// Exchange authorization code for access token (server-side)
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  try {
    const tokenResponse = await fetch(SERVER_CUSTOMER_CONFIG.authUrls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: SERVER_CUSTOMER_CONFIG.clientId,
        client_secret: SERVER_CUSTOMER_CONFIG.clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri: SERVER_CUSTOMER_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    return await tokenResponse.json();
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
}

// Generate PKCE challenge (server-side)
export async function generatePKCEChallenge() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await base64URLEncode(await sha256(codeVerifier));

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

// Helper functions
function generateRandomString(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

async function base64URLEncode(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let string = "";
  bytes.forEach((byte) => (string += String.fromCharCode(byte)));
  return btoa(string).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
