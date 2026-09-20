import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
  /** Whether to apply the moving light shimmer effect (default true) */
  shimmer?: boolean;
}

/**
 * Componente genérico Skeleton que utiliza exclusivamente
 * los tokens de diseño y animación CSS shimmer de index.css
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style,
  shimmer = true,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`${shimmer ? "skeleton-shimmer" : "bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]"} rounded-[7px] ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton para la barra de filtros y búsqueda de materiales
 */
export const MaterialFilterBarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 w-full">
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {[110, 130, 120, 105, 95, 100].map((w, i) => (
          <Skeleton key={`filter-skel-${i}`} className="h-8 rounded-xl" style={{ width: `${w}px` }} />
        ))}
      </div>
      <Skeleton className="w-full sm:w-72 h-10 rounded-xl" />
    </div>
  );
};

/**
 * Skeleton específico de tarjeta de material en el catálogo,
 * reflejando la proporción exacta de imagen con lente de textura,
 * tags de categoría/modo, título, descripción y botones de acción.
 */
export const MaterialCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden flex flex-col justify-between p-0 shadow-none">
      <div>
        {/* Simulación del contenedor de textura con aspect ratio 4/3 */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-[var(--bg-surface-subtle)]">
          <Skeleton className="w-full h-full rounded-none border-0" />
          {/* Badge superior derecho */}
          <div className="absolute top-3 right-3 w-16 h-5">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          {/* Scrim inferior y datos de categoría/modo */}
          <div className="absolute bottom-3 left-3 right-3 space-y-1">
            <Skeleton className="w-24 h-3 rounded-[4px]" />
            <Skeleton className="w-40 h-5 rounded-[4px]" />
          </div>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="p-4 space-y-3">
          {/* Descripción corta de 2 líneas */}
          <div className="space-y-1.5">
            <Skeleton className="w-full h-3.5 rounded-[4px]" />
            <Skeleton className="w-4/5 h-3.5 rounded-[4px]" />
          </div>

          {/* Chips de aplicaciones recomendadas */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Skeleton className="w-14 h-5 rounded-md" />
            <Skeleton className="w-20 h-5 rounded-md" />
            <Skeleton className="w-16 h-5 rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer de acción y cotización rápida */}
      <div className="p-4 pt-0 border-t border-[var(--border-subtle)] mt-2 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="w-16 h-2.5 rounded-[4px]" />
          <Skeleton className="w-24 h-4 rounded-[4px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-20 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid de Skeletons de catálogo con conteo configurable
 */
export const CatalogSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <MaterialCardSkeleton key={`cat-skel-${i}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton para la vista de detalle de material (MaterialDetailView)
 */
export const MaterialDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-4 rounded-md" />
        <span className="text-[var(--text-muted)]">/</span>
        <Skeleton className="w-24 h-4 rounded-md" />
        <span className="text-[var(--text-muted)]">/</span>
        <Skeleton className="w-36 h-4 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Imagen y Lupa Macro */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] aspect-4/3 overflow-hidden p-2">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
            <div className="space-y-1.5 w-1/2">
              <Skeleton className="w-24 h-3 rounded-[4px]" />
              <Skeleton className="w-36 h-4 rounded-[4px]" />
            </div>
            <Skeleton className="w-28 h-9 rounded-xl" />
          </div>
        </div>

        {/* Columna Derecha: Especificaciones y Precios */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-8 rounded-lg" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="w-full h-3.5 rounded-[4px]" />
              <Skeleton className="w-full h-3.5 rounded-[4px]" />
              <Skeleton className="w-3/5 h-3.5 rounded-[4px]" />
            </div>
          </div>

          {/* Ficha técnica estructurada */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <Skeleton className="w-44 h-4 rounded-[4px]" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="w-16 h-3 rounded-[4px]" />
                  <Skeleton className="w-24 h-4 rounded-[4px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton para la tabla comparativa de rigidos y placas
 */
export const RigidsComparisonSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <Skeleton className="w-48 h-5 rounded-md" />
        <Skeleton className="w-28 h-4 rounded-md" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] gap-4">
            <Skeleton className="w-32 h-4 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-28 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const PortfolioCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between">
      <div>
        <div className="h-60 overflow-hidden relative">
          <Skeleton className="w-full h-full rounded-none border-0" />
          <div className="absolute top-3 right-3 w-20 h-5">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="w-24 h-3 rounded-md" />
          <Skeleton className="w-3/4 h-5 rounded-md" />
          <Skeleton className="w-1/2 h-3.5 rounded-md" />
        </div>
      </div>
      <div className="p-5 pt-0">
        <Skeleton className="w-full h-9 rounded-xl" />
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
          <div key={`bento-skel-${i}`} className="ideogram-card overflow-hidden flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="relative aspect-video @sm:aspect-square overflow-hidden bg-[var(--bg-surface-subtle)]">
              <Skeleton className="w-full h-full rounded-none border-0" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <Skeleton className="w-20 h-6 rounded-md" />
                <Skeleton className="w-16 h-6 rounded-md" />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/2 h-4 rounded-md" />
                <Skeleton className="w-1/4 h-3 rounded-md" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/3 h-3 rounded-md" />
                <Skeleton className="w-1/4 h-4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-28 h-5 rounded-full" />
          </div>
          <Skeleton className="w-36 h-3 rounded-md" />
        </div>
        <div className="space-y-1 sm:text-right">
          <Skeleton className="w-16 h-3 rounded-md sm:ml-auto" />
          <Skeleton className="w-28 h-6 rounded-md" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="w-32 h-3 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`step-skel-${i}`} className="h-10 rounded-xl" />
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
    <div className="space-y-3.5">
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
      <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
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
    <div className="space-y-3">
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
    <div className="space-y-2">
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

export const CotizadorSkeletonScreen: React.FC = () => {
  return (
    <div className="w-full max-w-[96rem] mx-auto px-[4%] pt-28 sm:pt-32 pb-36 space-y-8">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-6">
        <div className="space-y-2">
          <Skeleton className="w-36 h-3 rounded-[4px]" />
          <Skeleton className="w-64 h-7 rounded-[6px]" />
          <Skeleton className="w-80 h-3.5 rounded-[4px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="w-28 h-10 rounded-xl shrink-0" />
            ))}
          </div>
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <Skeleton className="w-48 h-5 rounded-[6px]" />
            <Skeleton className="w-full h-3 rounded-[4px]" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
              <Skeleton className="w-32 h-4 rounded-[4px]" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <QuoteLiveSummarySkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AiDesignPanelSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-6 sm:p-8 min-h-[220px] flex flex-col items-center justify-center space-y-4">
      <Skeleton className="w-36 h-5 rounded-full" />
      <Skeleton className="w-64 sm:w-80 h-8 rounded-lg" />
      <Skeleton className="w-48 sm:w-60 h-4 rounded-md" />
      <div className="w-full max-w-sm pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <Skeleton className="w-24 h-3 rounded-md" />
        <Skeleton className="w-28 h-3 rounded-md" />
      </div>
    </div>
  );
};
