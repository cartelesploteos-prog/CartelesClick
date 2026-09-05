const fs = require('fs');

const filePaths = [
  'src/components/views/HomeView.tsx',
  'src/components/FloatingDock.tsx',
];

for (const fp of filePaths) {
  let content = fs.readFileSync(fp, 'utf8');

  content = content.replace(/bg-\[#13151B\]/g, "bg-[var(--bg-surface)]");
  content = content.replace(/bg-\[#181A22\]/g, "bg-[var(--bg-surface-subtle)]");
  content = content.replace(/bg-\[#0C0D11\]/g, "bg-[var(--bg-page)]");
  
  content = content.replace(/border-white\/\[0\.15\]/g, "border-[var(--border-strong)]");
  content = content.replace(/border-white\/\[0\.06\]/g, "border-[var(--border-subtle)]");
  content = content.replace(/border-white\/\[0\.08\]/g, "border-[var(--border-subtle)]");

  // text colors
  content = content.replace(/text-\[#949BA4\]/g, "text-[var(--text-secondary)]");

  if (fp.includes('FloatingDock')) {
      content = content.replace(/bg-\[#0C0D11\]\/80/g, "bg-[var(--bg-surface-elevated)]/80");
      content = content.replace(/border-white\/\[0\.12\]/g, "border-[var(--border-strong)]");
  }
  
  fs.writeFileSync(fp, content);
}
