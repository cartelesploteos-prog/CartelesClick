# Design System & Token Specifications

## 1. Color Palette (WCAG AA Compliant)
Extracted from `src/index.css`:

### Light Theme
- `--bg-page`: `#FAFAFC`
- `--bg-surface`: `#FFFFFF`
- `--bg-surface-subtle`: `#F3F4F6`
- `--bg-surface-elevated`: `#FFFFFF`
- `--text-primary`: `#111827` (Contrast Ratio >= 15.3:1)
- `--text-secondary`: `#374151` (Contrast Ratio >= 9.5:1)
- `--brand-brick` (Primary CTA): `#C8380A` (Contrast Ratio >= 5.0:1 on white)
- `--brand-brick-hover`: `#A72E08`
- `--color-accent`: `#B45309`

### Dark Theme
- `--bg-page`: `#1F1D21`
- `--bg-surface`: `#28262A`
- `--bg-surface-subtle`: `#333135`
- `--text-primary`: `#F8F9FA` (Contrast Ratio >= 13.8:1)
- `--text-secondary`: `#D1D5DB` (Contrast Ratio >= 9.2:1)
- `--brand-brick` (Primary CTA): `#FF5520` (Contrast Ratio >= 5.8:1 on dark)
- `--brand-brick-hover`: `#FF6B38`

## 2. Fluid Typography & Spacing Tokens
Fluid clamp values adjust proportionally based on viewport size.

### Typography
- `--text-xs`: `clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)`
- `--text-sm`: `clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem)`
- `--text-base`: `clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem)`
- `--text-2xl`: `clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)`

### Fluid Base Spacing Tokens
- `--space-3xs`: `clamp(0.25rem, 0.2rem + 0.1vw, 0.375rem)` (4px - 6px)
- `--space-2xs`: `clamp(0.375rem, 0.3rem + 0.2vw, 0.5rem)` (6px - 8px)
- `--space-xs`: `clamp(0.5rem, 0.45rem + 0.25vw, 0.75rem)` (8px - 12px)
- `--space-sm`: `clamp(0.75rem, 0.65rem + 0.4vw, 1rem)` (12px - 16px)
- `--space-md`: `clamp(1rem, 0.85rem + 0.6vw, 1.5rem)` (16px - 24px)
- `--space-lg`: `clamp(1.5rem, 1.25rem + 1vw, 2.25rem)` (24px - 36px)
- `--space-xl`: `clamp(2rem, 1.6rem + 1.5vw, 3.25rem)` (32px - 52px)

## 3. Border Beam Specifications
Component: `src/components/ui/BorderBeam.tsx`
CSS Classes: `.animate-border-beam`, `.cta-border-beam` (in `src/index.css`)

**Parameters:**
- `duration`: `3.5s` (default)
- `borderWidth`: `2px` (default)
- `colorFrom`: `#FFE600` (default)
- `colorTo`: `#FCD34D` (default)

**Usage Context:**
Used to highlight primary CTAs, premium materials, or AI features (e.g. Ideogram AI poster generation CTA) using an animated conic gradient masked over the container border.

---

## 4. Application Audit (Cotizador / PosterCreator)
### Findings:
1. **Border Beam Integration (Success):** The `BorderBeam` component is successfully and consistently applied in both `CotizadorView` and `PosterCreatorView` via the unified `<AddToCartButton />` component. This encapsulates the complex SVG animations (masking and conic gradients) safely within the primary CTA, avoiding markup repetition in the main views.
2. **Spacing Tokens:** The views currently rely on hardcoded Tailwind spacing utilities (e.g., `p-4`, `space-y-6`). While visually acceptable, migrating these to the semantic CSS variables (`p-[var(--space-md)]`) mapped in this document would guarantee fluid scaling across all responsive viewports without writing arbitrary breakpoints.
3. **Colors Consistency:** Both views reliably use abstract CSS variables (`var(--bg-surface-subtle)`, `var(--brand-brick)`, etc.), which seamlessly map to the dark/light mode token matrix defined in `src/index.css`.
