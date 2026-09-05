const fs = require('fs');

const oldCode = `                <div className="grid grid-cols-1 gap-3">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterialId === mat.id;
                    return (
                      <button
                        key={mat.id}
                        id={\`mat-option-\${mat.id}\`}
                        onClick={() => {
                          setSelectedMaterialId(mat.id);
                          if (mat.defaultFinishings) {
                            setSelectedFinishings(mat.defaultFinishings as FinishingType[]);
                          }
                        }}
                        className={\`p-4 rounded-xl border text-left transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer \${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                            : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                        }\`}
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={mat.image}
                            alt={mat.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[var(--border-subtle)]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                {mat.name}
                              </h4>
                              {mat.badge && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-black font-semibold">
                                  {mat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {mat.shortDesc}
                            </p>
                            <div className="flex flex-wrap gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
                              <span>🕒 {mat.durability.split(".")[0]}</span>
                              <span>☀️ {mat.lightingType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>`;

const newCode = `                <div className="grid grid-cols-1 gap-3">
                  {selectedCategory === "rigidos" ? (
                    [
                      { name: "PVC Espumado (Sintra)", mats: availableMaterials.filter(m => m.id.includes("pvc")) },
                      { name: "Poliestireno Alto Impacto (PAI)", mats: availableMaterials.filter(m => m.id.includes("alto_impacto")) },
                      { name: "Acrílico Premium", mats: availableMaterials.filter(m => m.id.includes("acrilico")) },
                      { name: "Otros Rígidos", mats: availableMaterials.filter(m => !m.id.includes("pvc") && !m.id.includes("alto_impacto") && !m.id.includes("acrilico")) }
                    ].filter(g => g.mats.length > 0).map(group => (
                      <div key={group.name} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-white/5">
                        <div className="bg-[var(--bg-subtle)] px-4 py-2 border-b border-[var(--border-subtle)]">
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">{group.name}</h4>
                        </div>
                        <div className="divide-y divide-[var(--border-subtle)]">
                          {group.mats.map((mat) => {
                            const isSelected = selectedMaterialId === mat.id;
                            return (
                              <button
                                key={mat.id}
                                id={\`mat-option-\${mat.id}\`}
                                onClick={() => {
                                  setSelectedMaterialId(mat.id);
                                  if (mat.defaultFinishings) {
                                    setSelectedFinishings(mat.defaultFinishings as FinishingType[]);
                                  }
                                }}
                                className={\`w-full p-4 text-left transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-subtle)] \${
                                  isSelected ? "bg-primary/5 ring-inset ring-2 ring-primary" : "bg-transparent"
                                }\`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <img
                                    src={mat.image}
                                    alt={mat.name}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded object-cover shrink-0 border border-[var(--border-subtle)] opacity-80"
                                  />
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
                                        {mat.name.replace(/(Placas |Alto impacto )/g, '')}
                                      </h4>
                                      {mat.badge && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-black font-semibold">
                                          {mat.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                                      {mat.shortDesc}
                                    </p>
                                  </div>
                                </div>
                                <div className="shrink-0 flex items-center self-end sm:self-center">
                                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    availableMaterials.map((mat) => {
                      const isSelected = selectedMaterialId === mat.id;
                      return (
                        <button
                          key={mat.id}
                          id={\`mat-option-\${mat.id}\`}
                          onClick={() => {
                            setSelectedMaterialId(mat.id);
                            if (mat.defaultFinishings) {
                              setSelectedFinishings(mat.defaultFinishings as FinishingType[]);
                            }
                          }}
                          className={\`p-4 rounded-xl border text-left transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer \${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                              : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                          }\`}
                        >
                          <div className="flex items-start gap-3.5">
                            <img
                              src={mat.image}
                              alt={mat.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[var(--border-subtle)]"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                  {mat.name}
                                </h4>
                                {mat.badge && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-black font-semibold">
                                    {mat.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {mat.shortDesc}
                              </p>
                              <div className="flex flex-wrap gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
                                <span>🕒 {mat.durability.split(".")[0]}</span>
                                <span>☀️ {mat.lightingType}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>`;

let content = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');
content = content.replace(oldCode, newCode);
fs.writeFileSync('src/components/views/CotizadorView.tsx', content);
console.log("Done");
