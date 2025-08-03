import { QuickAddButton } from "@/components/product/QuickAddButton";
import { formatMoney } from "@/lib/utils";
import { Product } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const featuredImage = product.featuredImage?.url;
  const price = product.priceRange?.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;
  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isAvailable =
    product.availableForSale &&
    product.variants.edges.some((edge: any) => edge.node.availableForSale);

  // Get the first available variant for the add to cart button
  const firstVariant =
    product.variants.edges.length > 0 ? product.variants.edges[0].node : null;

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
          {isAvailable && firstVariant && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <QuickAddButton
                variantId={firstVariant.id}
                disabled={!isAvailable}
              />
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
