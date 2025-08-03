import { exchangeCodeForToken2, getAppUrl } from "@/lib/server-customer-api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    const tokenData = await exchangeCodeForToken2(code);
    console.log("### Auth Callback - tokenData:", tokenData);

    // Store access token in secure cookie
    const cookieStore = await cookies();
    console.log(
      "### Setting cookie with token:",
      tokenData.access_token ? "TOKEN_EXISTS" : "NO_TOKEN"
    );

    // Set cookie with appropriate settings
    cookieStore.set("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Ensure cookie is available site-wide
    });

    cookieStore.set("id_token", tokenData.id_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: tokenData.expires_in,
    });

    cookieStore.set("refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: tokenData.expires_in,
    });

    // Verify cookie was set
    const savedToken = cookieStore.get("access_token")?.value;
    console.log(
      "### Cookie verification:",
      savedToken ? "COOKIE_SET" : "COOKIE_NOT_SET"
    );

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
