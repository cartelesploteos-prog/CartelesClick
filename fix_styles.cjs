const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/"Plus Jakarta Sans"/g, '"Inter"');
css = css.replace(/'Plus Jakarta Sans'/g, "'Inter'");
css = css.replace(/"Space Grotesk"/g, '"Outfit"');
css = css.replace(/'Space Grotesk'/g, "'Outfit'");

css = css.replace(/--bg-page: #0B0F19;/g, '--bg-page: #18181B;');
css = css.replace(/--bg-surface: #111827;/g, '--bg-surface: #27272A;');
css = css.replace(/--bg-surface-subtle: #1F2937;/g, '--bg-surface-subtle: #3F3F46;');
css = css.replace(/--bg-surface-elevated: #1F2937;/g, '--bg-surface-elevated: #3F3F46;');
css = css.replace(/--brand-concrete: #1F2937;/g, '--brand-concrete: #3F3F46;');
css = css.replace(/--brand-graphite: #111827;/g, '--brand-graphite: #27272A;');

fs.writeFileSync('src/index.css', css);
