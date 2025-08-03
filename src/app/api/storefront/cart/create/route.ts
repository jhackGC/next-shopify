import { CREATE_CART } from "@/lib/queries";
import type { Cart, CartLineInput } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "../../../../../lib/shopify-storefront-api/server-shopify-storefront-api";

interface CreateCartResponse {
  cartCreate: {
    cart: Cart | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lines }: { lines?: CartLineInput[] } = body;
    console.log("Creating cart with lines:", lines);
    const response = await storefrontClient.request<CreateCartResponse>(
      CREATE_CART,
      {
        input: {
          lines: lines || [],
        },
      }
    );

    if (response.cartCreate.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartCreate.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart: response.cartCreate.cart });
  } catch (error) {
    console.error("Error creating cart:", error);
    return NextResponse.json(
      { error: "Failed to create cart" },
      { status: 500 }
    );
  }
}
