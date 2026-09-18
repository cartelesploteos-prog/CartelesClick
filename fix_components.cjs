const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The user also mentioned fixing components interactively.
// The primary colors are now fixed in CSS. Let's fix text-white against bg-emerald and others.
// We should replace `bg-emerald-500 text-white` with `bg-emerald-700 text-white` or `text-black`
// Wait, for AAA, emerald-700 against white is 5.48:1 (FAIL AAA).
// To pass AAA with emerald, we need emerald-800 (#065F46) against white (9.14:1)
// Let's replace bg-emerald-[567]00 text-white with bg-emerald-800 text-white

execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-500 text-white/bg-emerald-800 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-600 hover:bg-emerald-500 text-white/bg-emerald-800 hover:bg-emerald-700 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-600 hover:bg-emerald-700 text-white/bg-emerald-800 hover:bg-emerald-900 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-700 hover:bg-emerald-600 text-white/bg-emerald-800 hover:bg-emerald-700 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-600 text-white/bg-emerald-800 text-white/g' {} +`);

// Same for amber
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-amber-500 text-white/bg-amber-800 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-amber-600 text-white/bg-amber-800 text-white/g' {} +`);

// Same for red
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-red-500 text-white/bg-red-800 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-red-600 text-white/bg-red-800 text-white/g' {} +`);

// Same for blue
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-blue-600 text-white/bg-blue-800 text-white/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-blue-500 text-white/bg-blue-800 text-white/g' {} +`);

// Remove any text-white on transparent backgrounds that causes issues.
// But some text-white are in overlays (like `bg-black/80 text-white`). Those pass AAA!
// Let's check the padding issue.
// The user says: "Ajusta los contenedores principales y los estilos globales en 'index.css' para asegurar que, en dispositivos móviles, todos los componentes respeten estrictamente un margen/padding lateral del 4%"
// I already set `--container-fluid-padding: clamp(4%, 4vw, 2rem);` and `--space-gap: clamp(4%, 4vw, 2rem);`
