export function runAuditDiagnostic() {
  if (typeof window === 'undefined') return;

  console.group('🔍 Running UI Diagnostic Audit...');
  let hasErrors = false;

  // 1. Audit H1-H6 for 'Sansation' and inline styles
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .text-canonical-h1, .text-canonical-h2, .text-canonical-h3, .text-canonical-h4');
  headings.forEach(heading => {
    const el = heading as HTMLElement;
    const computedStyle = window.getComputedStyle(el);
    const fontFamily = computedStyle.fontFamily;
    const isSansation = fontFamily.toLowerCase().includes('sansation');
    const inlineStyle = el.getAttribute('style');

    if (!isSansation) {
      console.warn('❌ Heading font-family violation:', el.tagName, el.className, 'Computed Font:', fontFamily);
      hasErrors = true;
    }
    if (inlineStyle && inlineStyle.includes('font-family')) {
      console.warn('❌ Inline font-family override found on heading:', el.tagName, el.className);
      hasErrors = true;
    }
  });

  // 2. Color Contrast Audit (WCAG AA/AAA)
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (lum1: number, lum2: number) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const parseRGB = (colorStr: string) => {
    const rgb = colorStr.match(/\d+(\.\d+)?/g);
    if (!rgb || rgb.length < 3) return null;
    return { r: parseFloat(rgb[0]), g: parseFloat(rgb[1]), b: parseFloat(rgb[2]) };
  };

  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.childNodes.length === 0) return;
    
    let hasText = false;
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '') {
        hasText = true;
      }
    });

    if (hasText) {
      const computed = window.getComputedStyle(el as Element);
      const textColor = parseRGB(computed.color);
      
      let currentEl: Element | null = el as Element;
      let bgColor = null;
      while (currentEl) {
        const bgComputed = window.getComputedStyle(currentEl);
        const bg = parseRGB(bgComputed.backgroundColor);
        if (bgComputed.backgroundColor !== 'rgba(0, 0, 0, 0)' && bgComputed.backgroundColor !== 'transparent') {
          bgColor = bg;
          break;
        }
        currentEl = currentEl.parentElement;
      }

      if (!bgColor) {
        bgColor = parseRGB(window.getComputedStyle(document.body).backgroundColor) || {r: 255, g: 255, b: 255};
      }

      if (textColor && bgColor) {
        const lum1 = getLuminance(textColor.r, textColor.g, textColor.b);
        const lum2 = getLuminance(bgColor.r, bgColor.g, bgColor.b);
        const ratio = getContrastRatio(lum1, lum2);

        const fontSize = parseFloat(computed.fontSize);
        const isLarge = fontSize >= 18 || (fontSize >= 14 && computed.fontWeight === '700');
        const requiredRatio = isLarge ? 3 : 4.5;
        
        if (ratio < requiredRatio) {
          console.warn(`❌ WCAG Contrast Violation (${ratio.toFixed(2)}:1):`, el.tagName, el.className, `Text: ${computed.color}, BG: rgba(${bgColor.r},${bgColor.g},${bgColor.b})`);
          hasErrors = true;
        }
      }
    }
  });

  if (!hasErrors) {
    console.log('✅ All diagnostic checks passed!');
  }
  console.groupEnd();
}
