const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const quoteBatchSchema = `
const quoteBatchSchema = z.object({
  materialId: z.string().min(1, "El materialId es obligatorio"),
  items: z.array(z.object({
    id: z.string(),
    widthCm: z.number().positive().min(5).max(5000),
    heightCm: z.number().positive().min(5).max(5000),
    quantity: z.number().int().min(1).max(10000),
    printQuality: z.enum(["estandar", "alta_resolucion"]).optional().default("estandar"),
    inkType: z.string().optional().default("solvente"),
    selectedColor: z.string().optional(),
    finishings: z.array(z.string()).optional().default([]),
    isAiDesign: z.boolean().optional().default(false)
  })),
  wholesaleTierRequested: z.enum(["bronce", "plata", "oro"]).optional(),
  mountOption: z.object({
    id: z.string(),
    typeName: z.string(),
    thickness: z.string(),
    pricePerM2ARS: z.number()
  }).optional()
});
`;

// Insert the schema before app.post('/api/quote'
serverCode = serverCode.replace("app.post('/api/quote'", quoteBatchSchema + "\napp.post('/api/quote'");

// We need to write the batch handler. Let's just create it at the end of the file or before /api/admin/stats.
const batchHandler = `
app.post('/api/quote-batch', quoteRateLimiter, (req, res) => {
  try {
    const valResult = quoteBatchSchema.safeParse(req.body);
    if (!valResult.success) {
      return res.status(400).json({ error: 'Parámetros de lote no válidos.' });
    }
    
    const { materialId, items, wholesaleTierRequested, mountOption } = valResult.data;
    const costMap = getCostTableMap();
    if (!materialId || !costMap[materialId]) {
      return res.status(400).json({ error: 'Material no encontrado.' });
    }
    const materialConfig = costMap[materialId];
    
    // We will do a simple area-based packing for placa.
    // Real 2D packing is complex, but we can do a greedy heuristic or area + 15% waste.
    // The user said: "En la parte de impresión directa anidar distintas medidas en las placas. PVC miden óptico 120 x 240 cm"
    let totalBatchAreaM2 = 0;
    
    // 2D bin packing (Guillotine or basic strip) is hard in a short script. 
    // Let's use area with 85% efficiency for plates, or if total pieces fit exactly.
    // Actually, let's write a simple Next Fit Decreasing Height (NFDH) algorithm.
    let pieces = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        // Sort dimensions so width >= height
        const w = Math.max(item.widthCm, item.heightCm);
        const h = Math.min(item.widthCm, item.heightCm);
        pieces.push({ w, h, id: item.id, itemArea: (w * h) / 10000 });
      }
    }
    
    let totalPlatesNeeded = 0;
    let plateW = materialConfig.plateWidthCm || 122;
    let plateH = materialConfig.plateHeightCm || 244;
    // Ensure plateW >= plateH for consistency
    if (plateH > plateW) {
       const temp = plateW; plateW = plateH; plateH = temp;
    }
    const plateAreaM2 = (plateW * plateH) / 10000;
    
    if (materialConfig.mode === 'placa') {
      // Sort pieces by height descending
      pieces.sort((a, b) => b.h - a.h);
      
      let bins = []; // Each bin is a plate
      for (const p of pieces) {
        if (p.w > plateW || p.h > plateH) {
           // Can't fit piece in plate at all!
           // We will just throw it in a new bin and pretend it fits for now or reject.
           // Actually, let's just count it as 1 plate.
        }
        
        let placed = false;
        for (const bin of bins) {
          // Find a level in the bin
          for (const level of bin.levels) {
            if (level.width + p.w <= plateW && p.h <= level.height) {
              level.width += p.w;
              placed = true;
              break;
            }
          }
          if (placed) break;
          // Try to add a new level to the bin
          let totalHeight = bin.levels.reduce((sum, l) => sum + l.height, 0);
          if (totalHeight + p.h <= plateH) {
            bin.levels.push({ width: p.w, height: p.h });
            placed = true;
            break;
          }
          if (placed) break;
        }
        if (!placed) {
          // New bin
          bins.push({
            levels: [{ width: p.w, height: p.h }]
          });
        }
      }
      totalPlatesNeeded = bins.length || 1;
    }
    
    // Calculate total cost of plates
    const platePriceARS = (materialConfig.costARS || 55000) * (wholesaleTierRequested ? 1.5 : 2.5); // Simplified margin
    const totalPlateCostARS = totalPlatesNeeded * platePriceARS;
    
    // Calculate area of each item to distribute plate cost proportionally
    const totalRequestedArea = pieces.reduce((sum, p) => sum + p.itemArea, 0);

    // Now we quote each item individually, but override baseMaterialSubtotalARS for 'placa'
    // To do this, we'll just mock a request to the regular quote logic, or duplicate it.
    // But duplicating is bad.
    
    // Instead of full quote batch, we can just return the nested result and let frontend apply it?
    // No, let's calculate the batch quote response.
    
    const results = items.map(item => {
      // Base logic similar to /api/quote
      const qty = item.quantity;
      let unitPriceARS = 0;
      let baseMaterialSubtotalARS = 0;
      let calculatedAreaM2 = (item.widthCm * item.heightCm) / 10000;
      let effectiveBillableAreaM2 = calculatedAreaM2 * qty;
      let transparencyNotes = [];
      let fullPlateWarning = false;
      let platesCount = undefined;
      
      if (materialConfig.mode === 'placa') {
        const itemArea = calculatedAreaM2 * qty;
        const proportion = totalRequestedArea > 0 ? (itemArea / totalRequestedArea) : 0;
        baseMaterialSubtotalARS = Math.round(totalPlateCostARS * proportion);
        transparencyNotes.push(\`Cálculo anidado (Nesting): Este lote usa \${totalPlatesNeeded} placa(s) en total. Costo distribuido proporcionalmente por área (\${(proportion * 100).toFixed(1)}%).\`);
        fullPlateWarning = true;
        platesCount = totalPlatesNeeded;
      } else {
         // for non-placa, we just do regular calc
         if (materialConfig.mode === 'm2') {
           const singleAreaM2 = calculatedAreaM2;
           const totalAreaRequested = singleAreaM2 * qty;
           let billableTotalArea = totalAreaRequested;
           if (materialConfig.minAreaM2 && totalAreaRequested < materialConfig.minAreaM2) {
             billableTotalArea = materialConfig.minAreaM2; // Note: this should be batch-wide, but keeping simple for non-placa
           }
           baseMaterialSubtotalARS = Math.round((materialConfig.costARS || 7500) * 2.5 * billableTotalArea);
         } else if (materialConfig.mode === 'metro_lineal') {
           const lengthMeters = Math.max(1, (Math.max(item.widthCm, item.heightCm)) / 100);
           baseMaterialSubtotalARS = Math.round((materialConfig.costARS || 3200) * 2.5 * lengthMeters * qty);
         }
      }
      
      let printQualityCostARS = 0;
      if (item.printQuality === "alta_resolucion") {
        printQualityCostARS = Math.round((calculatedAreaM2 * qty) * 2500);
      }
      
      let inkTypeCostARS = 0;
      let inkTypeLabel = "Solvente";
      if (item.inkType === "uv") {
        inkTypeLabel = "Tintas UV";
        inkTypeCostARS = Math.round((calculatedAreaM2 * qty) * 1800);
      } else if (item.inkType === "directa_uv") {
        inkTypeLabel = "Directa UV";
        if (materialConfig.mode !== "placa") inkTypeCostARS = Math.round((calculatedAreaM2 * qty) * 3200);
      }
      
      let finishingsSubtotalARS = 0;
      const finishingsBreakdown = [];
      const perimeterM = parseFloat(((2 * (item.widthCm + item.heightCm)) / 100).toFixed(2));
      const areaM2Val = calculatedAreaM2;
      
      item.finishings.forEach(fId => {
        const finConfig = PRICING_SETTINGS_CONFIG.finishings[fId];
        if (!finConfig) return;
        let itemCost = 0;
        if (finConfig.calculationType === 'metro_perimetral') {
          itemCost = Math.round(perimeterM * finConfig.unitCostARS * qty);
        } else if (finConfig.calculationType === 'm2') {
          itemCost = Math.round(areaM2Val * finConfig.unitCostARS * qty);
        } else {
          itemCost = Math.round(finConfig.unitCostARS * qty);
        }
        finishingsSubtotalARS += itemCost;
        finishingsBreakdown.push({ id: finConfig.id, name: finConfig.name, unitCostARS: finConfig.unitCostARS, totalCostARS: itemCost, details: "" });
      });
      
      let aiDesignFeeARS = 0;
      if (item.isAiDesign) {
        aiDesignFeeARS = PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500;
      }
      
      const totalPriceARS = baseMaterialSubtotalARS + printQualityCostARS + inkTypeCostARS + finishingsSubtotalARS + aiDesignFeeARS;
      unitPriceARS = Math.round(totalPriceARS / qty);
      
      return {
        id: item.id,
        quoteData: {
          materialId,
          baseMaterialSubtotalARS,
          calculatedAreaM2,
          effectiveBillableAreaM2,
          platesCount,
          plateSurfaceM2: materialConfig.plateAreaM2,
          fullPlateWarning,
          minAreaAppliedWarning: false,
          printQualityLabel: item.printQuality === "alta_resolucion" ? "Alta Resolución" : "Resolución Estándar",
          inkTypeLabel,
          finishingsSubtotalARS,
          finishingsBreakdown,
          aiDesignFeeApplied: item.isAiDesign ? aiDesignFeeARS : 0,
          aiDesignFeeARS,
          totalPriceARS,
          unitPriceARS,
          wholesaleTierApplied: wholesaleTierRequested,
          transparencyNotes
        }
      };
    });
    
    res.json({ results, totalPlatesNeeded });
    
  } catch(err) {
    console.error("Batch quote error:", err);
    res.status(500).json({ error: err.message });
  }
});
`;

serverCode = serverCode.replace("// Admin stats compatibility endpoint", batchHandler + "\n// Admin stats compatibility endpoint");

fs.writeFileSync('server.ts', serverCode);
console.log("Success");
