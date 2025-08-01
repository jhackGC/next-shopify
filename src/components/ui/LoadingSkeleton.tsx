import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  type?: "product" | "card" | "text" | "image";
}

export function LoadingSkeleton({
  className,
  count = 1,
  type = "card",
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <SkeletonItem key={i} type={type} />
  ));

  return (
    <div className={cn("animate-pulse", className)}>
      {count > 1 ? skeletons : <SkeletonItem type={type} />}
    </div>
  );
}

function SkeletonItem({
  type,
}: {
  type: "product" | "card" | "text" | "image";
}) {
  switch (type) {
    case "product":
      return (
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      );

    case "card":
      return (
        <div className="p-6 border rounded-lg space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      );

    case "image":
      return <div className="w-full h-48 bg-gray-200 rounded-lg" />;

    default:
      return <div className="h-4 bg-gray-200 rounded" />;
  }
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton key={i} type="product" />
      ))}
    </div>
  );
}

// Collection grid skeleton
export function CollectionGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
