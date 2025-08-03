import { Collection, Product } from "@/types/shopify";
import { GraphQLClient } from "graphql-request";

// Server-side Shopify client using public token (private token has auth issues)
const getStorefrontClient = () => {
  return new GraphQLClient(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2025-07/graphql.json`,
    {
      headers: {
        "X-Shopify-Storefront-Access-Token":
          process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
    }
  );
};

// Export the client for use in API routes
export const storefrontClient = getStorefrontClient();

// GraphQL Queries
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          tags
          featuredImage {
            id
            url
            altText
            width
            height
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          availableForSale
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 200) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  id
                  url
                  altText
                  width
                  height
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Server-side data fetching functions
export async function getFeaturedProducts(
  count: number = 8
): Promise<Product[]> {
  try {
    const response = await getStorefrontClient().request<{
      products: {
        edges: Array<{
          node: Product;
        }>;
      };
    }>(GET_PRODUCTS_QUERY, { first: count });

    return response.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFeaturedCollections(
  count: number = 6
): Promise<Collection[]> {
  try {
    const response = await getStorefrontClient().request<{
      collections: {
        edges: Array<{
          node: Collection;
        }>;
      };
    }>(GET_COLLECTIONS_QUERY, { first: count });

    return response.collections.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

// Get products from a specific collection
export async function getCollectionProducts(
  handle: string,
  first: number = 30
): Promise<Product[]> {
  try {
    // const query = `
    //   query GetCollectionProducts($handle: String!) {
    //     collection(handle: $handle) {
    //       id
    //       title
    //       products(first: 20) {
    //         edges {
    //           node {
    //             id
    //             title
    //             handle
    //             featuredImage {
    //               id
    //               url
    //               altText
    //               width
    //               height
    //             }
    //             priceRange {
    //               minVariantPrice {
    //                 amount
    //                 currencyCode
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // `;

    const query = `
      query GetCollectionProducts($handle: String!) {
        collection(handle: $handle) {
          id
          title
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    `;

    const response = await getStorefrontClient().request<{
      collection: Collection | null;
    }>(query, { handle, first });

    return response.collection?.products.edges.map((edge) => edge.node) || [];
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return [];
  }
}

// Get a single product by handle (for product pages)
export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  try {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          vendor
          tags
          featuredImage {
            id
            url
            altText
            width
            height
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          availableForSale
          createdAt
          updatedAt
        }
      }
    `;

    const response = await getStorefrontClient().request<{
      product: Product | null;
    }>(query, { handle });

    return response.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Get collection by handle with products
export async function getCollectionByHandle(
  handle: string
): Promise<Collection | null> {
  try {
    const query = `
      query GetCollection($handle: String!) {
        collection(handle: $handle) {
          id
          title
          handle
          description
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 50, sortKey: BEST_SELLING) {
            edges {
              node {
                id
                title
                handle
                description
                vendor
                tags
                featuredImage {
                  id
                  url
                  altText
                  width
                  height
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                availableForSale
              }
            }
          }
        }
      }
    `;

    const response = await getStorefrontClient().request<{
      collection: Collection | null;
    }>(query, { handle });

    return response.collection;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}
