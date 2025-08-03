import { GET_CART } from "@/lib/queries";
import type { Cart } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "../../../../lib/shopify-storefront-api/server-shopify-storefront-api";

interface CartResponse {
  cart: Cart | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    const response = await storefrontClient.request<CartResponse>(GET_CART, {
      cartId,
    });

    return NextResponse.json({ cart: response.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
