const { execSync } = require('child_process');

// Replace failing tailwind colors with darker variants to pass AA minimum (4.5:1)
// We already replaced some previously, let's catch the leftovers
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-emerald-600/bg-emerald-800/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-amber-600/bg-amber-800/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-red-600/bg-red-800/g' {} +`);
execSync(`find src -name "*.tsx" -type f -exec sed -i 's/bg-sky-600/bg-sky-800/g' {} +`);

console.log("Contrast fixes applied.");
