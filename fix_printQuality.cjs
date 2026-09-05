const fs = require('fs');
let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

file = file.replace(/printQuality,/g, 'printQuality: item.printQuality || printQuality,');

// Specifically handle the bulk creation logic in addBatchToCart
// we also need to fix fetchBulkQuotes
fs.writeFileSync('src/components/views/CotizadorView.tsx', file);
console.log("Replaced printQuality");
