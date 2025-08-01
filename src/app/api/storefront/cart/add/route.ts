import { ADD_TO_CART } from "@/lib/queries";
import { storefrontClient } from "@/lib/server-shopify";
import type { Cart, CartLineInput } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";

interface AddToCartResponse {
  cartLinesAdd: {
    cart: Cart | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lines }: { cartId: string; lines: CartLineInput[] } = body;

    if (!cartId || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Cart ID and lines are required" },
        { status: 400 }
      );
    }

    const response = await storefrontClient.request<AddToCartResponse>(
      ADD_TO_CART,
      {
        cartId,
        lines,
      }
    );

    if (response.cartLinesAdd.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesAdd.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart: response.cartLinesAdd.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
