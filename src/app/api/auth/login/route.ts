import {
  generatePKCEChallenge,
  SERVER_CUSTOMER_CONFIG,
} from "@/lib/server-customer-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate PKCE challenge
    const { codeVerifier, codeChallenge, codeChallengeMethod } =
      await generatePKCEChallenge();

    // Store code verifier in a secure cookie for later use
    const cookieStore = await cookies();
    cookieStore.set("pkce_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    // Build authorization URL
    const authUrl = new URL(SERVER_CUSTOMER_CONFIG.authUrls.authorize);
    authUrl.searchParams.append("client_id", SERVER_CUSTOMER_CONFIG.clientId);
    authUrl.searchParams.append(
      "redirect_uri",
      SERVER_CUSTOMER_CONFIG.redirectUri
    );
    authUrl.searchParams.append("scope", SERVER_CUSTOMER_CONFIG.scopes);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", codeChallengeMethod);

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
