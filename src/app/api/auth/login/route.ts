import { NextResponse } from "next/server";
import { getLoginUrl } from "../../../../lib/server-customer-api";

export async function GET() {
  try {
    const authUrl = getLoginUrl();
    // Redirect to Shopify auth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth initiation error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
