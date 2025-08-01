import { GET_COLLECTIONS } from "@/lib/queries";
import { storefrontClient } from "@/lib/server-shopify";
import type { Collection } from "@/types/shopify";
import { NextRequest, NextResponse } from "next/server";

interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: Collection;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = searchParams.get("first") || "8";

    const response = await storefrontClient.request<CollectionsResponse>(
      GET_COLLECTIONS,
      {
        first: parseInt(first),
      }
    );

    const collections = response.collections.edges.map(
      (edge: { node: Collection }) => edge.node
    );

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
