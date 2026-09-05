const fs = require('fs');
let file = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

// I will just use sed to replace the rendering logic for materials
