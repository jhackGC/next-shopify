import { UPDATE_CART_LINES } from "@/lib/queries";
import type { Cart, CartLineUpdateInput } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "../../../../../lib/shopify-storefront-api/server-shopify-storefront-api";

interface UpdateCartResponse {
  cartLinesUpdate: {
    cart: Cart | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lines }: { cartId: string; lines: CartLineUpdateInput[] } =
      body;

    if (!cartId || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Cart ID and lines are required" },
        { status: 400 }
      );
    }

    const response = await storefrontClient.request<UpdateCartResponse>(
      UPDATE_CART_LINES,
      {
        cartId,
        lines,
      }
    );

    if (response.cartLinesUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesUpdate.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart: response.cartLinesUpdate.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
