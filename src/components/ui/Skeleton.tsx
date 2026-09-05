import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente genérico Skeleton que utiliza exclusivamente
 * los tokens de color definidos en :root y .dark de index.css
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-[7px] ${className}`}
      {...props}
    />
  );
};

export const MaterialCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-[7px] flex flex-col justify-between space-y-4 overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* Image Skeleton */}
      <div className="relative h-44 w-full overflow-hidden rounded-[7px]">
        <Skeleton className="w-full h-full rounded-[7px]" />
        <div className="absolute top-2.5 right-2.5 w-20 h-5">
          <Skeleton className="w-full h-full rounded-[7px]" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-3 rounded-[7px]" />
            <Skeleton className="w-12 h-3 rounded-[7px]" />
          </div>
          <Skeleton className="w-3/4 h-5 rounded-[7px]" />
        </div>

        <div className="space-y-1">
          <Skeleton className="w-full h-3 rounded-[7px]" />
          <Skeleton className="w-5/6 h-3 rounded-[7px]" />
        </div>

        {/* Feature Tags Skeleton */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="w-16 h-5 rounded-[7px]" />
          <Skeleton className="w-20 h-5 rounded-[7px]" />
          <Skeleton className="w-14 h-5 rounded-[7px]" />
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2">
        <Skeleton className="w-full h-8 rounded-[7px]" />
        <Skeleton className="w-full h-8 rounded-[7px]" />
      </div>
    </div>
  );
};

export const CatalogSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MaterialCardSkeleton key={`cat-skel-${i}`} />
      ))}
    </div>
  );
};

export const PortfolioCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-[7px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between">
      <div>
        <div className="h-60 overflow-hidden relative">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute top-3 right-3 w-20 h-5">
            <Skeleton className="w-full h-full rounded-[7px]" />
          </div>
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="w-24 h-3 rounded-[7px]" />
          <Skeleton className="w-3/4 h-5 rounded-[7px]" />
          <Skeleton className="w-1/2 h-3.5 rounded-[7px]" />
        </div>
      </div>
      <div className="p-5 pt-0">
        <Skeleton className="w-full h-9 rounded-[7px]" />
      </div>
    </div>
  );
};

export const PortfolioSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PortfolioCardSkeleton key={`port-skel-${i}`} />
      ))}
    </div>
  );
};

export const BentoGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] @md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={`bento-skel-${i}`} className="ideogram-card overflow-hidden flex flex-col justify-between rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="relative aspect-video @sm:aspect-square overflow-hidden bg-[var(--bg-surface-subtle)]">
              <Skeleton className="w-full h-full rounded-none" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <Skeleton className="w-20 h-6 rounded-[7px]" />
                <Skeleton className="w-16 h-6 rounded-[7px]" />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/2 h-4 rounded-[7px]" />
                <Skeleton className="w-1/4 h-3 rounded-[7px]" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/3 h-3 rounded-[7px]" />
                <Skeleton className="w-1/4 h-4 rounded-[7px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MaterialDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-12 h-4 rounded-[7px]" />
        <Skeleton className="w-3 h-3 rounded-[7px]" />
        <Skeleton className="w-16 h-4 rounded-[7px]" />
        <Skeleton className="w-3 h-3 rounded-[7px]" />
        <Skeleton className="w-32 h-4 rounded-[7px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-2 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] aspect-4/3 overflow-hidden">
            <Skeleton className="w-full h-full rounded-[7px]" />
          </div>
          <div className="p-4 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
            <div className="space-y-1.5 w-1/2">
              <Skeleton className="w-24 h-3 rounded-[7px]" />
              <Skeleton className="w-36 h-4 rounded-[7px]" />
            </div>
            <Skeleton className="w-28 h-9 rounded-[7px]" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <Skeleton className="w-28 h-3.5 rounded-[7px]" />
            <Skeleton className="w-3/4 h-8 rounded-[7px]" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="w-full h-4 rounded-[7px]" />
              <Skeleton className="w-full h-4 rounded-[7px]" />
              <Skeleton className="w-4/5 h-4 rounded-[7px]" />
            </div>
          </div>

          {/* Specs Box Skeleton */}
          <div className="p-5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <Skeleton className="w-44 h-4 rounded-[7px] pb-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="w-16 h-3 rounded-[7px]" />
                <Skeleton className="w-24 h-4 rounded-[7px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-3 rounded-[7px]" />
                <Skeleton className="w-24 h-4 rounded-[7px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-3 rounded-[7px]" />
                <Skeleton className="w-24 h-4 rounded-[7px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-3 rounded-[7px]" />
                <Skeleton className="w-24 h-4 rounded-[7px]" />
              </div>
            </div>
          </div>

          {/* Recommended Uses Skeleton */}
          <div className="p-5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <Skeleton className="w-40 h-4 rounded-[7px]" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="w-full h-6 rounded-[7px]" />
              <Skeleton className="w-full h-6 rounded-[7px]" />
              <Skeleton className="w-full h-6 rounded-[7px]" />
              <Skeleton className="w-full h-6 rounded-[7px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-4 rounded-[7px]" />
            <Skeleton className="w-20 h-5 rounded-[7px]" />
            <Skeleton className="w-28 h-5 rounded-[7px]" />
          </div>
          <Skeleton className="w-36 h-3 rounded-[7px]" />
        </div>
        <div className="space-y-1 sm:text-right">
          <Skeleton className="w-16 h-3 rounded-[7px] sm:ml-auto" />
          <Skeleton className="w-28 h-6 rounded-[7px]" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="w-32 h-3 rounded-[7px]" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`step-skel-${i}`} className="h-10 rounded-[7px]" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const OrdersListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={`ord-skel-${i}`} />
      ))}
    </div>
  );
};

export const QuotePriceSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-1">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-3 rounded-[6px]" />
        <Skeleton className="w-10 h-3 rounded-[6px]" />
      </div>
      <Skeleton className="w-36 h-9 rounded-[8px]" />
      <Skeleton className="w-28 h-3 rounded-[6px]" />
    </div>
  );
};

export const QuoteLiveSummarySkeleton: React.FC = () => {
  return (
    <div className="space-y-3.5 animate-pulse">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <Skeleton className="w-28 h-3.5 rounded-[6px]" />
          <Skeleton className="w-36 h-2.5 rounded-[6px]" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="w-16 h-3 rounded-[6px]" />
          <Skeleton className="w-28 h-3.5 rounded-[6px]" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-20 h-3 rounded-[6px]" />
          <Skeleton className="w-24 h-3.5 rounded-[6px]" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-14 h-3 rounded-[6px]" />
          <Skeleton className="w-16 h-3.5 rounded-[6px]" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-3 rounded-[6px]" />
          <Skeleton className="w-18 h-3.5 rounded-[6px]" />
        </div>
      </div>

      {/* Main price box skeleton */}
      <div className="p-4 rounded-[12px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-3 rounded-[6px]" />
          <Skeleton className="w-10 h-3 rounded-[6px]" />
        </div>
        <Skeleton className="w-44 h-8 rounded-[8px]" />
        <Skeleton className="w-32 h-2.5 rounded-[6px]" />
      </div>
    </div>
  );
};

export const BulkCalculationSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`bulk-skel-${i}`}
          className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-28 h-4 rounded-[6px]" />
            </div>
            <Skeleton className="w-16 h-4 rounded-[6px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-9 w-full rounded-[8px]" />
            <Skeleton className="h-9 w-full rounded-[8px]" />
            <Skeleton className="h-9 w-full rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const QuoteTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`tbl-skel-${i}`}
          className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] gap-4"
        >
          <div className="flex items-center gap-3 w-1/3">
            <Skeleton className="w-12 h-3.5 rounded-[4px]" />
            <Skeleton className="w-24 h-3.5 rounded-[4px]" />
          </div>
          <Skeleton className="w-16 h-3.5 rounded-[4px]" />
          <Skeleton className="w-12 h-3.5 rounded-[4px]" />
          <Skeleton className="w-20 h-4 rounded-[6px]" />
        </div>
      ))}
    </div>
  );
};

export const AiDesignPanelSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-4 rounded-[6px]" />
        <Skeleton className="w-8 h-8 rounded-[8px]" />
      </div>
      <Skeleton className="w-full aspect-video rounded-[12px]" />
      <div className="space-y-2">
        <Skeleton className="w-full h-8 rounded-[8px]" />
        <Skeleton className="w-full h-8 rounded-[8px]" />
      </div>
    </div>
  );
};



