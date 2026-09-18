const fs = require('fs');

let code = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

// Remove the duplicate selectedMainFamily declaration
code = code.replace(/const \[selectedMainFamily, setSelectedCategory\] = useState<MaterialCategory>\("carteles"\);\n/g, '');

// Fix the Sustrato para line
code = code.replace(/Sustrato para \{currentSubcategories\.find\(\(c\) => c\.id === selectedMainFamily\)\?\.label \|\| selectedMainFamily\}/g, 'Sustrato para {mainFamilies.find((f) => f.id === selectedMainFamily)?.label || selectedMainFamily}');

fs.writeFileSync('src/components/views/CotizadorView.tsx', code);
