export const STATIC_GENERATION_CONFIG = {
  // Collections to pre-generate at build time
  COLLECTIONS_TO_PREGENERATE: [
    "buy-now",
    // "featured-products",
    // "bestsellers",
    // Add more collection handles as needed
  ],

  // Maximum number of products to pre-generate per collection
  MAX_PRODUCTS_PER_COLLECTION: 100,

  // Whether to enable static generation (useful for development)
  //   ENABLE_STATIC_GENERATION: process.env.ENV === "prod",
  ENABLE_STATIC_GENERATION: true, // Always enable for now
} as const;
