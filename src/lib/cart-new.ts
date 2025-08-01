import type {
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
} from "@/types/shopify";
import Cookies from "js-cookie";
import {
  SHOPIFY_CONFIG,
  addToCart as addToCartAPI,
  createCart,
  fetchCart,
  handleApiError,
  removeFromCart as removeFromCartAPI,
  updateCartLines,
} from "./server-proxied-shopify";
import { isClient } from "./utils";

/**
 * Cart Management System
 * Handles all cart operations using server-proxied Shopify Storefront API
 */
export class CartManager {
  private static instance: CartManager;
  private cart: Cart | null = null;
  private listeners: Array<(cart: Cart | null) => void> = [];
  private isLoading = false;

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  /**
   * Subscribe to cart changes
   */
  subscribe(listener: (cart: Cart | null) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of cart changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.cart));
  }

  /**
   * Update cart and notify listeners
   */
  private updateCart(cart: Cart | null): void {
    this.cart = cart;
    this.notifyListeners();
  }

  /**
   * Initialize cart on app start
   */
  async initialize(): Promise<void> {
    if (!isClient() || this.isLoading) return;

    this.isLoading = true;

    try {
      const cartId = this.getStoredCartId();

      if (cartId) {
        const cart = await fetchCart(cartId);
        this.updateCart(cart);
      }
    } catch (error) {
      console.error("Cart initialization error:", error);
      // Clear invalid cart ID
      this.clearStoredCartId();
    }

    this.isLoading = false;
  }

  /**
   * Get current cart
   */
  getCart(): Cart | null {
    return this.cart;
  }

  /**
   * Get cart total quantity
   */
  getTotalQuantity(): number {
    return this.cart?.totalQuantity || 0;
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.getTotalQuantity() === 0;
  }

  /**
   * Get stored cart ID from cookies
   */
  private getStoredCartId(): string | null {
    if (!isClient()) return null;

    return Cookies.get(SHOPIFY_CONFIG.cartCookieName) || null;
  }

  /**
   * Store cart ID in cookies
   */
  private storeCartId(cartId: string): void {
    if (!isClient()) return;

    Cookies.set(SHOPIFY_CONFIG.cartCookieName, cartId, {
      expires: SHOPIFY_CONFIG.cartCookieMaxAge / (24 * 60 * 60), // Convert seconds to days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }

  /**
   * Clear stored cart ID
   */
  private clearStoredCartId(): void {
    if (!isClient()) return;

    Cookies.remove(SHOPIFY_CONFIG.cartCookieName);
  }

  /**
   * Create new cart
   */
  async createNewCart(input?: CartInput): Promise<Cart | null> {
    try {
      const lines = input?.lines || [];
      const cart = await createCart(lines);

      if (cart?.id) {
        this.storeCartId(cart.id);
        this.updateCart(cart);
      }

      return cart;
    } catch (error) {
      console.error("Failed to create cart:", error);
      throw new Error(`Failed to create cart: ${handleApiError(error)}`);
    }
  }

  /**
   * Add items to cart
   */
  async addToCart(lines: CartLineInput[]): Promise<Cart | null> {
    try {
      let cartId = this.getStoredCartId();

      // Create cart if none exists
      if (!cartId) {
        const newCart = await this.createNewCart({ lines });
        return newCart;
      }

      const cart = await addToCartAPI(cartId, lines);

      if (cart) {
        this.updateCart(cart);
      }

      return cart;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw new Error(`Failed to add to cart: ${handleApiError(error)}`);
    }
  }

  /**
   * Update cart line quantities
   */
  async updateCartLine(lineId: string, quantity: number): Promise<Cart | null> {
    try {
      const cartId = this.getStoredCartId();
      if (!cartId) {
        throw new Error("No cart found");
      }

      const lines: CartLineUpdateInput[] = [
        {
          id: lineId,
          quantity,
        },
      ];

      const cart = await updateCartLines(cartId, lines);

      if (cart) {
        this.updateCart(cart);
      }

      return cart;
    } catch (error) {
      console.error("Failed to update cart:", error);
      throw new Error(`Failed to update cart: ${handleApiError(error)}`);
    }
  }

  /**
   * Remove items from cart
   */
  async removeFromCart(lineIds: string[]): Promise<Cart | null> {
    try {
      const cartId = this.getStoredCartId();
      if (!cartId) {
        throw new Error("No cart found");
      }

      const cart = await removeFromCartAPI(cartId, lineIds);

      if (cart) {
        this.updateCart(cart);
      }

      return cart;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw new Error(`Failed to remove from cart: ${handleApiError(error)}`);
    }
  }

  /**
   * Remove single item from cart
   */
  async removeSingleItem(lineId: string): Promise<Cart | null> {
    return this.removeFromCart([lineId]);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      this.clearStoredCartId();
      this.updateCart(null);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }

  /**
   * Refresh cart from Shopify
   */
  async refreshCart(): Promise<Cart | null> {
    try {
      const cartId = this.getStoredCartId();
      if (!cartId) {
        return null;
      }

      const cart = await fetchCart(cartId);
      this.updateCart(cart);
      return cart;
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      // Clear invalid cart
      this.clearStoredCartId();
      this.updateCart(null);
      return null;
    }
  }

  /**
   * Get line item from cart by variant ID
   */
  getLineItem(variantId: string): any {
    if (!this.cart?.lines?.edges) return null;

    return this.cart.lines.edges.find((edge) => {
      const merchandise = edge.node.merchandise;
      return merchandise.id === variantId;
    });
  }

  /**
   * Check if variant is in cart
   */
  isVariantInCart(variantId: string): boolean {
    return !!this.getLineItem(variantId);
  }

  /**
   * Get quantity of specific variant in cart
   */
  getVariantQuantity(variantId: string): number {
    const lineItem = this.getLineItem(variantId);
    return lineItem?.node?.quantity || 0;
  }

  /**
   * Get cart checkout URL
   */
  getCheckoutUrl(): string | null {
    return this.cart?.checkoutUrl || null;
  }
}

// Export singleton instance
export const cartManager = CartManager.getInstance();

// Convenience functions for easy usage
export const useCartManager = () => cartManager;
