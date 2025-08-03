import Image from "next/image";
import Link from "next/link";
import { getFeaturedCollections } from "../../lib/shopify-storefront/server-shopify-storefront-api";

// Helper function to format price
function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export default async function FeaturedCollections() {
  const collections = await getFeaturedCollections(6);

  if (collections.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Shop by Collection
            </h2>
            <p className="text-gray-600">
              No collections available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop by Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections to find exactly what you're looking
            for
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                {collection.image ? (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-200 transition-colors">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-sm opacity-90 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                {collection.products?.edges &&
                  collection.products.edges.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm opacity-75">
                        {collection.products.edges.length} products
                      </span>
                      {collection.products.edges[0]?.node?.priceRange
                        ?.minVariantPrice && (
                        <span className="text-sm font-medium">
                          From{" "}
                          {formatPrice(
                            parseFloat(
                              collection.products.edges[0].node.priceRange
                                .minVariantPrice.amount
                            ),
                            collection.products.edges[0].node.priceRange
                              .minVariantPrice.currencyCode
                          )}
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
