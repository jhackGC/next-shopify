import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionByHandle } from "@/lib/server-shopify";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{
    handle: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: collection.title,
    description:
      collection.description || `Shop the ${collection.title} collection`,
    openGraph: {
      title: collection.title,
      description:
        collection.description || `Shop the ${collection.title} collection`,
      images: collection.image ? [collection.image.url] : [],
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products?.edges.map((edge) => edge.node) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Header */}
        <div className="mb-12">
          {collection.image && (
            <div className="relative h-64 md:h-80 lg:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    {collection.title}
                  </h1>
                  {collection.description && (
                    <p className="text-lg md:text-xl max-w-2xl">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!collection.image && (
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>

            {/* Filter/Sort controls could go here */}
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="best-selling">Best Selling</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              This collection doesn't have any products yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
