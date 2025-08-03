import articleFragment from '../fragments/article';

export const getArticlesQueryNew = /* GraphQL */ `
  query getArticles() {
    article(first: 250) {
     edges {
        node {
          ...article
        }
      }
    }
  }
  ${articleFragment}
`;

export const getArticlesQuery = /* GraphQL */ `
  query getArticles {
    articles(first: 250) {
      edges {
        cursor
        node {
          handle
          title
          excerpt
          contentHtml
          handle
          tags
          seo {
            title
            description
          }
          publishedAt
          authorV2 {
            firstName
            bio
          }
          image {
            altText
            id
            originalSrc
          }
        }
      }
    }
  }
`;

export const getBlogArticleByHandleQuery = /* GraphQL */ `
  query getArticleByHandle($handle: String!, $blogHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $handle) {
        handle
        title
        contentHtml
        publishedAt
        excerpt
        tags
        seo {
          title
          description
        }
        image {
          altText
          id
          originalSrc
        }
      }
    }
  }
`;
