import { getCustomerFromSession } from "@/lib/server-customer-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // List all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log(
      "### All cookies in /api/auth/me:",
      allCookies.map((c) => ({
        name: c.name,
        value: c.value ? "HAS_VALUE" : "NO_VALUE",
      }))
    );

    // Debug: Log the actual cookie values (first 50 chars)
    allCookies.forEach((cookie) => {
      if (cookie.name === "shopify_customer_token") {
        console.log(
          "### FOUND shopify_customer_token cookie value (first 50 chars):",
          cookie.value?.substring(0, 50)
        );
        console.log("### Full cookie length:", cookie.value?.length);
      }
    });

    // Specifically check for our token
    const tokenCookie = cookieStore.get("shopify_customer_token");
    console.log(
      "### shopify_customer_token cookie:",
      tokenCookie ? "FOUND" : "NOT_FOUND"
    );

    // If no token cookie, return immediately
    if (!tokenCookie) {
      console.log("### No token found, returning unauthenticated");
      return NextResponse.json({ authenticated: false, customer: null });
    }

    console.log("### Get Customer Info");
    const customer = await getCustomerFromSession();

    if (!customer) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { error: "Failed to get customer" },
      { status: 500 }
    );
  }
}
