/**
 * Server-proxied Shopify Storefront API client
 * This replaces direct client-side calls to Shopify with server-side API routes
 * for better security (no exposed access tokens)
 */

import type {
  Cart,
  CartLineInput,
  CartLineUpdateInput,
  Collection,
  Product,
} from "@/types/shopify";

const API_BASE = "/api/storefront";

// Error handling helper
export function handleApiError(error: any): string {
  if (error?.error) {
    return error.error;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// Products API
export async function fetchProducts(
  options: {
    first?: number;
    sortKey?: string;
  } = {}
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options.first) params.set("first", options.first.toString());
  if (options.sortKey) params.set("sortKey", options.sortKey);

  const response = await fetch(`${API_BASE}/products?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.products;
}

// Collections API
export async function fetchCollections(
  options: {
    first?: number;
  } = {}
): Promise<Collection[]> {
  const params = new URLSearchParams();
  if (options.first) params.set("first", options.first.toString());

  const response = await fetch(`${API_BASE}/collections?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.collections;
}

// Cart API
export async function fetchCart(cartId: string): Promise<Cart | null> {
  const params = new URLSearchParams({ cartId });

  const response = await fetch(`${API_BASE}/cart?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.cart;
}

export async function createCart(
  lines: CartLineInput[] = []
): Promise<Cart | null> {
  const response = await fetch(`${API_BASE}/cart/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lines }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.cart;
}

export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart | null> {
  const response = await fetch(`${API_BASE}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartId, lines }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add to cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<Cart | null> {
  const response = await fetch(`${API_BASE}/cart/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartId, lines }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart | null> {
  const response = await fetch(`${API_BASE}/cart/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartId, lineIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to remove from cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.cart;
}

// Configuration constants (no sensitive data)
export const SHOPIFY_CONFIG = {
  // API Versions
  storefrontApiVersion: "2024-07",

  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 250,

  // Cart settings
  cartCookieName: "shopify_cart_id",
  cartCookieMaxAge: 30 * 24 * 60 * 60, // 30 days
} as const;

// Helper function to validate cart ID format
export function isValidCartId(cartId: string): boolean {
  // Shopify cart IDs are base64 encoded strings
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(cartId) && cartId.length > 0;
}
