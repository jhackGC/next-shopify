# Shopify Security Migration: Complete Server-Side Architecture

## Overview

This Next.js application has been **completely migrated to server-side Shopify API access**. All Shopify operations (Customer Account API and Storefront API) now happen on the server for maximum security and zero credential exposure to the client.

## 🔒 Security Architecture

### Complete Server-Side Migration

- **✅ Customer Account API**: Server-side only with HTTP-only cookies
- **✅ Storefront API**: Server-side only through API routes
- **✅ Cart operations**: Server-proxied through API endpoints
- **✅ Product fetching**: Server-proxied through API endpoints
- **✅ Zero credentials**: No API keys exposed to browser

## 🏗️ API Route Architecture

```
/api/auth/          # Customer authentication
├── login           # Initiate passwordless login
├── callback        # Handle OAuth callback
├── logout          # Clear session
└── me              # Get customer info

/api/storefront/    # All Shopify Storefront operations
├── products        # Fetch products
├── collections     # Fetch collections
└── cart/
    ├── create      # Create cart
    ├── add         # Add to cart
    ├── update      # Update cart
    └── remove      # Remove from cart
```

## 📝 Environment Variables

### Server-Only (Secure)

```bash
# All Shopify credentials are server-side only
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token

# Customer Account API
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_client_id
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=your_secret
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your-api-url
```

### Client-Side (Public)

```bash
# Only safe application config is exposed
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔄 Request Flow

### Authentication Flow

```
1. Client → /api/auth/login → Server generates PKCE auth URL
2. Redirect → Shopify login page
3. Shopify → /api/auth/callback → Server exchanges code for tokens
4. Server stores tokens in HTTP-only cookies
5. Client gets authenticated session
```

### API Request Flow

```
1. Client component → /api/storefront/products
2. Server API route → Shopify Storefront API (with server credentials)
3. Server → Returns data to client
4. Client → Updates UI
```

## 💻 Implementation

### Server-Proxied Client Library

```typescript
// /src/lib/server-proxied-shopify.ts
export async function fetchProducts(options = {}) {
  const response = await fetch("/api/storefront/products?" + params);
  return response.json();
}

export async function addToCart(cartId: string, lines: CartLineInput[]) {
  const response = await fetch("/api/storefront/cart/add", {
    method: "POST",
    body: JSON.stringify({ cartId, lines }),
  });
  return response.json();
}
```

### Component Usage

```typescript
// Components use server-proxied functions
import { fetchProducts, addToCart } from "@/lib/server-proxied-shopify";

export function ProductList() {
  useEffect(() => {
    const loadProducts = async () => {
      // This calls /api/storefront/products internally
      const products = await fetchProducts({ first: 8 });
      setProducts(products);
    };
    loadProducts();
  }, []);
}
```

### Cart Management

```typescript
// /src/lib/cart.ts - All operations are server-proxied
export class CartManager {
  async addToCart(lines: CartLineInput[]) {
    // Calls /api/storefront/cart/add internally
    return await addToCartAPI(cartId, lines);
  }

  async updateCartLine(lineId: string, quantity: number) {
    // Calls /api/storefront/cart/update internally
    return await updateCartLines(cartId, [{ id: lineId, quantity }]);
  }
}
```

## 🛡️ Security Benefits

### ✅ Complete Credential Protection

- **Zero API keys** in client-side code
- **Zero API keys** in browser network requests
- **Zero API keys** in client-side bundles or source maps
- **HTTP-only cookies** for authentication tokens

### ✅ Server-Side Validation

- All Shopify API calls validated on server
- Authentication tokens never leave server
- Error handling and rate limiting on server
- Secure token refresh and management

### ✅ Attack Surface Reduction

- No client-side credential theft possible
- No man-in-the-middle API key exposure
- Protected against XSS token extraction
- Centralized security through server routes

## 🚀 Performance Considerations

### Optimizations

- **Caching**: Server routes can implement caching strategies
- **Batch requests**: Multiple operations can be batched server-side
- **Connection pooling**: Reuse GraphQL client connections
- **Error retry**: Implement retry logic on server

### Trade-offs

- **Extra network hop**: Client → Server → Shopify (vs Client → Shopify)
- **Server load**: All API requests go through our server
- **Latency**: Slight increase due to proxying

## 📁 File Structure

```
src/
├── lib/
│   ├── server-shopify.ts           # Server Shopify client
│   ├── server-customer-api.ts      # Customer API (server)
│   ├── server-proxied-shopify.ts   # Client-side API wrapper
│   └── cart.ts                     # Cart manager (uses proxied API)
├── app/api/
│   ├── auth/                       # Authentication endpoints
│   └── storefront/                 # Storefront API endpoints
├── contexts/
│   ├── ServerAuthContext.tsx       # Auth context (uses server routes)
│   └── CartContext.tsx             # Cart context (uses proxied API)
└── components/                     # All components use proxied API
```

## 🔧 Development Setup

1. **Environment setup**:

   ```bash
   cp .env.example .env.local
   # Configure only server-side variables (no NEXT_PUBLIC_ for Shopify)
   ```

2. **Run development**:

   ```bash
   npm run dev
   ```

3. **All API calls are proxied**: No direct Shopify API access from client

## 🎯 Migration Summary

### What Was Removed

- ❌ `NEXT_PUBLIC_SHOPIFY_*` environment variables
- ❌ Direct client-side Shopify API calls
- ❌ Client-side GraphQL requests to Shopify
- ❌ Exposed Storefront Access Tokens

### What Was Added

- ✅ Complete server-side API route architecture
- ✅ Server-proxied client library
- ✅ Secure credential management
- ✅ HTTP-only cookie authentication

### Result

**Zero Shopify credentials are now exposed to the client**, providing maximum security while maintaining full functionality. All Shopify operations are performed server-side and proxied to client components through secure API routes.
