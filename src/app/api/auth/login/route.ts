import { SERVER_CUSTOMER_CONFIG } from "@/lib/server-customer-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Build authorization URL (no PKCE needed for confidential clients)
    const authUrl = new URL(SERVER_CUSTOMER_CONFIG.authUrls.authorize);
    authUrl.searchParams.append("client_id", SERVER_CUSTOMER_CONFIG.clientId);
    authUrl.searchParams.append(
      "redirect_uri",
      SERVER_CUSTOMER_CONFIG.redirectUri
    );
    authUrl.searchParams.append("scope", SERVER_CUSTOMER_CONFIG.scopes);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", "random_state_string"); // Use a secure random state in production
    authUrl.searchParams.append(
      "nonce",
      Math.random().toString(36).substring(2, 15) // Generate a random nonce
    );
    // Redirect to Shopify auth
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Auth initiation error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
