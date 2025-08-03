import { REMOVE_FROM_CART } from "@/lib/queries";
import type { Cart } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "../../../../../lib/shopify-storefront/server-shopify-storefront-api";

interface RemoveFromCartResponse {
  cartLinesRemove: {
    cart: Cart | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineIds }: { cartId: string; lineIds: string[] } = body;

    if (!cartId || !lineIds || lineIds.length === 0) {
      return NextResponse.json(
        { error: "Cart ID and line IDs are required" },
        { status: 400 }
      );
    }

    const response = await storefrontClient.request<RemoveFromCartResponse>(
      REMOVE_FROM_CART,
      {
        cartId,
        lineIds,
      }
    );

    if (response.cartLinesRemove.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesRemove.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart: response.cartLinesRemove.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
