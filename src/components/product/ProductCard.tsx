import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/utils";
import { Product } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addItem, isLoading } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.edges.length > 0) {
      const variant = product.variants.edges[0].node;
      await addItem(variant.id);
    }
  };

  const featuredImage = product.featuredImage?.url;
  const price = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;
  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isAvailable =
    product.availableForSale &&
    product.variants.edges.some((edge: any) => edge.node.availableForSale);

  return (
    <div className={`group relative ${className}`}>
      <Link href={`/products/${product.handle}` as any} className="block">
        {/* Product Image */}
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={product.featuredImage?.altText || product.title}
              fill
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sale
              </span>
            </div>
          )}

          {/* Quick Add Button */}
          {isAvailable && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-white p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add to cart"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4 flex justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900">
                {formatMoney(price)}
              </p>
              {isOnSale && compareAtPrice && (
                <p className="text-xs text-gray-500 line-through">
                  {formatMoney(compareAtPrice)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        {!isAvailable && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Out of stock
            </span>
          </div>
        )}

        {/* Product Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{product.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
