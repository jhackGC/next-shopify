import {
  getProductFragment,
  productFragmentForCard,
  productFragmentHandleOnly,
} from "../fragments/product";
import seoFragment from "../fragments/seo";

export const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    id
    handle
    title
    description
    image {
      altText
      id
      src
    }
    seo {
      ...seo
    }
    updatedAt
    code: metafield(namespace: "custom", key: "code") {
      value
    }
    type: metafield(namespace: "custom", key: "type") {
      value
    }
    imageBannerSmall: metafield(
      namespace: "custom"
      key: "image_banner_small"
    ) {
      value
    }
    imageBannerSmallExternalUrl: metafield(
      namespace: "custom"
      key: "image_banner_small_external_url"
    ) {
      value
    }
    imageBannerLargeExternalUrl: metafield(
      namespace: "custom"
      key: "image_banner_large_external_url"
    ) {
      value
    }
  }
  ${seoFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
    }
  }
  ${collectionFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 100, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
    }
  }
  ${collectionFragment}
`;

export const getShopDataQuery = /* GraphQL */ `
  query getShopData {
    shop {
      name
      description
      moneyFormat
      primaryDomain {
        url
        host
      }
    }
  }
`;

export const collectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $first: Int = 250
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $startCursor: String
  ) {
    collection(handle: $handle) {
      products(
        sortKey: $sortKey
        reverse: $reverse
        after: $startCursor
        first: $first
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
  }
  ${getProductFragment(false)}
`;

export const getCollectionProductSlugsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $startCursor: String
  ) {
    collection(handle: $handle) {
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
  }
  ${productFragmentHandleOnly}
`;

export const getCollectionProductsCardQuery = /* GraphQL */ `
  query getCollectionProductsForCards(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $startCursor: String
  ) {
    collection(handle: $handle) {
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
  }
  ${productFragmentForCard}
`;
