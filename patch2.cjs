const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const startIdx = content.indexOf(`app.post('/api/quote-batch', quoteRateLimiter, (req, res) => {`);
const endStr = `return res.status(500).json({ error: 'Error interno al procesar cotización de lote.' });
  }
});`;
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `app.post('/api/quote-batch', quoteRateLimiter, (req, res) => {
  try {
    const valResult = quoteBatchSchema.safeParse(req.body);
    if (!valResult.success) {
      return res.status(400).json({ error: 'Parámetros de lote no válidos.' });
    }
    
    const { materialId: globalMaterialId, items, wholesaleTierRequested, mountOption } = valResult.data;
    const costMap = getCostTableMap();
    if (!globalMaterialId || !costMap[globalMaterialId]) {
      return res.status(400).json({ error: 'Material global no encontrado.' });
    }

    const itemsByMaterial = {};
    for (const item of items) {
      const effMat = item.materialId || globalMaterialId;
      if (!itemsByMaterial[effMat]) itemsByMaterial[effMat] = [];
      itemsByMaterial[effMat].push(item);
    }

    const resultsMap = {};

    for (const [matId, matItems] of Object.entries(itemsByMaterial)) {
      const matConfig = costMap[matId] || costMap[globalMaterialId];
      
      let totalPlatesNeeded = 0;
      let totalPlateCostARS = 0;
      let totalRequestedArea = 0;
      let pieces = [];
      
      if (matConfig.mode === 'placa') {
        for (const item of matItems) {
          for (let i = 0; i < item.quantity; i++) {
            const w = Math.max(item.widthCm, item.heightCm);
            const h = Math.min(item.widthCm, item.heightCm);
            pieces.push({ w, h, id: item.id, itemArea: (w * h) / 10000 });
          }
        }
        
        let plateW = matConfig.plateWidthCm || 122;
        let plateH = matConfig.plateHeightCm || 244;
        if (plateH > plateW) { const temp = plateW; plateW = plateH; plateH = temp; }
        
        pieces.sort((a, b) => b.h - a.h);
        
        let bins = [];
        for (const p of pieces) {
          let placed = false;
          for (const bin of bins) {
            for (const level of bin.levels) {
              if (level.width + p.w <= plateW && p.h <= level.height) {
                level.width += p.w; placed = true; break;
              }
            }
            if (placed) break;
            let totalHeight = bin.levels.reduce((sum, l) => sum + l.height, 0);
            if (totalHeight + p.h <= plateH) {
              bin.levels.push({ width: p.w, height: p.h }); placed = true; break;
            }
            if (placed) break;
          }
          if (!placed) {
            bins.push({ levels: [{ width: p.w, height: p.h }] });
          }
        }
        totalPlatesNeeded = bins.length || 1;
        const platePriceARS = (matConfig.costARS || 55000) * (wholesaleTierRequested ? 1.5 : 2.5);
        totalPlateCostARS = totalPlatesNeeded * platePriceARS;
        totalRequestedArea = pieces.reduce((sum, p) => sum + p.itemArea, 0);
      }

      for (const item of matItems) {
        const qty = item.quantity;
        let baseMaterialSubtotalARS = 0;
        let calculatedAreaM2 = (item.widthCm * item.heightCm) / 10000;
        let effectiveBillableAreaM2 = calculatedAreaM2 * qty;
        let transparencyNotes = [];
        let fullPlateWarning = false;
        let platesCount = undefined;
        
        if (matConfig.mode === 'placa') {
          const itemArea = calculatedAreaM2 * qty;
          const proportion = totalRequestedArea > 0 ? (itemArea / totalRequestedArea) : 0;
          baseMaterialSubtotalARS = Math.round(totalPlateCostARS * proportion);
          transparencyNotes.push(\`Cálculo anidado (Nesting): Este lote de \${matConfig.name} usa \${totalPlatesNeeded} placa(s). Costo distribuido por área (\${(proportion * 100).toFixed(1)}%).\`);
          fullPlateWarning = true;
          platesCount = totalPlatesNeeded;
        } else {
          if (matConfig.mode === 'm2') {
            const singleAreaM2 = calculatedAreaM2;
            const totalAreaRequested = singleAreaM2 * qty;
            let billableTotalArea = totalAreaRequested;
            if (matConfig.minAreaM2 && totalAreaRequested < matConfig.minAreaM2) {
              billableTotalArea = matConfig.minAreaM2;
            }
            baseMaterialSubtotalARS = Math.round((matConfig.costARS || 7500) * 2.5 * billableTotalArea);
          } else if (matConfig.mode === 'metro_lineal') {
            const lengthMeters = Math.max(1, (Math.max(item.widthCm, item.heightCm)) / 100);
            baseMaterialSubtotalARS = Math.round((matConfig.costARS || 3200) * 2.5 * lengthMeters * qty);
          }
        }
        
        let printQualityCostARS = 0;
        if (item.printQuality === "alta_resolucion") {
          printQualityCostARS = Math.round((calculatedAreaM2 * qty) * 2500);
        } else if (item.printQuality === "fotografica") {
          printQualityCostARS = Math.round((calculatedAreaM2 * qty) * 4500);
        }
        
        let inkTypeCostARS = 0;
        if (item.inkType === "uv" || item.inkType === "directa_uv") {
          inkTypeCostARS = Math.round((calculatedAreaM2 * qty) * 4000);
        } else if (item.inkType === "latex") {
          inkTypeCostARS = Math.round((calculatedAreaM2 * qty) * 6000);
        }
        
        let finishingsCostARS = 0;
        if (item.finishings && item.finishings.length > 0) {
          const FINISHING_OPTIONS = [
            { id: "corte_a_medida", basePriceARS: 0, calculationType: "fijo" },
            { id: "corte_contorno", basePriceARS: 4500, calculationType: "metro_perimetral" },
            { id: "perforaciones_esquinas", basePriceARS: 1200, calculationType: "fijo" },
            { id: "bordes_pulidos", basePriceARS: 1500, calculationType: "fijo" },
            { id: "soldadura_bolsillo", basePriceARS: 1200, calculationType: "metro_lineal" },
            { id: "ojales_metalicos", basePriceARS: 1800, calculationType: "fijo" },
            { id: "laca_uv", basePriceARS: 3500, calculationType: "m2" },
            { id: "laminado_brillante", basePriceARS: 4500, calculationType: "m2" },
            { id: "laminado_mate", basePriceARS: 4800, calculationType: "m2" }
          ];
          for (const f of item.finishings) {
            const fDef = FINISHING_OPTIONS.find(o => o.id === f);
            if (fDef) {
              if (fDef.calculationType === "fijo") {
                finishingsCostARS += fDef.basePriceARS * qty;
              } else if (fDef.calculationType === "m2") {
                finishingsCostARS += fDef.basePriceARS * effectiveBillableAreaM2;
              } else if (fDef.calculationType === "metro_lineal") {
                finishingsCostARS += fDef.basePriceARS * Math.max(item.widthCm, item.heightCm) / 100 * qty;
              } else if (fDef.calculationType === "metro_perimetral") {
                finishingsCostARS += fDef.basePriceARS * ((item.widthCm * 2 + item.heightCm * 2) / 100) * qty;
              }
            }
          }
        }
        
        let subtotalARS = baseMaterialSubtotalARS + printQualityCostARS + inkTypeCostARS + finishingsCostARS;
        
        if (wholesaleTierRequested === "agencia") {
          subtotalARS = Math.round(subtotalARS * 0.90);
          transparencyNotes.push("Descuento B2B Agencia (-10%) aplicado.");
        } else if (wholesaleTierRequested === "partner") {
          subtotalARS = Math.round(subtotalARS * 0.85);
          transparencyNotes.push("Descuento Partner Revenda (-15%) aplicado.");
        }
        
        let unitPriceARS = Math.round(subtotalARS / qty);
        
        resultsMap[item.id] = {
          unitPriceARS,
          totalPriceARS: subtotalARS,
          calculatedAreaM2,
          effectiveBillableAreaM2,
          transparencyNotes,
          fullPlateWarning,
          platesCount
        };
      }
    }
    
    const results = items.map(item => resultsMap[item.id]);

    return res.json({
      success: true,
      results
    });
    
  } catch (err) {
    console.error('API Error in /api/quote-batch:', err);
    return res.status(500).json({ error: 'Error interno al procesar cotización de lote.' });
  }
});`;

  const finalContent = content.substring(0, startIdx) + newCode + content.substring(endIdx + endStr.length);
  fs.writeFileSync('server.ts', finalContent);
  console.log('Patched correctly');
} else {
  console.log('Could not find start or end', startIdx, endIdx);
}
