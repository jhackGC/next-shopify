import { GET_PRODUCTS } from "@/lib/queries";
import { storefrontClient } from "@/lib/server-shopify";
import type { Product } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";

interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = searchParams.get("first") || "8";
    const sortKey = searchParams.get("sortKey") || "BEST_SELLING";

    const response = await storefrontClient.request<ProductsResponse>(
      GET_PRODUCTS,
      {
        first: parseInt(first),
        sortKey,
      }
    );

    const products = response.products.edges.map(
      (edge: { node: Product }) => edge.node
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
