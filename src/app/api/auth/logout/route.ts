import { NextResponse } from "next/server";
import {
  cleanAllAuthCookies,
  getLogoutUrl,
} from "../../../../lib/server-customer-api";

export async function GET() {
  console.log("### GET Logout - clearing cookies and redirecting ...");
  try {
    const logoutUrl = await getLogoutUrl();

    cleanAllAuthCookies();

    console.log("### cleared cookies - about to logout from Shopify");

    console.log("### Redirecting to logout URL:", logoutUrl);
    // logout from shopify
    // Redirect to logout URL, it will return to the redirect
    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
