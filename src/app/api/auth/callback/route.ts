import { exchangeCodeForToken } from "@/lib/server-customer-api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`
      );
    }

    // Get the stored code verifier
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("pkce_code_verifier")?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=no_verifier`
      );
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, codeVerifier);

    // Store access token in secure cookie
    cookieStore.set("shopify_customer_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 3600, // Use token expiry or default to 1 hour
    });

    // Clean up the code verifier
    cookieStore.delete("pkce_code_verifier");

    // Redirect back to app
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?auth=success`
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=auth_failed`
    );
  }
}
