const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// I notice my previous sed replacement for 100svh might have failed or not done exactly what I wanted.
content = content.replace(/min-height: 100dvh;/g, "min-height: 100svh;\n    width: 100%;\n    max-width: 100vw;");

// I also need to make sure the app handles light/dark transitions smoothly
content = content.replace(/color: var\(--text-primary\);/g, "color: var(--text-primary);\n    transition: background-color 0.15s ease, color 0.15s ease;");

fs.writeFileSync('src/index.css', content);
