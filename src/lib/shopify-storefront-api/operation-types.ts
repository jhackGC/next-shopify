// #################################### OPERATIONS ####################################

import {
  Connection,
  ConnectionWithPageInfo,
  Page,
  ShopifyBlogArticle,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
  ShopifyProductForCard,
  ShopifyProductFull,
} from "./types";

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: ConnectionWithPageInfo<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    startCursor?: string;
  };
};

export type ShopifyCollectionProductCardOperation = {
  data: {
    collection: {
      products: ConnectionWithPageInfo<ShopifyProductForCard>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    startCursor?: string;
  };
};

export type ShopifyCollectionProductSlugsOperation = {
  data: {
    collection: {
      slugs: ConnectionWithPageInfo<string[]>;
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyShopOperation = {
  data: {
    shop: any;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle?: string;
    identifier?: { id?: string; handle?: string };
  };
};

export type ShopifyProductUpdateOperation = {
  variables: {
    tagsCodes: string[];
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProductFull[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: ConnectionWithPageInfo<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

// export type BlogArticleDtoIsOperation = {
//   data: {
//     articles: Connection<BlogArticleDtoI>;
//   };
//   variables: {
//     query?: string;
//     reverse?: boolean;
//     sortKey?: string;
//   };
// };

export type ShopifySingleBlogArticleOperation = {
  data: {
    blog: { articleByHandle: Connection<ShopifyBlogArticle> };
  };
  variables: {
    blogHandle?: string;
    handle?: string;
  };
};
