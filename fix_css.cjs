const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// LIGHT MODE
// Make primary darker to pass AAA (7:1) with white text. #1E40AF (Blue 800) is 9.87:1
css = css.replace(/--color-primary: #0055FF;/g, '--color-primary: #1E40AF;');
css = css.replace(/--color-primary: #1D4ED8;/g, '--color-primary: #1E40AF;');
css = css.replace(/--color-primary-hover: #0044CC;/g, '--color-primary-hover: #1E3A8A;');
css = css.replace(/--color-primary-hover: #1E40AF;/g, '--color-primary-hover: #1E3A8A;');

css = css.replace(/--brand-brick: #1D4ED8;/g, '--brand-brick: #1E40AF;');
css = css.replace(/--brand-brick-hover: #1E40AF;/g, '--brand-brick-hover: #1E3A8A;');

// Make text-muted darker to pass AAA with subtle backgrounds
css = css.replace(/--text-muted: #475569;/g, '--text-muted: #334155;');
css = css.replace(/--text-secondary: #334155;/g, '--text-secondary: #1E293B;');
css = css.replace(/--text-primary: #0F172A;/g, '--text-primary: #020617;');


// DARK MODE
// In dark mode, --color-primary was #2563EB (Blue 600). With white text it's 5.1:1.
// Let's use #1E40AF in dark mode too if we want white text to pass AAA.
// Alternatively, we can use a bright primary but dark text on it, but the app uses text-white.
css = css.replace(/--color-primary: #2563EB;/g, '--color-primary: #1E40AF;');
css = css.replace(/--color-primary-hover: #3B82F6;/g, '--color-primary-hover: #2563EB;');

css = css.replace(/--text-primary: #F8FAFC;/g, '--text-primary: #FFFFFF;');
css = css.replace(/--text-secondary: #CBD5E1;/g, '--text-secondary: #F1F5F9;');
css = css.replace(/--text-muted: #94A3B8;/g, '--text-muted: #CBD5E1;');

fs.writeFileSync('src/index.css', css);
