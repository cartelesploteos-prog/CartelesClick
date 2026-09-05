const fs = require('fs');

let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

const oldCode = `      try {
        const promises = bulkItems.map(async (item) => {
          const val = validateQuoteParams({
            materialId: selectedMaterialId,
            widthCm: currentMaterial?.mode !== "unidad" ? item.widthCm : 100,
            heightCm: currentMaterial?.mode !== "unidad" ? item.heightCm : 100,
            quantity: item.quantity,
            printQuality,
            inkType: item.inkType || inkType,
            selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
            mountOption: enableMounting ? selectedMount : undefined,
            finishings: item.finishings || selectedFinishings,
          });
          if (!val.success) {
            return {
              ...item,
              quoteData: null,
              error: val.firstError,
              isLoading: false,
            };
          }
          try {
            const resp = await fetch("/api/quote", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                materialId: selectedMaterialId,
                widthCm: currentMaterial?.mode !== "unidad" ? item.widthCm : undefined,
                heightCm: currentMaterial?.mode !== "unidad" ? item.heightCm : undefined,
                quantity: item.quantity,
                printQuality,
                inkType: item.inkType || inkType,
                selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
                mountOption: enableMounting ? selectedMount : undefined,
                finishings: item.finishings || selectedFinishings,
              }),
            });
            if (!resp.ok) {
              return { ...item, quoteData: null, error: "Error en servidor", isLoading: false };
            }
            const data: QuoteResponsePayload = await resp.json();
            return { ...item, quoteData: data, error: null, isLoading: false };
          } catch (err: any) {
            return { ...item, quoteData: null, error: err.message, isLoading: false };
          }
        });

        const updated = await Promise.all(promises);
        if (isMounted) {
          setBulkItems(updated);
        }
      } catch (err: any) {`;

const newCode = `      try {
        const batchItems = bulkItems.map(item => ({
          id: item.id,
          widthCm: currentMaterial?.mode !== "unidad" ? item.widthCm : 100,
          heightCm: currentMaterial?.mode !== "unidad" ? item.heightCm : 100,
          quantity: item.quantity,
          printQuality,
          inkType: item.inkType || inkType,
          selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
          finishings: item.finishings || selectedFinishings,
          isAiDesign: item.isAiDesign
        }));
        
        const resp = await fetch("/api/quote-batch", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             materialId: selectedMaterialId,
             items: batchItems,
             wholesaleTierRequested: undefined,
             mountOption: enableMounting ? selectedMount : undefined
           })
        });
        
        if (!resp.ok) {
          throw new Error("Error en servidor al computar lote");
        }
        const data = await resp.json();
        
        const updated = bulkItems.map(item => {
           const result = data.results.find((r: any) => r.id === item.id);
           return {
             ...item,
             quoteData: result ? result.quoteData : null,
             error: null,
             isLoading: false
           };
        });

        if (isMounted) {
          setBulkItems(updated);
        }
      } catch (err: any) {`;

if (file.includes(oldCode)) {
  file = file.replace(oldCode, newCode);
  fs.writeFileSync('src/components/views/CotizadorView.tsx', file);
  console.log("Patched successfully");
} else {
  console.log("Could not find old code. Writing to a temp file for inspection.");
  fs.writeFileSync('oldcode.txt', oldCode);
}
