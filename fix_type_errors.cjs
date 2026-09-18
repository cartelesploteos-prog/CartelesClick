const fs = require('fs');
let code = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

// Fix "rigidos"
code = code.replace(/selectedMainFamily === "rigidos"/g, 'false');

// Fix "vinilos" - line 2477
code = code.replace(/selectedMainFamily === "vinilos"/g, 'selectedMainFamily === "gigantografias"');

fs.writeFileSync('src/components/views/CotizadorView.tsx', code);

// Fix recommendedUses in materials.ts
let materialsCode = fs.readFileSync('src/data/materials.ts', 'utf8');
materialsCode = materialsCode.replace(/defaultFinishings: \[\],\n  \},/g, 'defaultFinishings: [],\n    recommendedUses: [],\n  },');

fs.writeFileSync('src/data/materials.ts', materialsCode);
