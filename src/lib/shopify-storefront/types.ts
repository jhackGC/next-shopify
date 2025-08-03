export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type ConnectionWithPageInfo<T> = {
  edges: Array<Edge<T>>;
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
  };
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, 'lines'> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = ShopifyCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type CollectionImage = {
  src: string;
};

export type Menu = {
  title: string;
  path: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type ShopifyProductFull = Omit<ShopifyProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
  collections: ShopifyCollection[];
  brand?: string; // brand code, unique identifier for the brand
  status?: string;
  refCode?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  id?: string;
  handle?: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  seo?: SEO;
  updatedAt?: string;
  image?: CollectionImage;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  productType: string;
  collections: Connection<ShopifyCollection>;
  brand?: { value: string };
  status?: string;
  refCode?: { value: string };
};

export type ShopifyProductForCard = {
  id: string;
  handle: string;
  title: string;
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  featuredImage: Image;
};

export type ShopifyCategory = {
  title: string;
};

export type ShopifyBlogArticle = {
  handle: string; // Article handle (likely used in URLs)
  title: string; // Article title
  excerpt: string; // Article excerpt or summary
  contentHtml: string; // Article content in HTML
  tags: string[]; // List of tags associated with the article
  seo: {
    title: string; // SEO title for the article
    description: string; // SEO description for the article
  };
  image: {
    altText: string | null; // Alt text for the image
    id: string; // Image ID
    originalSrc: string; // URL of the original image source
  } | null; // Image can be null if not available
  publishedAt: string; // Date the article was published
};
