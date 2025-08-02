import { exchangeCodeForToken } from "@/lib/server-customer-api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("### Auth Callback ...");

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // console.log("### Auth Callback - Code:", code);
    // console.log("### Auth Callback - State:", state);

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`
      );
    }

    // Exchange code for token (no code verifier needed for confidential clients)
    const tokenData = await exchangeCodeForToken(code);
    console.log("### Auth Callback - tokenData:", tokenData);

    // Store access token in secure cookie
    const cookieStore = await cookies();
    cookieStore.set("shopify_customer_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect to success page or dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=auth_failed`
    );
  }
}
