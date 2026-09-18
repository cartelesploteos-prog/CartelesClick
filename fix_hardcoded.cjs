const { execSync } = require('child_process');

// Replace bg-white dark:bg-black -> bg-[var(--bg-surface)]
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-white dark:bg-black/bg-\\[var(--bg-surface)\\]/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/dark:bg-black bg-white/bg-\\[var(--bg-surface)\\]/g' {} +`);

// bg-white -> bg-[var(--bg-surface)] (need to be careful not to break specific pure white needs, but usually it's surface)
// Actually, let's leave pure `bg-white` unless it's paired with dark:. But wait, some components might just have `bg-white` and look bad in dark mode.
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-white/bg-\\[var(--bg-surface)\\]/g' {} +`);
// Restore some exceptions if needed, but the prompt says: "eliminando colores 'hardcoded' en los componentes JSX para asegurar que los modos Light y Dark sean siempre coherentes y accesibles."
// Wait, `bg-[var(--bg-surface)]` is correct.

// Replace text-black dark:text-white -> text-[var(--text-primary)]
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/text-black dark:text-white/text-\\[var(--text-primary)\\]/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/dark:text-white text-black/text-\\[var(--text-primary)\\]/g' {} +`);

// Replace text-black -> text-[var(--text-primary)]
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/text-black/text-\\[var(--text-primary)\\]/g' {} +`);

console.log("Hardcoded replacements done.");
