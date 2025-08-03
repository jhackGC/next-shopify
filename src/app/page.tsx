import FeaturedCollections from "@/components/sections/FeaturedCollections";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { HeroSection } from "@/components/sections/HeroSection";
import { Newsletter } from "@/components/sections/Newsletter";
import { Suspense } from "react";

// Enhanced loading components for better UX
function ProductsLoading() {
  return (
    <div className="container">
      <div className="mb-12 text-center">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionsLoading() {
  return (
    <div className="container">
      <div className="mb-12 text-center">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-lg h-80 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products - Server Side Rendered */}
      <Suspense fallback={<ProductsLoading />}>
        <FeaturedProducts />
      </Suspense>

      {/* Featured Collections - Server Side Rendered */}
      <Suspense fallback={<CollectionsLoading />}>
        <FeaturedCollections />
      </Suspense>

      {/* Newsletter Signup */}
      <Newsletter />
    </div>
  );
}
