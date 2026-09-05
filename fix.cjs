const fs = require('fs');
let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

const oldCode = `        inkType: item.inkType || inkType,
        selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
        mountOption: enableMounting ? selectedMount : undefined,
        finishings: item.finishings || selectedFinishings,`;

const newCode = `        inkType,
        selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
        mountOption: enableMounting ? selectedMount : undefined,
        finishings: selectedFinishings,`;

// We replace the first two occurrences of oldCode (inside fetchServerQuote)
let count = 0;
file = file.replace(new RegExp(oldCode.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), match => {
  count++;
  if (count <= 2) return newCode;
  return match;
});

fs.writeFileSync('src/components/views/CotizadorView.tsx', file);
console.log("Fixed occurrences:", count);
