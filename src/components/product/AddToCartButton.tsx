"use client";

import { useCart } from "@/contexts/CartContext";
import type { ProductVariant } from "@/types/shopify";
import { useState } from "react";

interface AddToCartButtonProps {
  variant: ProductVariant;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  variant,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart([
        {
          merchandiseId: variant.id,
          quantity: 1,
        },
      ]);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // You could add an error toast here
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`
        w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium
        hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200 flex items-center justify-center
        ${className}
      `}
    >
      {isAdding ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Adding...
        </>
      ) : disabled ? (
        "Out of Stock"
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
