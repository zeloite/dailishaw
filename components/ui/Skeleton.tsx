export function SkeletonLine() {
  return (
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-skeleton-loading" />
  );
}

export function SkeletonText() {
  return (
    <div className="space-y-2">
      <SkeletonLine />
      <SkeletonLine />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-skeleton-loading w-5/6" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm space-y-4">
      <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-skeleton-loading" />
      <SkeletonText />
      <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded animate-skeleton-loading" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-800 rounded-lg p-4 h-12 animate-skeleton-loading"
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ cols = 3 }: { cols?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {[...Array(cols)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCategory() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProduct() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonImageGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return (
    <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded animate-skeleton-loading" />
  );
}
