/**
 * CARTELES CLICK 3D — DESIGN SYSTEM TOKENS (V1)
 * 
 * Token Specification & Canonical Single Source of Truth for Visual Identity.
 * Corresponds to Point P1 (Identidad visual: paleta, par tipográfico, curva de motion).
 * 
 * Interoperable with Tailwind CSS, shadcn/ui, Motion, and Vanilla CSS Variables.
 */

// ============================================================================
// 1. COLOR PALETTE TOKENS
// ============================================================================

export const COLOR_TOKENS = {
  // Brand Identity Core (Industrial Workshop & Modern CAD aesthetic)
  brand: {
    brick: {
      hex: "#FF5520",
      rgb: "255, 85, 32",
      hsl: "14, 100%, 56%",
      hover: "#FF6B38",
      active: "#E04413",
      // WCAG AA compliant on white/light backgrounds (Contrast Ratio >= 4.5:1)
      accessibleLight: "#D64210",
      accessibleLightHover: "#BF3A0D",
    },
    craft: {
      hex: "#8B8D98",
      rgb: "139, 141, 152",
      hsl: "231, 6%, 57%",
      light: "#6B7280",
    },
    concrete: {
      light: "#E5E7EB",
      dark: "#2E3240",
    },
    graphite: {
      light: "#F3F4F6",
      dark: "#18191E",
      pure: "#121316",
    },
  },

  // Accent Colors
  accent: {
    amber: {
      hex: "#B86514",
      hover: "#A35A12",
      darkHex: "#FFA048",
      darkHover: "#FF8F2E",
      hsl: "30, 80%, 40%",
    },
    cyanCad: {
      hex: "#0EA5E9",
      darkHex: "#38BDF8",
      hsl: "199, 89%, 48%",
    },
  },

  // Semantic & Feedback Statuses
  semantic: {
    success: {
      main: "#10B981",
      hover: "#059669",
      subtle: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.25)",
      text: "#065F46",
      darkText: "#34D399",
    },
    warning: {
      main: "#F59E0B",
      hover: "#D97706",
      subtle: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.25)",
      text: "#92400E",
      darkText: "#FBBF24",
    },
    error: {
      main: "#EF4444",
      hover: "#DC2626",
      subtle: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.25)",
      text: "#991B1B",
      darkText: "#F87171",
    },
    info: {
      main: "#3B82F6",
      hover: "#2563EB",
      subtle: "rgba(59, 130, 246, 0.12)",
      border: "rgba(59, 130, 246, 0.25)",
      text: "#1E40AF",
      darkText: "#60A5FA",
    },
  },

  // Theme Surface & Boundary Tokens
  theme: {
    light: {
      bgPage: "#FAFAFC",
      bgSurface: "#FFFFFF",
      bgSurfaceSubtle: "#F3F4F6",
      bgSurfaceElevated: "#FFFFFF",
      
      borderSubtle: "rgba(0, 0, 0, 0.08)",
      borderStrong: "rgba(0, 0, 0, 0.16)",
      borderInteractive: "#FF5520",

      textPrimary: "#111827",
      textSecondary: "#4B5563",
      textMuted: "#6B7280",
      textInverse: "#FFFFFF",
    },
    dark: {
      bgPage: "#161821",
      bgSurface: "#1E202B",
      bgSurfaceSubtle: "#262936",
      bgSurfaceElevated: "#2E3242",

      borderSubtle: "rgba(255, 255, 255, 0.09)",
      borderStrong: "rgba(255, 255, 255, 0.18)",
      borderInteractive: "#FF5520",

      textPrimary: "#F4F4F6",
      textSecondary: "#9BA1A8",
      textMuted: "#6C727A",
      textInverse: "#161821",
    },
  },
} as const;

// ============================================================================
// 2. TYPOGRAPHY TOKENS (Typographic Pair: Raleway + Inter)
// ============================================================================

export const TYPOGRAPHY_TOKENS = {
  fontFamilies: {
    heading: "'Raleway', sans-serif",
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    logo: "var(--font-heading)",
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  fontSizes: {
    "2xs": {
      rem: "0.75rem",
      px: "12px",
      fluid: "clamp(0.7rem, 0.65rem + 0.2vw, 0.75rem)",
      lineHeight: "1rem",
    },
    xs: {
      rem: "0.8125rem",
      px: "13px",
      fluid: "clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)",
      lineHeight: "1.125rem",
    },
    sm: {
      rem: "0.875rem",
      px: "14px",
      fluid: "clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem)",
      lineHeight: "1.25rem",
    },
    base: {
      rem: "0.9375rem",
      px: "15px",
      fluid: "clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem)",
      lineHeight: "1.5rem",
    },
    md: {
      rem: "1rem",
      px: "16px",
      fluid: "clamp(1rem, 0.9rem + 0.5vw, 1.0625rem)",
      lineHeight: "1.5rem",
    },
    lg: {
      rem: "1.125rem",
      px: "18px",
      fluid: "clamp(1.125rem, 1rem + 0.625vw, 1.25rem)",
      lineHeight: "1.75rem",
    },
    xl: {
      rem: "1.25rem",
      px: "20px",
      fluid: "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)",
      lineHeight: "1.75rem",
    },
    "2xl": {
      rem: "1.5rem",
      px: "24px",
      fluid: "clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)",
      lineHeight: "2rem",
    },
    "3xl": {
      rem: "1.875rem",
      px: "30px",
      fluid: "clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem)",
      lineHeight: "2.25rem",
    },
    display: {
      rem: "2.25rem",
      px: "36px",
      fluid: "clamp(2.25rem, 1.8rem + 2vw, 3rem)",
      lineHeight: "1.15",
    },
  },

  lineHeights: {
    none: "1",
    tight: "1.15",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.65",
    loose: "2",
  },

  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ============================================================================
// 3. MOTION & ANIMATION TOKENS
// ============================================================================

export const MOTION_TOKENS = {
  // Cubic Bezier Easing Curves
  easings: {
    // Primary fluid motion curve for smooth Ideogram UI transitions
    standard: [0.16, 1, 0.3, 1] as const,
    snappy: [0.2, 0, 0, 1] as const,
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    subtle: [0.25, 0.1, 0.25, 1] as const,
  },

  // Duration in milliseconds
  durations: {
    instant: 75,
    fast: 150,
    normal: 250,
    medium: 350,
    slow: 500,
    deliberate: 700,
  },

  // Preset Spring Physics Configurations
  springs: {
    snappy: { type: "spring", stiffness: 400, damping: 30 },
    gentle: { type: "spring", stiffness: 200, damping: 24 },
    wobbly: { type: "spring", stiffness: 300, damping: 15 },
    stiff: { type: "spring", stiffness: 500, damping: 35 },
  },

  // CSS Easing strings for standard stylesheet transitions
  cssEasings: {
    standard: "cubic-bezier(0.16, 1, 0.3, 1)",
    snappy: "cubic-bezier(0.2, 0, 0, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ============================================================================
// 4. SPACING & LAYOUT TOKENS (Base unit: 4px / 0.25rem)
// ============================================================================

export const SPACING_TOKENS = {
  baseUnitPx: 4,

  scale: {
    "0": "0px",
    "0.5": "0.125rem", // 2px
    "1": "0.25rem",    // 4px
    "1.5": "0.375rem", // 6px
    "2": "0.5rem",     // 8px
    "2.5": "0.625rem", // 10px
    "3": "0.75rem",    // 12px
    "3.5": "0.875rem", // 14px
    "4": "1rem",       // 16px
    "5": "1.25rem",    // 20px
    "6": "1.5rem",     // 24px
    "7": "1.75rem",    // 28px
    "8": "2rem",       // 32px
    "9": "2.25rem",    // 36px
    "10": "2.5rem",    // 40px
    "12": "3rem",      // 48px
    "14": "3.5rem",    // 56px
    "16": "4rem",      // 64px
    "20": "5rem",      // 80px
    "24": "6rem",      // 96px
    "28": "7rem",      // 112px
    "32": "8rem",      // 128px
    "36": "9rem",      // 144px
    "40": "10rem",     // 160px
    "44": "11rem",     // 176px
    "52": "13rem",     // 208px
  },

  layout: {
    sectionPaddingX: "clamp(1.25rem, 5%, 5svw)",
    maxContainerWidth: "80rem", // 1280px (Tailwind max-w-7xl)
    headerHeight: "80px",
    floatingDockHeight: "64px",
    minTouchTarget: "44px",
  },
} as const;

// ============================================================================
// 5. RADIUS & SHAPE TOKENS (Carteles Click Invariant: 7px)
// ============================================================================

export const RADIUS_TOKENS = {
  none: "0px",
  xs: "2px",
  sm: "4px",
  // 7px: Strict Invariant for Carteles Click CAD/Workshop cards and icon containers
  card7px: "7px",
  icon7px: "7px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  "3xl": "32px",
  cta: "9999px",
  pill: "9999px",
  full: "9999px",
} as const;

// ============================================================================
// 6. SHADOW & ELEVATION TOKENS
// ============================================================================

export const SHADOW_TOKENS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  glowBrick: "0 0 24px -4px rgba(255, 85, 32, 0.35)",
  glowAmber: "0 0 24px -4px rgba(184, 101, 20, 0.35)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
} as const;

// ============================================================================
// 7. ICON SYSTEM TOKENS (Lucide Iconography Hierarchy & WCAG AA Colors)
// ============================================================================

export const ICON_TOKENS = {
  // Dimensional scale with clear semantic hierarchy
  sizes: {
    micro: {
      px: 12,
      tailwind: "w-3 h-3",
      strokeWidth: 2,
      description: "Micro status dots, tight pills, inline mini chevrons",
    },
    compact: {
      px: 14,
      tailwind: "w-3.5 h-3.5",
      strokeWidth: 2,
      description: "Inline metadata, helper labels, tag glpyhs, mini badges",
    },
    sm: {
      px: 16,
      tailwind: "w-4 h-4",
      strokeWidth: 2,
      description: "Standard body icons, standard buttons, form inputs, list items",
    },
    md: {
      px: 20,
      tailwind: "w-5 h-5",
      strokeWidth: 2,
      description: "Section headings, tab bars, main navigation, interactive tiles",
    },
    lg: {
      px: 24,
      tailwind: "w-6 h-6",
      strokeWidth: 1.85,
      description: "Feature titles, modal headers, major action triggers",
    },
    xl: {
      px: 32,
      tailwind: "w-8 h-8",
      strokeWidth: 1.75,
      description: "Hero badges, primary feature cards, step indicators",
    },
    display: {
      px: 44,
      tailwind: "w-11 h-11",
      strokeWidth: 1.5,
      description: "Empty states, major illustration anchors, splash blocks",
    },
  },

  // Container Framing Dimensions (Invariant 7px CAD Radius)
  containers: {
    microBadge: "w-5 h-5 rounded-[5px]",
    compactBadge: "w-7 h-7 rounded-[7px]",
    standardBadge: "w-9 h-9 sm:w-10 sm:h-10 rounded-[7px]",
    featureBadge: "w-12 h-12 rounded-[9px]",
    heroBadge: "w-16 h-16 rounded-[12px]",
  },

  // WCAG AA Compliant Color Classes (Contrast >= 4.5:1 across both modes)
  colorVariants: {
    primary: {
      light: "text-[#C8380A]", // 5.0:1 on light
      dark: "dark:text-[#FF5520]", // 5.8:1 on dark
      bgLight: "bg-[#C8380A]/10 border-[#C8380A]/25",
      bgDark: "dark:bg-[#FF5520]/15 dark:border-[#FF5520]/30",
    },
    accent: {
      light: "text-[#B45309]", // 4.8:1 on light
      dark: "dark:text-[#FFA048]", // 6.2:1 on dark
      bgLight: "bg-[#B45309]/10 border-[#B45309]/25",
      bgDark: "dark:bg-[#FFA048]/15 dark:border-[#FFA048]/30",
    },
    neutral: {
      light: "text-[#374151]", // 9.5:1 on light
      dark: "dark:text-[#D1D5DB]", // 9.2:1 on dark
      bgLight: "bg-black/[0.04] border-black/[0.08]",
      bgDark: "dark:bg-white/[0.06] dark:border-white/[0.12]",
    },
    success: {
      light: "text-[#047857]", // 5.2:1 on light
      dark: "dark:text-[#34D399]", // 7.1:1 on dark
      bgLight: "bg-emerald-500/10 border-emerald-500/25",
      bgDark: "dark:bg-emerald-400/15 dark:border-emerald-400/30",
    },
    warning: {
      light: "text-[#B45309]", // 4.8:1 on light
      dark: "dark:text-[#FBBF24]", // 8.4:1 on dark
      bgLight: "bg-amber-500/10 border-amber-500/25",
      bgDark: "dark:bg-amber-400/15 dark:border-amber-400/30",
    },
    error: {
      light: "text-[#B91C1C]", // 5.9:1 on light
      dark: "dark:text-[#F87171]", // 6.5:1 on dark
      bgLight: "bg-red-500/10 border-red-500/25",
      bgDark: "dark:bg-red-400/15 dark:border-red-400/30",
    },
    info: {
      light: "text-[#1D4ED8]", // 6.1:1 on light
      dark: "dark:text-[#60A5FA]", // 6.7:1 on dark
      bgLight: "bg-blue-500/10 border-blue-500/25",
      bgDark: "dark:bg-blue-400/15 dark:border-blue-400/30",
    },
  },
} as const;

// ============================================================================
// 8. TAILWIND & SHADCN/UI INTEROP BRIDGE
// ============================================================================

/**
 * Mapping helper for shadcn/ui and Tailwind config themes
 */
export const DESIGN_SYSTEM_TAILWIND_CONFIG = {
  colors: {
    primary: {
      DEFAULT: "var(--color-primary, #FF5520)",
      hover: "var(--color-primary-hover, #FF6B38)",
      foreground: "var(--text-inverse, #FFFFFF)",
    },
    accent: {
      DEFAULT: "var(--color-accent, #B86514)",
      hover: "var(--color-accent-hover, #A35A12)",
      foreground: "var(--text-inverse, #FFFFFF)",
    },
    background: "var(--bg-page, #FAFAFC)",
    foreground: "var(--text-primary, #111827)",
    muted: {
      DEFAULT: "var(--bg-surface-subtle, #F3F4F6)",
      foreground: "var(--text-muted, #6B7280)",
    },
    card: {
      DEFAULT: "var(--bg-surface, #FFFFFF)",
      foreground: "var(--text-primary, #111827)",
    },
    popover: {
      DEFAULT: "var(--bg-surface-elevated, #FFFFFF)",
      foreground: "var(--text-primary, #111827)",
    },
    border: "var(--border-subtle, rgba(0, 0, 0, 0.08))",
    ring: "var(--border-interactive, #FF5520)",
  },
  borderRadius: {
    DEFAULT: "7px",
    card: "7px",
    icon: "7px",
    cta: "9999px",
    pill: "9999px",
  },
  fontFamily: {
    heading: ["Raleway", "sans-serif"],
    sans: ["Inter", "system-ui", "sans-serif"],
    display: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
} as const;

// Direct convenience exports for React components and Tailwind configuration
export const colors = COLOR_TOKENS;
export const typography = TYPOGRAPHY_TOKENS;
export const motionTokens = MOTION_TOKENS;
export const spacing = SPACING_TOKENS;
export const radii = RADIUS_TOKENS;
export const shadows = SHADOW_TOKENS;
export const iconTokens = ICON_TOKENS;
export const tailwindConfig = DESIGN_SYSTEM_TAILWIND_CONFIG;

// Export all system tokens grouped
export const DesignSystem = {
  colors: COLOR_TOKENS,
  typography: TYPOGRAPHY_TOKENS,
  motion: MOTION_TOKENS,
  spacing: SPACING_TOKENS,
  radii: RADIUS_TOKENS,
  shadows: SHADOW_TOKENS,
  icons: ICON_TOKENS,
  tailwindBridge: DESIGN_SYSTEM_TAILWIND_CONFIG,
};

export default DesignSystem;
