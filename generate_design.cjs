const fs = require('fs');

const cssContent = fs.readFileSync('src/index.css', 'utf-8');
const identityContent = fs.readFileSync('identity_carteles_click.md', 'utf-8');

// VERY basic extraction
let designDoc = identityContent + "\n\n";
designDoc += "## 6. Variables CSS Extrapoladas\n\n";

const rootMatch = cssContent.match(/:root\s*{([^}]+)}/);
if (rootMatch) {
  designDoc += "### Colors & Root Tokens\n\n```css\n:root {\n" + rootMatch[1] + "\n}\n```\n\n";
}

const darkMatch = cssContent.match(/\.dark\s*{([^}]+)}/);
if (darkMatch) {
  designDoc += "### Dark Mode Tokens\n\n```css\n.dark {\n" + darkMatch[1] + "\n}\n```\n\n";
}

const beamMatch = cssContent.match(/\.cta-border-beam\s*{([^}]+)}/);
if (beamMatch) {
  designDoc += "### Efectos Dinámicos (Border Beam)\n\n```css\n.cta-border-beam {\n" + beamMatch[1] + "\n}\n```\n\n";
}

fs.writeFileSync('DESIGN.md', designDoc);
console.log("DESIGN.md regenerated.");
