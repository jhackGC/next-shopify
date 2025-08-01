"use client";

import { cartManager } from "@/lib/cart";
import type { Cart, CartLineInput } from "@/types/shopify";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  totalQuantity: number;
  isEmpty: boolean;
  checkoutUrl: string | null;
  addToCart: (lines: CartLineInput[]) => Promise<Cart | null>;
  addItem: (merchandiseId: string, quantity?: number) => Promise<Cart | null>;
  updateLineQuantity: (
    lineId: string,
    quantity: number
  ) => Promise<Cart | null>;
  removeItem: (lineId: string) => Promise<Cart | null>;
  removeFromCart: (lineIds: string[]) => Promise<Cart | null>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<Cart | null>;
  isInCart: (merchandiseId: string) => boolean;
  getItemQuantity: (merchandiseId: string) => number;
  getCartLine: (merchandiseId: string) => any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to cart changes
    const unsubscribe = cartManager.subscribe(setCart);

    // Initialize cart on mount
    const initializeCart = async () => {
      setIsLoading(true);
      await cartManager.initialize();
      setIsLoading(false);
    };

    initializeCart();

    return unsubscribe;
  }, []);

  const addToCart = async (lines: CartLineInput[]): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const result = await cartManager.addToCart(lines);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (
    merchandiseId: string,
    quantity: number = 1
  ): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const lines: CartLineInput[] = [{ merchandiseId, quantity }];
      const result = await cartManager.addToCart(lines);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLineQuantity = async (
    lineId: string,
    quantity: number
  ): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const result = await cartManager.updateCartLine(lineId, quantity);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (lineId: string): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const result = await cartManager.removeSingleItem(lineId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (lineIds: string[]): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const result = await cartManager.removeFromCart(lineIds);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await cartManager.clearCart();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async (): Promise<Cart | null> => {
    setIsLoading(true);
    try {
      const result = await cartManager.refreshCart();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: CartContextType = {
    cart,
    isLoading,
    totalQuantity: cartManager.getTotalQuantity(),
    isEmpty: cartManager.isEmpty(),
    checkoutUrl: cartManager.getCheckoutUrl(),
    addToCart,
    addItem,
    updateLineQuantity,
    removeItem,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart: cartManager.isVariantInCart.bind(cartManager),
    getItemQuantity: cartManager.getVariantQuantity.bind(cartManager),
    getCartLine: cartManager.getLineItem.bind(cartManager),
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

// Hook for optimistic updates
export function useCartOptimistic() {
  const cart = useCart();
  const [optimisticCart, setOptimisticCart] = useState<Cart | null>(null);

  useEffect(() => {
    if (!cart.isLoading) {
      setOptimisticCart(cart.cart);
    }
  }, [cart.cart, cart.isLoading]);

  const addItemOptimistic = async (
    merchandiseId: string,
    quantity: number = 1
  ) => {
    // Optimistically update UI
    if (optimisticCart) {
      const newQuantity = cart.getItemQuantity(merchandiseId) + quantity;
      // Update optimistic state here
    }

    try {
      await cart.addItem(merchandiseId, quantity);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticCart(cart.cart);
      throw error;
    }
  };

  return {
    ...cart,
    cart: optimisticCart,
    addItem: addItemOptimistic,
  };
}
