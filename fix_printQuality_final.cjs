const fs = require('fs');
let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

// The places we WANT `printQuality: item.printQuality || printQuality` are when making the object payload
// Like `fetchServerQuote` body, `valResult`, `fetchBulkQuotes` mapping, and `addBatchToCart` item mapping.

file = file.replace(/printQuality,/g, 'printQuality,'); // No-op, just to verify we are back to baseline.

const lines = file.split('\n');

function replaceInBlock(startStr, endStr, oldContent, newContent) {
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startStr)) {
      inBlock = true;
    }
    if (inBlock && lines[i].includes(endStr)) {
      inBlock = false;
    }
    if (inBlock) {
       lines[i] = lines[i].replace(oldContent, newContent);
    }
  }
}

replaceInBlock('const valResult = validateQuoteParams', '});', 'printQuality,', 'printQuality: item.printQuality || printQuality,');
replaceInBlock('body: JSON.stringify', '}),', 'printQuality,', 'printQuality: item.printQuality || printQuality,');
replaceInBlock('const batchItems = bulkItems.map', '}));', 'printQuality,', 'printQuality: item.printQuality || printQuality,');
replaceInBlock('const newCartItems: CartItem[] = bulkItems.map', 'return {', 'printQuality,', 'printQuality: item.printQuality || printQuality,');

// for the bulkItems mapping in addBatchToCart, it's inside `return {`
let inCartMap = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const newCartItems: CartItem[] = bulkItems.map')) {
     inCartMap = true;
  }
  if (inCartMap && lines[i].includes('});')) {
     inCartMap = false;
  }
  if (inCartMap && lines[i].includes('printQuality,')) {
     lines[i] = lines[i].replace('printQuality,', 'printQuality: item.printQuality || printQuality,');
  }
}


fs.writeFileSync('src/components/views/CotizadorView.tsx', lines.join('\n'));
console.log("Done fine grained replacement");
