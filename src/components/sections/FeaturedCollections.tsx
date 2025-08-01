"use client";

import { CollectionGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { fetchCollections } from "@/lib/server-proxied-shopify";
import { getCollectionUrl } from "@/lib/utils";
import type { Collection } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FeaturedCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollectionsData() {
      try {
        const collections = await fetchCollections({ first: 6 }); // Get 6 featured collections
        setCollections(collections);
      } catch (err) {
        setError("Failed to load collections");
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollectionsData();
  }, []);

  if (loading) {
    return <CollectionGridSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No collections found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={getCollectionUrl(collection.handle)}
          className="group card overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Collection Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {collection.image ? (
              <Image
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                fill
                className="image-optimize"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>

          {/* Collection Info */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {collection.title}
            </h3>
            {collection.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {collection.description}
              </p>
            )}
            <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-500">
              Shop Collection
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
