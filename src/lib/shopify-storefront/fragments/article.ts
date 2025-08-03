import imageFragment from './image';
import seoFragment from './seo';

const articleFragment = /* GraphQL */ `
  fragment article on Article {
    id
    handle
    title
    tags
    updatedAt
    excerpt
    contentHtml
    tags
    ...seo
    ...image
  }
  ${imageFragment}
  ${seoFragment}
`;

export default articleFragment;
