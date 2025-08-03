// Shopify Storefront API Types
export interface Shop {
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor?: string;
  tags: string[];
  featuredImage?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  compareAtPriceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price: MoneyV2;
  compareAtPrice?: MoneyV2;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

// Cart Types
export interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: MoneyV2;
    subtotalAmount: MoneyV2;
    totalTaxAmount?: MoneyV2;
    totalDutyAmount?: MoneyV2;
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: MoneyV2;
    amountPerQuantity: MoneyV2;
    compareAtAmountPerQuantity?: MoneyV2;
  };
  merchandise: ProductVariant & {
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
}

export interface CartInput {
  lines: CartLineInput[];
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

// Customer Account API Types
export interface CustomerEmailAddress {
  emailAddress?: string;
  marketingState: EmailMarketingState;
}

export interface CustomerPhoneNumber {
  phoneNumber: string;
  marketingState: SmsMarketingState;
}

export enum EmailMarketingState {
  SUBSCRIBED = "SUBSCRIBED",
  UNSUBSCRIBED = "UNSUBSCRIBED",
  NOT_SUBSCRIBED = "NOT_SUBSCRIBED",
  PENDING = "PENDING",
  REDACTED = "REDACTED",
}

export enum SmsMarketingState {
  SUBSCRIBED = "SUBSCRIBED",
  UNSUBSCRIBED = "UNSUBSCRIBED",
  NOT_SUBSCRIBED = "NOT_SUBSCRIBED",
  PENDING = "PENDING",
  REDACTED = "REDACTED",
}

// Customer Types (using new Customer Account API)
export interface Customer {
  id: string;
  emailAddress?: CustomerEmailAddress;
  firstName?: string;
  lastName?: string;
  displayName: string;
  phoneNumber?: CustomerPhoneNumber;
  creationDate: string; // Note: this is creationDate, not createdAt in Customer Account API
  imageUrl: string;
  tags: string[];
  defaultAddress?: CustomerAddress;
  addresses: {
    edges: Array<{
      node: CustomerAddress;
    }>;
  };
  orders: {
    edges: Array<{
      node: Order;
    }>;
  };
}

// Simplified Customer interface for easier use in your app
export interface SimpleCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  phone?: string;
  createdAt: string;
  imageUrl?: string;
  tags?: string[];
}

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  countryCodeV2: string;
  province?: string;
  provinceCode?: string;
  zip: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: MoneyV2;
  subtotalPrice: MoneyV2;
  totalTax: MoneyV2;
  totalShippingPrice: MoneyV2;
  lineItems: {
    edges: Array<{
      node: OrderLineItem;
    }>;
  };
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  variant?: ProductVariant;
  originalTotalPrice: MoneyV2;
  discountedTotalPrice: MoneyV2;
}

// Authentication Types
export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerAuthState {
  isAuthenticated: boolean;
  customer?: Customer;
  accessToken?: string;
  isLoading: boolean;
  error?: string;
}

// API Response Types
export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

// Search and Filter Types
export interface ProductFilters {
  query?: string;
  collection?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  available?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortKey?: ProductSortKeys;
  reverse?: boolean;
}

export enum ProductSortKeys {
  BEST_SELLING = "BEST_SELLING",
  CREATED_AT = "CREATED_AT",
  ID = "ID",
  PRICE = "PRICE",
  PRODUCT_TYPE = "PRODUCT_TYPE",
  RELEVANCE = "RELEVANCE",
  TITLE = "TITLE",
  UPDATED_AT = "UPDATED_AT",
  VENDOR = "VENDOR",
}

// Utility Types
export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PaginationInfo;
}

// Error Types
export interface ShopifyError {
  message: string;
  field?: string[];
  code?: string;
}

export interface FormError {
  field: string;
  message: string;
}

// Utility function to convert Customer Account API response to simplified format
export function toSimpleCustomer(customer: Customer): SimpleCustomer {
  return {
    id: customer.id,
    email: customer.emailAddress?.emailAddress || "",
    firstName: customer.firstName,
    lastName: customer.lastName,
    displayName: customer.displayName,
    phone: customer.phoneNumber?.phoneNumber,
    createdAt: customer.creationDate,
    imageUrl: customer.imageUrl,
    tags: customer.tags,
  };
}
