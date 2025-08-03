import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getAppUrl,
  setSecureCookie,
} from "../../../../lib/server-shopify-customer-api";

/**
 * Any auth flow has to be tested using the proxied app domain (ngrok), because those are the only
 * urls Shopify will accept to be set in the application setup endpoints.
 * It does not accept localhost domains.
 * Application setup endpoints:
 * - Callback URI(s) (required)
 * - Logout URI
 *
 */
export async function GET(request: NextRequest) {
  console.log("### Auth Callback ...");
  console.log("### Request URL:", request.url);
  console.log("### APP_URL:", getAppUrl({ inAuthFlow: true }));

  try {
    const appUrl = getAppUrl({ inAuthFlow: true });
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(`${appUrl}?error=no_code`);
    }

    // Exchange code for token (no code verifier needed for confidential clients)
    const tokenData = await exchangeCodeForToken(code);
    console.log("### Auth Callback - tokenData:", tokenData);

    // Validate that we have the required tokens
    if (!tokenData.access_token || !tokenData.id_token) {
      console.error("### Missing required tokens:", {
        hasAccessToken: !!tokenData.access_token,
        hasIdToken: !!tokenData.id_token,
      });
      return NextResponse.redirect(`${appUrl}?error=invalid_tokens`);
    }

    // Store tokens with appropriate expiration times
    // Store access token in secure cookie
    console.log(
      "### Setting cookie with token:",
      tokenData.access_token ? "TOKEN_EXISTS" : "NO_TOKEN"
    );

    // Access token - expirationTime 1 hour
    setSecureCookie({
      cookieName: "access_token",
      cookieValue: tokenData.access_token,
      expirationTime: 60 * 60, // 1 hour
    });
    // Verify cookie was set
    const savedToken = (await cookies()).get("access_token")?.value;
    console.log(
      "### Cookie verification:",
      savedToken ? "COOKIE_SET" : "COOKIE_NOT_SET"
    );

    // ID token - expirationTime same as access token (needed for logout)
    setSecureCookie({
      cookieName: "id_token",
      cookieValue: tokenData.id_token,
      expirationTime: 60 * 60, // 1 hour, same as access token
    });

    // Refresh token - longer lived (7 days)
    setSecureCookie({
      cookieName: "refresh_token",
      cookieValue: tokenData.refresh_token,
      expirationTime: 7 * 24 * 60 * 60, // 7 days
    });

    const redirectUrl = `${appUrl}/account`;
    console.log("### Redirecting to:", redirectUrl);

    // Redirect to success page or dashboard
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${
        process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL
      }?error=auth_failed`
    );
  }
}
