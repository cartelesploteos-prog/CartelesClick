const fs = require('fs');

let code = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

const oldOnClick = `                        setSelectedMainFamily(fam.id);
                        const availableSubs = subcategoriesByFamily[fam.id];
                        if (availableSubs && availableSubs.length > 0) {
                          const firstSub = availableSubs[0];
                          setSelectedCategory(firstSub.id);
                          const firstMat = MATERIALS_CATALOG.find((m) => m.category === firstSub.id);
                          if (firstMat) {
                            setSelectedMaterialId(firstMat.id);
                            if (firstMat.defaultFinishings) {
                              setSelectedFinishings(firstMat.defaultFinishings as FinishingType[]);
                            }
                          }
                        }
                        setCurrentStep(2);`;

const newOnClick = `                        setSelectedMainFamily(fam.id);
                        const firstMat = MATERIALS_CATALOG.find((m) => m.category === fam.id);
                        if (firstMat) {
                          setSelectedMaterialId(firstMat.id);
                          if (firstMat.defaultFinishings) {
                            setSelectedFinishings(firstMat.defaultFinishings as FinishingType[]);
                          }
                        }
                        setCurrentStep(2);`;

code = code.replace(oldOnClick, newOnClick);

fs.writeFileSync('src/components/views/CotizadorView.tsx', code);
