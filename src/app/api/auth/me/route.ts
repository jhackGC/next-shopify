import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCustomerFromSession } from "../../../../lib/server-shopify-customer-api";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Specifically check for our token
    const tokenCookie = cookieStore.get("access_token");

    // If no token cookie, return immediately
    if (!tokenCookie) {
      console.log("### No token found, returning unauthenticated");
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const customer = await getCustomerFromSession();

    if (!customer) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const meResponse = {
      authenticated: true,
      customer,
    };

    console.log("### ME Returning customer info:", meResponse);
    return NextResponse.json(meResponse);
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { error: "Failed to get customer" },
      { status: 500 }
    );
  }
}
