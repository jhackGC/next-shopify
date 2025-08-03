import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatMoney } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "../../../lib/shopify-storefront/server-shopify-storefront-api";

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title} at our store`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title} at our store`,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  console.log("### Product data:", product);

  const firstVariant = product.variants.edges[0]?.node;
  const hasMultipleVariants = product.variants.edges.length > 1;

  const showProductImages = false; // fix css

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Images */}
          {showProductImages && (
            <div className="mb-8 lg:mb-0">
              <div className="aspect-w-1 aspect-h-1 w-full">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    fill
                    className="object-cover object-center rounded-lg"
                    priority
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              {product.images.edges.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {product.images.edges.slice(1, 5).map((edge) => (
                    <div key={edge.node.id} className="aspect-w-1 aspect-h-1">
                      <Image
                        src={edge.node.url}
                        alt={edge.node.altText || product.title}
                        fill
                        className="object-cover object-center rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {product.vendor && (
                <p className="text-sm text-gray-600 mb-4">
                  by {product.vendor}
                </p>
              )}

              {/* Price */}
              <div className="mb-6">
                {firstVariant && (
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatMoney(firstVariant.price)}
                    </span>
                    {firstVariant.compareAtPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        {formatMoney(firstVariant.compareAtPrice)}
                      </span>
                    )}
                  </div>
                )}

                {!hasMultipleVariants && firstVariant && (
                  <p className="text-sm text-gray-600 mt-2">
                    {firstVariant.availableForSale
                      ? `In stock${
                          firstVariant.quantityAvailable
                            ? ` (${firstVariant.quantityAvailable} available)`
                            : ""
                        }`
                      : "Out of stock"}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Description
                  </h3>
                  <div className="prose prose-sm text-gray-600">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Variants */}
              {hasMultipleVariants && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Options
                  </h3>
                  <div className="space-y-4">
                    {product.variants.edges.map((edge) => (
                      <div key={edge.node.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{edge.node.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatMoney(edge.node.price)}
                              {edge.node.compareAtPrice && (
                                <span className="ml-2 line-through text-gray-500">
                                  {formatMoney(edge.node.compareAtPrice)}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {edge.node.availableForSale
                                ? `In stock${
                                    edge.node.quantityAvailable
                                      ? ` (${edge.node.quantityAvailable} available)`
                                      : ""
                                  }`
                                : "Out of stock"}
                            </p>
                          </div>
                          <AddToCartButton
                            variant={edge.node}
                            disabled={!edge.node.availableForSale}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart - Single Variant */}
              {!hasMultipleVariants && firstVariant && (
                <AddToCartButton
                  variant={firstVariant}
                  disabled={!firstVariant.availableForSale}
                />
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
