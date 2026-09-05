const fs = require('fs');

const filePaths = [
  'src/components/views/HomeView.tsx',
  'src/components/FloatingDock.tsx',
];

for (const fp of filePaths) {
  let content = fs.readFileSync(fp, 'utf8');

  // We only replace #13151B (dark card background) with var(--bg-surface)
  // and #0C0D11 (dark page background) with var(--bg-page)
  // But wait, the hero section gradients might need to be explicit.
  // Actually, replacing colors everywhere might ruin the dark theme hero look.
  
  // Let's replace only generic tailwind class colors:
  content = content.replace(/bg-\[#13151B\]/g, "bg-[var(--bg-surface)]");
  content = content.replace(/bg-\[#181A22\]/g, "bg-[var(--bg-surface-subtle)]");
  content = content.replace(/bg-\[#0C0D11\]/g, "bg-[var(--bg-page)]");
  
  // borders
  content = content.replace(/border-white\/\[0\.15\]/g, "border-[var(--border-strong)]");
  content = content.replace(/border-white\/\[0\.06\]/g, "border-[var(--border-subtle)]");
  content = content.replace(/border-white\/\[0\.08\]/g, "border-[var(--border-subtle)]");

  // Floating dock specific
  if (fp.includes('FloatingDock')) {
      content = content.replace(/bg-\[#0C0D11\]\/80/g, "bg-[var(--bg-surface-elevated)]\/80");
      content = content.replace(/border-white\/\[0\.12\]/g, "border-[var(--border-strong)]");
  }

  // Also text-white for primary headings
  // Let's not blindly replace `text-white` because some buttons need it.
  
  fs.writeFileSync(fp, content);
}
