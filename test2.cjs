const fs = require('fs');
const code = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');
const cat = code.match(/selectedCategory/g);
console.log(cat ? cat.length : 0);
