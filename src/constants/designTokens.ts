/**
 * CARTELES CLICK 3D — DESIGN TOKENS (TypeScript Source of Truth)
 * Centraliza los valores canónicos de src/index.css (colores, espaciados,
 * tipografías, radios, transiciones y z-index) en un objeto fuertemente tipado.
 */

export const DESIGN_TOKENS = {
  /**
   * Tipografías y Familias Tipográficas
   * Regla de marca: Sansation strictly weight 400 para H1-H6 y Logomarca.
   */
  typography: {
    fontFamilies: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: '"Sansation", "Inter", -apple-system, sans-serif',
      display: '"Sansation", "Inter", sans-serif',
      logo: '"Sansation Light", "Sansation", "Inter", sans-serif',
      tech: '"JetBrains Mono", "Fira Code", monospace',
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.15,
      snug: 1.25,
      normal: 1.45,
      relaxed: 1.6,
    },
    fontSizeFluid: {
      "2xs": "clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem)",
      xs: "clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)",
      sm: "clamp(0.8125rem, 0.78rem + 0.2vw, 0.875rem)",
      base: "clamp(0.875rem, 0.84rem + 0.25vw, 1rem)",
      md: "clamp(1rem, 0.95rem + 0.35vw, 1.125rem)",
      lg: "clamp(1.125rem, 1.05rem + 0.5vw, 1.25rem)",
      xl: "clamp(1.25rem, 1.15rem + 0.75vw, 1.5rem)",
      "2xl": "clamp(1.5rem, 1.35rem + 1vw, 1.875rem)",
      "3xl": "clamp(1.875rem, 1.65rem + 1.5vw, 2.25rem)",
      "4xl": "clamp(2.25rem, 1.95rem + 2vw, 3rem)",
      display: "clamp(2.5rem, 2rem + 3vw, 4rem)",
      hero: "clamp(3rem, 2.2rem + 4vw, 5rem)",
    },
  },

  /**
   * Sistema de Espaciados Fluidos y Rítmicos
   */
  spacing: {
    "3xs": "clamp(0.125rem, 0.1rem + 0.1vw, 0.25rem)",
    "2xs": "clamp(0.25rem, 0.2rem + 0.2vw, 0.375rem)",
    xs: "clamp(0.375rem, 0.3rem + 0.3vw, 0.5rem)",
    sm: "clamp(0.5rem, 0.4rem + 0.4vw, 0.75rem)",
    md: "clamp(0.75rem, 0.6rem + 0.6vw, 1rem)",
    lg: "clamp(1rem, 0.8rem + 0.8vw, 1.5rem)",
    xl: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)",
    "2xl": "clamp(2rem, 1.6rem + 1.6vw, 3rem)",
    "3xl": "clamp(3rem, 2.4rem + 2.4vw, 4.5rem)",
    section: "clamp(3rem, 2rem + 4vw, 6rem)",
    gap: "clamp(0.75rem, 0.5rem + 1vw, 1.5rem)",
    containerFluidPadding: "clamp(1rem, 0.5rem + 2.5vw, 3rem)",
    containerMaxWidth: "96rem", // 1536px
  },

  /**
   * Radios de Borde
   * Regla de marca: 7px para tarjetas principales (DEC-003), 9999px para tabs/pills.
   */
  radii: {
    none: "0px",
    xs: "4px",
    sm: "6px",
    card: "7px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
    tab: "9999px",
    button: "7px",
  },

  /**
   * Paleta de Colores
   */
  colors: {
    // Colores de Marca y Taller
    brand: {
      brick: "#D9381E",
      craft: "#C49A45",
      concrete: "#71717A",
      graphite: "#18181B",
      blue: "#1D4ED8",
      blueHover: "#1E40AF",
      blueLight: "#3B82F6",
    },

    // Semánticos Universales
    semantic: {
      success: "#10B981",
      successSubtle: "rgba(16, 185, 129, 0.12)",
      warning: "#F59E0B",
      warningSubtle: "rgba(245, 158, 11, 0.12)",
      danger: "#EF4444",
      dangerSubtle: "rgba(239, 68, 68, 0.12)",
      info: "#3B82F6",
      infoSubtle: "rgba(59, 130, 246, 0.12)",
      industrial: "#C49A45",
      purple: "#8B5CF6",
    },

    // Modo Claro (Default)
    light: {
      bgPage: "#F8FAFC",
      bgSurface: "#FFFFFF",
      bgSurfaceSubtle: "#F1F5F9",
      bgSurfaceElevated: "#FFFFFF",
      bgFloating: "rgba(255, 255, 255, 0.85)",
      borderSubtle: "#E2E8F0",
      borderStrong: "#CBD5E1",
      borderInteractive: "#94A3B8",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textMuted: "#94A3B8",
      textInverse: "#FFFFFF",
      primary: "#1D4ED8",
      primaryHover: "#1E40AF",
      primaryActive: "#172554",
      primaryLight: "#DBEAFE",
      accent: "#D9381E",
      accentHover: "#B91C1C",
    },

    // Modo Oscuro
    dark: {
      bgPage: "#0B0F19",
      bgSurface: "#111827",
      bgSurfaceSubtle: "#1F2937",
      bgSurfaceElevated: "#1E293B",
      bgFloating: "rgba(17, 24, 39, 0.85)",
      borderSubtle: "#1F2937",
      borderStrong: "#374151",
      borderInteractive: "#4B5563",
      textPrimary: "#F9FAFB",
      textSecondary: "#9CA3AF",
      textMuted: "#6B7280",
      textInverse: "#0F172A",
      primary: "#3B82F6",
      primaryHover: "#60A5FA",
      primaryActive: "#93C5FD",
      primaryLight: "#1E3A8A",
      accent: "#EF4444",
      accentHover: "#DC2626",
    },
  },

  /**
   * Sombras y Elevaciones
   */
  shadows: {
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    panel: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    floating: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  /**
   * Z-Index Map Canónico
   */
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    dock: 30,
    header: 40,
    drawer: 50,
    modal: 60,
    toast: 70,
    tooltip: 80,
  },

  /**
   * Tiempos y Curvas de Transición
   */
  transitions: {
    durations: {
      instant: "100ms",
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
      deliberate: "500ms",
    },
    easings: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
} as const;

export type DesignTokensType = typeof DESIGN_TOKENS;

/**
 * Regla Matemática de Radios Anidados:
 * Inside Corner Radius = Outside Corner Radius - Distance Between the Two (Padding)
 * Previene el defecto visual de radios concéntricos discordantes.
 */
export function calcInnerRadius(outerRadiusPx: number, paddingPx: number): number {
  return Math.max(0, outerRadiusPx - paddingPx);
}

/**
 * Obtiene la referencia de variable CSS compatible con Tailwind v4
 */
export function cssVar(variableName: string): string {
  return `var(--${variableName})`;
}

/**
 * Resuelve los colores activos según el modo de tema ('light' o 'dark')
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? DESIGN_TOKENS.colors.dark : DESIGN_TOKENS.colors.light;
}
