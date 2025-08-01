import type { MoneyV2 } from "@/types/shopify";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format money values for display
 */
export function formatMoney(
  money: MoneyV2,
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    return new Intl.NumberFormat("en-US", formatOptions).format(
      parseFloat(money.amount)
    );
  } catch (error) {
    console.error("Error formatting money:", error);
    return `${money.currencyCode} ${money.amount}`;
  }
}

/**
 * Format money as a compact string (e.g., $1.2K)
 */
export function formatMoneyCompact(money: MoneyV2): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(parseFloat(money.amount));
  } catch (error) {
    return formatMoney(money);
  }
}

/**
 * Calculate percentage discount
 */
export function calculateDiscountPercentage(
  originalPrice: MoneyV2,
  salePrice: MoneyV2
): number {
  const original = parseFloat(originalPrice.amount);
  const sale = parseFloat(salePrice.amount);

  if (original <= 0 || sale >= original) return 0;

  return Math.round(((original - sale) / original) * 100);
}

/**
 * Check if a product is on sale
 */
export function isProductOnSale(
  price: MoneyV2,
  compareAtPrice?: MoneyV2
): boolean {
  if (!compareAtPrice) return false;

  const priceAmount = parseFloat(price.amount);
  const compareAmount = parseFloat(compareAtPrice.amount);

  return compareAmount > priceAmount;
}

/**
 * Generate product URL
 */
export function getProductUrl(handle: string): string {
  return `/products/${handle}`;
}

/**
 * Generate collection URL
 */
export function getCollectionUrl(handle: string): string {
  return `/collections/${handle}`;
}

/**
 * Extract Shopify ID from GraphQL Global ID
 */
export function extractShopifyId(gid: string): string {
  return gid.split("/").pop() || gid;
}

/**
 * Create Shopify GraphQL Global ID
 */
export function createShopifyGid(resource: string, id: string): string {
  return `gid://shopify/${resource}/${id}`;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Format date for display
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    return new Intl.DateTimeFormat("en-US", formatOptions).format(
      new Date(dateString)
    );
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  } catch (error) {
    return formatDate(dateString);
  }
}

/**
 * Slugify a string for URL usage
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate random string for nonce/state parameters
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Create base64 URL-safe encoding
 */
export function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decode base64 URL-safe string
 */
export function base64UrlDecode(str: string): string {
  // Add padding if needed
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + padding;

  try {
    return atob(base64);
  } catch (error) {
    console.error("Error decoding base64:", error);
    return "";
  }
}

/**
 * Check if code is running on the client side
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if code is running on the server side
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Safe JSON parsing
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Generate SEO-friendly meta title
 */
export function generateMetaTitle(
  title: string,
  siteName: string = "Shop"
): string {
  return title ? `${title} | ${siteName}` : siteName;
}

/**
 * Generate SEO-friendly meta description
 */
export function generateMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (!description) return "";
  return truncateText(description.replace(/\n/g, " "), maxLength);
}

/**
 * Calculate cart total quantity
 */
export function calculateCartQuantity(
  lines: Array<{ quantity: number }>
): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
