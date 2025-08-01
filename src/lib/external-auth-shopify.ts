// Example with any identity provider (Auth0, Firebase, etc.)
import { storefrontClient } from "./server-shopify";

// Customer management with external auth
export class ShopifyCustomerManager {
  // Sync external user to Shopify customer
  async syncCustomerToShopify(externalUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    // Use Admin API to create/update customer in Shopify
    const mutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email: externalUser.email,
        firstName: externalUser.firstName,
        lastName: externalUser.lastName,
        phone: externalUser.phone,
        // Store external user ID in metafields for linking
        metafields: [
          {
            namespace: "external_auth",
            key: "user_id",
            value: externalUser.id,
            type: "single_line_text_field",
          },
        ],
      },
    };

    // This would use Admin API (requires private app or OAuth)
    // For now, we'll focus on storefront features
    console.log("Would sync customer:", variables);
  }

  // Get orders for a customer using their email
  async getCustomerOrders(email: string) {
    // Use Admin API to fetch orders by email
    const query = `
      query getOrders($query: String!) {
        orders(first: 10, query: $query) {
          edges {
            node {
              id
              name
              processedAt
              totalPriceV2 {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      product {
                        title
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

    // This would use Admin API
    console.log("Would fetch orders for:", email);
    return [];
  }

  // Create a cart for authenticated user
  async createUserCart(
    items: Array<{
      merchandiseId: string;
      quantity: number;
    }>,
    userEmail?: string
  ) {
    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: items.map((item) => ({
          merchandiseId: item.merchandiseId,
          quantity: item.quantity,
        })),
        // Optionally associate with user email for tracking
        ...(userEmail && {
          buyerIdentity: {
            email: userEmail,
          },
        }),
      },
    };

    try {
      const response = (await storefrontClient.request(
        mutation,
        variables
      )) as any;

      if (response.cartCreate.userErrors.length > 0) {
        throw new Error(response.cartCreate.userErrors[0].message);
      }

      return response.cartCreate.cart;
    } catch (error) {
      console.error("Error creating user cart:", error);
      throw error;
    }
  }
}
