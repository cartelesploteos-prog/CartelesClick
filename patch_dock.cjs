const fs = require('fs');
let content = fs.readFileSync('src/components/FloatingDock.tsx', 'utf8');

// Replace standard buttons with aria-labels
content = content.replace(
  /<button\s+onClick=\{\(\) => handleNavClick\("home"\)\}\s+className=\{`/g,
  '<button\n          onClick={() => handleNavClick("home")}\n          aria-label="Ir al inicio"\n          title="Inicio"\n          className={`'
);

content = content.replace(
  /<button\s+onClick=\{\(\) => \{\s+\/\/ Si ya estamos/g,
  '<button\n            aria-label="Cotizador y Herramientas"\n            title="Herramientas"\n            onClick={() => {\n              // Si ya estamos'
);

content = content.replace(
  /<button\s+onClick=\{\(\) => toggleMenu\("user"\)\}/g,
  '<button\n            aria-label="Menú de Usuario"\n            title="Cuenta"\n            onClick={() => toggleMenu("user")}'
);

content = content.replace(
  /<button\s+onClick=\{\(\) => toggleMenu\("modes"\)\}/g,
  '<button\n            aria-label="Configuración y Modos"\n            title="Ajustes"\n            onClick={() => toggleMenu("modes")}'
);

fs.writeFileSync('src/components/FloatingDock.tsx', content);
console.log('Patched FloatingDock');
