import React from "react";
import { DESIGN_TOKENS, calcInnerRadius, getThemeColors, DesignTokensType } from "../../constants/designTokens";
import { useThemeStore } from "../../store/useThemeStore";

export { DESIGN_TOKENS, calcInnerRadius, getThemeColors };
export type { DesignTokensType };

/**
 * Hook para consumir los tokens de diseño activos y resueltos según el tema actual
 */
export function useDesignTokens() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const activeColors = getThemeColors(isDark);

  return {
    tokens: DESIGN_TOKENS,
    isDark,
    colors: activeColors,
    typography: DESIGN_TOKENS.typography,
    spacing: DESIGN_TOKENS.spacing,
    radii: DESIGN_TOKENS.radii,
    shadows: DESIGN_TOKENS.shadows,
    calcInnerRadius,
  };
}

interface DesignTokensBadgeProps {
  tokenName: string;
  value: string;
  previewType?: "color" | "radius" | "text" | "spacing";
}

/**
 * Componente visual para documentar e inspeccionar un token en interfaces de desarrollo
 */
export const DesignTokenBadge: React.FC<DesignTokensBadgeProps> = ({
  tokenName,
  value,
  previewType = "color",
}) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-mono">
      <span className="text-[var(--text-secondary)]">{tokenName}</span>
      <div className="flex items-center gap-2">
        {previewType === "color" && (
          <span
            className="w-4 h-4 rounded-full border border-[var(--border-strong)] inline-block shrink-0"
            style={{ backgroundColor: value }}
          />
        )}
        {previewType === "radius" && (
          <span
            className="w-5 h-5 border-2 border-primary inline-block shrink-0"
            style={{ borderRadius: value }}
          />
        )}
        <span className="text-[var(--text-primary)] font-semibold">{value}</span>
      </div>
    </div>
  );
};

/**
 * Componente visor y documentador del sistema de tokens de Carteles.Click
 */
export const DesignTokensViewer: React.FC = () => {
  const { isDark, colors, typography, spacing, radii } = useDesignTokens();

  return (
    <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-6">
      <div>
        <h3 className="text-canonical-h3 font-heading">Design Tokens — Carteles.Click</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
          Valores centralizados de diseño sincronizados con index.css (Modo {isDark ? "Oscuro" : "Claro"})
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          Colores de Marca & Taller
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <DesignTokenBadge tokenName="brand.brick" value={DESIGN_TOKENS.colors.brand.brick} previewType="color" />
          <DesignTokenBadge tokenName="brand.craft" value={DESIGN_TOKENS.colors.brand.craft} previewType="color" />
          <DesignTokenBadge tokenName="brand.blue" value={DESIGN_TOKENS.colors.brand.blue} previewType="color" />
          <DesignTokenBadge tokenName="brand.concrete" value={DESIGN_TOKENS.colors.brand.concrete} previewType="color" />
          <DesignTokenBadge tokenName="brand.graphite" value={DESIGN_TOKENS.colors.brand.graphite} previewType="color" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          Superficies Activas ({isDark ? "Dark" : "Light"})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <DesignTokenBadge tokenName="bgPage" value={colors.bgPage} previewType="color" />
          <DesignTokenBadge tokenName="bgSurface" value={colors.bgSurface} previewType="color" />
          <DesignTokenBadge tokenName="borderSubtle" value={colors.borderSubtle} previewType="color" />
          <DesignTokenBadge tokenName="primary" value={colors.primary} previewType="color" />
          <DesignTokenBadge tokenName="textPrimary" value={colors.textPrimary} previewType="color" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          Radios Canónicos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <DesignTokenBadge tokenName="radii.card" value={radii.card} previewType="radius" />
          <DesignTokenBadge tokenName="radii.lg" value={radii.lg} previewType="radius" />
          <DesignTokenBadge tokenName="radii.xl" value={radii.xl} previewType="radius" />
          <DesignTokenBadge tokenName="radii.tab" value={radii.tab} previewType="radius" />
        </div>
      </div>
    </div>
  );
};
