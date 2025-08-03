import imageFragment from './image';
import seoFragment from './seo';

export const getProductFragment = (admin: boolean) => {
  /* GraphQL */
  return `
    fragment product on Product {
      id
      ${admin ? 'status' : ''}
      handle
      ${admin ? '' : 'availableForSale'}
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      collections(first: 250) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            ${admin ? 'price' : 'price { amount currencyCode }'}
          }
        }
      }
      featuredImage {
        ...image
      }
      images(first: 20) {
        edges {
          node {
            ...image
          }
        }
      }
      seo {
        ...seo
      }
      tags
      brand: metafield(namespace: "custom", key: "brand_id") {
        value
      }
      refCode: metafield(namespace: "custom", key: "refCode") {
        value
      }
      productType
      updatedAt
    }
    ${imageFragment}
    ${seoFragment}
  `;
};

export const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    brand: metafield(namespace: "custom", key: "brand") {
      value
    }
    productType
    updatedAt
  }
  ${imageFragment}
  ${seoFragment}
`;

export const productFragmentForCard = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    title
    productType
    brand: metafield(namespace: "custom", key: "brand") {
      value
    }
    refCode: metafield(namespace: "custom", key: "refCode") {
      value
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }

    featuredImage {
      ...image
    }

    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
  ${imageFragment}
`;

export const productFragmentHandleOnly = /* GraphQL */ `
  fragment product on Product {
    handle
  }
`;
