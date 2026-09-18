const fs = require('fs');

let admin = fs.readFileSync('src/components/views/AdminPanelView.tsx', 'utf8');
admin = admin.replace(/category: "lonas"/g, 'category: "gigantografias"');
fs.writeFileSync('src/components/views/AdminPanelView.tsx', admin);

let cotiz = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');
// 444: setSelectedCategory(found.category) -> setSelectedMainFamily(found.category)
cotiz = cotiz.replace(/setSelectedCategory\(/g, 'setSelectedMainFamily(');

// 1124: subcategoriesByFamily -> we removed it, so we need to rewrite this whole block.
const badOnClick = `const availableSubs = subcategoriesByFamily[fam.id];
                        if (availableSubs && availableSubs.length > 0) {
                          const firstSub = availableSubs[0];
                          setSelectedMainFamily(firstSub.id);
                          const firstMat = MATERIALS_CATALOG.find((m) => m.category === firstSub.id);
                          if (firstMat) {
                            setSelectedMaterialId(firstMat.id);
                            if (firstMat.defaultFinishings) {
                              setSelectedFinishings(firstMat.defaultFinishings as FinishingType[]);
                            }
                          }
                        }`;
cotiz = cotiz.replace(badOnClick, '');
fs.writeFileSync('src/components/views/CotizadorView.tsx', cotiz);

let mats = fs.readFileSync('src/data/materials.ts', 'utf8');
mats = mats.replace(/defaultFinishings: \[\],\n  \}/g, 'defaultFinishings: [],\n    recommendedUses: [],\n  }');
fs.writeFileSync('src/data/materials.ts', mats);

