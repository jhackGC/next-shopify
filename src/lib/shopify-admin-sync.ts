// Shopify Admin API for customer management
// Requires: Private App or Public App with customer read/write permissions

import { GraphQLClient } from "graphql-request";

// Admin API client (server-side only!)
const adminClient = new GraphQLClient(
  `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
      "Content-Type": "application/json",
    },
  }
);

export class ShopifyAdminSync {
  // Create or update customer in Shopify
  async syncCustomer(externalUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }) {
    try {
      // First, check if customer already exists
      const existingCustomer = await this.findCustomerByEmail(
        externalUser.email
      );

      if (existingCustomer) {
        return await this.updateCustomer(existingCustomer.id, externalUser);
      } else {
        return await this.createCustomer(externalUser);
      }
    } catch (error) {
      console.error("Error syncing customer:", error);
      throw error;
    }
  }

  // Find customer by email
  private async findCustomerByEmail(email: string) {
    const query = `
      query findCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
              acceptsMarketing
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = { query: `email:${email}` };
    const response = (await adminClient.request(query, variables)) as any;

    return response.customers.edges[0]?.node || null;
  }

  // Create new customer
  private async createCustomer(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  }) {
    const mutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
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
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptsMarketing: userData.acceptsMarketing || false,
        // Store external user ID for linking
        metafields: [
          {
            namespace: "external_auth",
            key: "user_id",
            value: userData.id,
            type: "single_line_text_field",
          },
          {
            namespace: "external_auth",
            key: "synced_at",
            value: new Date().toISOString(),
            type: "date_time",
          },
        ],
      },
    };

    const response = (await adminClient.request(mutation, variables)) as any;

    if (response.customerCreate.userErrors.length > 0) {
      throw new Error(response.customerCreate.userErrors[0].message);
    }

    return response.customerCreate.customer;
  }

  // Update existing customer
  private async updateCustomer(
    shopifyCustomerId: string,
    userData: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      acceptsMarketing?: boolean;
    }
  ) {
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
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
        id: shopifyCustomerId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptsMarketing: userData.acceptsMarketing,
        metafields: [
          {
            namespace: "external_auth",
            key: "user_id",
            value: userData.id,
            type: "single_line_text_field",
          },
          {
            namespace: "external_auth",
            key: "synced_at",
            value: new Date().toISOString(),
            type: "date_time",
          },
        ],
      },
    };

    const response = (await adminClient.request(mutation, variables)) as any;

    if (response.customerUpdate.userErrors.length > 0) {
      throw new Error(response.customerUpdate.userErrors[0].message);
    }

    return response.customerUpdate.customer;
  }

  // Get customer orders
  async getCustomerOrders(email: string) {
    const query = `
      query getCustomerOrders($query: String!) {
        orders(first: 20, query: $query) {
          edges {
            node {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
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
                        handle
                      }
                      price
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                address1
                city
                province
                country
                zip
              }
            }
          }
        }
      }
    `;

    const variables = { query: `email:${email}` };
    const response = (await adminClient.request(query, variables)) as any;

    return response.orders.edges.map((edge: any) => edge.node);
  }

  // Create customer address
  async addCustomerAddress(
    shopifyCustomerId: string,
    address: {
      firstName?: string;
      lastName?: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone?: string;
    }
  ) {
    const mutation = `
      mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
        customerAddressCreate(customerId: $customerId, address: $address) {
          customerAddress {
            id
            firstName
            lastName
            address1
            city
            province
            country
            zip
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      customerId: shopifyCustomerId,
      address,
    };

    const response = (await adminClient.request(mutation, variables)) as any;

    if (response.customerAddressCreate.userErrors.length > 0) {
      throw new Error(response.customerAddressCreate.userErrors[0].message);
    }

    return response.customerAddressCreate.customerAddress;
  }
}
