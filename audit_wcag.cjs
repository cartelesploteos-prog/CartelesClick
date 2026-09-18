const fs = require('fs');

function getLuminance(hex) {
    if (!hex) return 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    
    let [r, g, b] = [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
    ].map(v => {
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(hex1, hex2) {
    let l1 = getLuminance(hex1);
    let l2 = getLuminance(hex2);
    let brightest = Math.max(l1, l2);
    let darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
}

const colors = {
    'bg-page': { light: '#F8FAFC', dark: '#0B0F19' },
    'bg-surface': { light: '#FFFFFF', dark: '#111827' },
    'bg-surface-subtle': { light: '#F1F5F9', dark: '#1F2937' },
    'primary': { light: '#1D4ED8', dark: '#2563EB' },
    'text-primary': { light: '#0F172A', dark: '#F8FAFC' },
    'text-secondary': { light: '#334155', dark: '#CBD5E1' },
    'text-muted': { light: '#475569', dark: '#94A3B8' },
    'text-inverse': { light: '#FFFFFF', dark: '#0B0F19' },
    'white': { light: '#FFFFFF', dark: '#FFFFFF' }
};

console.log("=== Contrast Audit (WCAG AAA requires 7:1 for normal text) ===\n");
Object.keys(colors).forEach(bg => {
    if (bg.startsWith('text-') || bg === 'white') return;
    Object.keys(colors).forEach(fg => {
        if (!fg.startsWith('text-') && fg !== 'white') return;
        let cLight = getContrast(colors[bg].light, colors[fg].light).toFixed(2);
        let cDark = getContrast(colors[bg].dark, colors[fg].dark).toFixed(2);
        
        let passLight = cLight >= 7 ? 'PASS AAA' : (cLight >= 4.5 ? 'PASS AA' : 'FAIL');
        let passDark = cDark >= 7 ? 'PASS AAA' : (cDark >= 4.5 ? 'PASS AA' : 'FAIL');
        
        if (cLight < 7 || cDark < 7) {
            console.log(`[${bg} / ${fg}] Light: ${cLight}:1 (${passLight}) | Dark: ${cDark}:1 (${passDark})`);
        }
    });
});
