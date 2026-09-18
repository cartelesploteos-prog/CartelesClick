const fs = require('fs');

let code = fs.readFileSync('src/data/materials.ts', 'utf8');

code = code.replace(/applicableCategories: \["lonas", "vinilos", "rigidos"\]/g, 'applicableCategories: ["gigantografias", "carteles"]');
code = code.replace(/applicableCategories: \["lonas", "vinilos", "estampados"\]/g, 'applicableCategories: ["gigantografias", "estampados"]');
code = code.replace(/applicableCategories: \["lonas", "estampados"\]/g, 'applicableCategories: ["gigantografias", "estampados"]');
code = code.replace(/applicableCategories: \["lonas"\]/g, 'applicableCategories: ["gigantografias", "carteles"]');
code = code.replace(/applicableCategories: \["lonas", "rigidos"\]/g, 'applicableCategories: ["gigantografias", "carteles"]');
code = code.replace(/applicableCategories: \["vinilos"\]/g, 'applicableCategories: ["gigantografias", "carteles"]');
code = code.replace(/applicableCategories: \["rigidos", "corporeos"\]/g, 'applicableCategories: ["carteles", "corporeos"]');

fs.writeFileSync('src/data/materials.ts', code);
