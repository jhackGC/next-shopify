# Token Configuration & Component Architecture

## Token Issue Resolution

### Problem

The Shopify private access token (`shpat_*`) was returning 401 Unauthorized errors despite having the same permissions as the public token.

### Solution

Updated the configuration to use the **public access token** for Storefront API access. Both tokens have identical permissions, but the public token works reliably.

### Current Configuration

- **Server-side code**: Uses `SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN`
- **Test scripts**: Use public token as primary, with fallback logic
- **Environment**: Both tokens are stored, but public token is used

## Component Architecture Improvement

### Problem

The `ProductCard` component was a client component (`"use client"`) due to cart interaction, causing server-side rendering issues.

### Solution

Separated concerns using the following architecture:

1. **ProductCard** (Server Component)

   - Renders product information
   - Handles static content (images, prices, descriptions)
   - Server-side rendered for better performance

2. **QuickAddButton** (Client Component)
   - Handles cart interactions only
   - Uses `useCart` hook
   - Small, focused client-side component

### Benefits

- ✅ Better performance (server-side rendering)
- ✅ Smaller client-side JavaScript bundle
- ✅ Clear separation of concerns
- ✅ Maintains interactive functionality

### File Structure

```
src/components/product/
├── ProductCard.tsx          # Server component
├── QuickAddButton.tsx       # Client component (new)
└── AddToCartButton.tsx      # Client component (existing)
```

## Token Debugging

Use the debug script to test both tokens:

```bash
node scripts/integration/debug-tokens.js
```

This will show which token works and provide detailed error information.
