import { getProductFragment } from '../fragments/product';

export const getProductQuery = (admin: boolean) => {
  /* GraphQL */
  return `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${getProductFragment(admin)}
`;
};

export const getProductsQuery = (admin: boolean) => {
  /* GraphQL */
  return `
    query getProducts(
      $sortKey: ProductSortKeys
      $reverse: Boolean
      $startCursor: String
    ) {
      products(
        sortKey: $sortKey
        reverse: $reverse
        after: $startCursor
        first: 250
      ) {
        edges {
          node {
            ...product
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
    ${getProductFragment(admin)}
  `;
};

export const getProductsByHandleQuery = (admin: boolean) => {
  /* GraphQL */

  console.log('### getProductsByHandleQuery admin', admin);
  if (admin) {
    return `
      query getProductsByHandleQuery($identifier: ProductIdentifierInput!) {
          productByIdentifier(identifier: $identifier) {
            ...product
          }
      }
      ${getProductFragment(true)}
      `;
  } else {
    return `
      query getProductsByHandleQuery($handle: String) {
        product(handle: $handle) {
          ...product
        }
      }
      ${getProductFragment(false)}
  `;
  }
};

export const updateProductTagsMutation = /* GraphQL */ `
  mutation {
    updateProductTags(
      input: {
        id: "gid://shopify/Product/1234567890"
        tags: ["new-tag-1", "new-tag-2", "updated-tag"]
      }
    ) {
      product {
        id
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const getProductsQueryWithQty = (qty = 500) => {
  /* GraphQL */

  return `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: ${qty}) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${getProductFragment(false)}
`;
};

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${getProductFragment(false)}
`;
