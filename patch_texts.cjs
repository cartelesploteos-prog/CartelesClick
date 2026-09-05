const fs = require('fs');

const filePaths = [
  'src/components/views/HomeView.tsx',
];

for (const fp of filePaths) {
  let content = fs.readFileSync(fp, 'utf8');

  // Let's manually replace `text-white` with `text-[var(--text-primary)]` for headings and generic texts
  // I will only target specific lines to avoid breaking gradient buttons
  content = content.replace(/text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white/g, "text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)]");
  content = content.replace(/text-2xl sm:text-3xl font-bold text-white/g, "text-2xl sm:text-3xl font-bold text-[var(--text-primary)]");
  content = content.replace(/text-lg font-bold text-white/g, "text-lg font-bold text-[var(--text-primary)]");
  content = content.replace(/font-semibold text-white/g, "font-semibold text-[var(--text-primary)]");
  content = content.replace(/text-white placeholder/g, "text-[var(--text-primary)] placeholder");
  
  // also hover:text-white in pills -> hover:text-[var(--text-primary)]
  content = content.replace(/hover:text-white/g, "hover:text-[var(--text-primary)]");

  fs.writeFileSync(fp, content);
}
