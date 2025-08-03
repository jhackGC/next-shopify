import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  cleanAllAuthCookies,
  getAppUrl,
  getLogoutUrl,
} from "../../../../lib/server-shopify-customer-api";

export async function GET() {
  console.log("### GET Logout - clearing cookies and redirecting ...");
  try {
    // keep the id_token to logout from Shopify
    const id_token = (await cookies()).get("id_token")?.value;

    await cleanAllAuthCookies();

    if (!id_token) {
      console.error(
        `No id_token found, cannot logout from Shopify, 
        cookies have been deleted manually, redirecting to home page`
      );
      return NextResponse.redirect(getAppUrl({ inAuthFlow: true }));
    }

    const logoutUrl = await getLogoutUrl(id_token);
    console.log("### cleared cookies - about to logout from Shopify");
    console.log("### Redirecting to logout URL:", logoutUrl);

    // Redirect to Shopify logout URL,
    // which will logout, clean cookies, and redirect back to our app
    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
