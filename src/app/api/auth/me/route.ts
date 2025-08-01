import { getCustomerFromSession } from "@/lib/server-customer-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
