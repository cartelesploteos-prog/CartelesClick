#!/bin/bash
cat identity_carteles_click.md > DESIGN.md
echo "" >> DESIGN.md
echo "## 6. Variables CSS de Efectos Dinámicos" >> DESIGN.md
echo "El componente BorderBeam está configurado en \`src/index.css\` mediante variables dinámicas que aseguran consistencia en toda la aplicación (grosor 2px y color amarillo láser):" >> DESIGN.md
echo "\`\`\`css" >> DESIGN.md
echo ".cta-border-beam {" >> DESIGN.md
echo "  --beam-border-width: 2px;" >> DESIGN.md
echo "  --beam-color-from: transparent;" >> DESIGN.md
echo "  --beam-color-to: #FCD34D;" >> DESIGN.md
echo "  --beam-duration: 4s;" >> DESIGN.md
echo "}" >> DESIGN.md
echo "\`\`\`" >> DESIGN.md
