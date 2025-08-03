import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  cleanAllAuthCookies,
  getLogoutUrl,
} from "../../../../lib/server-customer-api";

export async function GET() {
  console.log("### GET Logout - clearing cookies and redirecting ...");
  try {
    // keep the id_token to logout from Shopify
    const id_token = (await cookies()).get("id_token")?.value;
    if (!id_token) {
      console.error("No id_token found, cannot logout from Shopify");
      return NextResponse.json({ error: "No id_token found" }, { status: 400 });
    }
    await cleanAllAuthCookies();

    const logoutUrl = await getLogoutUrl(id_token);
    console.log("### cleared cookies - about to logout from Shopify");
    console.log("### Redirecting to logout URL:", logoutUrl);

    // Redirect to Shopify logout URL, which will redirect back to our app
    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
