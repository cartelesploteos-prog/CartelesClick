const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'for (const [matId, matItems] of Object.entries(itemsByMaterial)) {',
  'for (const [matId, matItemsUncast] of Object.entries(itemsByMaterial)) {\n      const matItems = matItemsUncast as any[];'
);

content = content.replace(
  'if (wholesaleTierRequested === "agencia") {',
  'if (wholesaleTierRequested === "plata" || (wholesaleTierRequested as any) === "agencia") {'
);

content = content.replace(
  '} else if (wholesaleTierRequested === "partner") {',
  '} else if (wholesaleTierRequested === "oro" || (wholesaleTierRequested as any) === "partner") {'
);

fs.writeFileSync('server.ts', content);
