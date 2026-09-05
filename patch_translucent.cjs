const fs = require('fs');

const filePaths = [
  'src/components/views/HomeView.tsx',
];

for (const fp of filePaths) {
  let content = fs.readFileSync(fp, 'utf8');

  // Translucent backgrounds often look bad in light mode if they assume a dark background.
  // We can switch them to Tailwind utility variables or `bg-black/[0.04] dark:bg-white/[0.04]`.
  // Wait, I am restricted to the current CSS class setup. Let's use `bg-[var(--bg-surface-subtle)]`.
  // Or I can add dark mode prefixes but Tailwind natively supports `dark:bg-white/10`.
  // Let's replace generic `bg-white/[0.03]`, `bg-white/[0.04]`, `bg-white/[0.05]`, `bg-white/[0.06]`, `bg-white/[0.08]` 
  // with `bg-black/5 dark:bg-white/5` etc.
  
  content = content.replace(/bg-white\/\[0\.03\]/g, "bg-black/[0.03] dark:bg-white/[0.03]");
  content = content.replace(/bg-white\/\[0\.04\]/g, "bg-black/[0.04] dark:bg-white/[0.04]");
  content = content.replace(/bg-white\/\[0\.05\]/g, "bg-black/[0.05] dark:bg-white/[0.05]");
  content = content.replace(/bg-white\/\[0\.06\]/g, "bg-black/[0.06] dark:bg-white/[0.06]");
  content = content.replace(/bg-white\/\[0\.08\]/g, "bg-black/[0.08] dark:bg-white/[0.08]");
  content = content.replace(/bg-white\/\[0\.1\]/g, "bg-black/[0.1] dark:bg-white/[0.1]");
  content = content.replace(/bg-white\/\[0\.12\]/g, "bg-black/[0.12] dark:bg-white/[0.12]");
  content = content.replace(/bg-white\/\[0\.15\]/g, "bg-black/[0.15] dark:bg-white/[0.15]");

  // text-white generic outside hero -> dark:text-white text-black
  // It's safer to just let the body cascade text color, so removing explicit text-white where not needed.
  
  fs.writeFileSync(fp, content);
}
