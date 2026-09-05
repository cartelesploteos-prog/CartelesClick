const fs = require('fs');
let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

file = file.replace(/printQuality: item.printQuality \|\| printQuality: item.printQuality \|\| printQuality,/g, 'printQuality: item.printQuality || printQuality,');
file = file.replace(/printQuality: item.printQuality \|\| printQuality,/g, 'printQuality: item.printQuality || printQuality,');

fs.writeFileSync('src/components/views/CotizadorView.tsx', file);
