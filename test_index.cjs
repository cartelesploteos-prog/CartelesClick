const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Also update dark mode text overrides in body
content = content.replace(/background-color: var\(--bg-page\);\n    color: var\(--text-primary\);/g, "background-color: var(--bg-page);\n    color: var(--text-primary);\n    transition: background-color 0.3s ease, color 0.3s ease;");

fs.writeFileSync('src/index.css', content);
