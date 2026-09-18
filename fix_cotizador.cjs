const fs = require('fs');

let code = fs.readFileSync('src/components/views/CotizadorView.tsx', 'utf8');

// 1. Remove selectedCategory
code = code.replace(/const \[selectedCategory, setSelectedCategory\] = useState<MaterialCategory>\("lonas"\);\n/g, '');

// 2. Replace selectedCategory with selectedMainFamily
code = code.replace(/selectedCategory/g, 'selectedMainFamily');

// 3. Update mainFamilies
const newMainFamilies = `const mainFamilies: { id: MainFamilyType; label: string; icon: any; desc: string; badge?: string }[] = [
    {
      id: "gigantografias",
      label: "Gigantografías",
      icon: Maximize2,
      desc: "Lonas, vinilos, papeles.",
      badge: "Gran Formato",
    },
    {
      id: "carteles",
      label: "Carteles",
      icon: Layers,
      desc: "Bastidores, montajes sobre rígidos, fondos de prensa.",
    },
    {
      id: "corporeos",
      label: "Corpóreos",
      icon: Box,
      desc: "Polyfan, acrílico, MDF, chapa.",
      badge: "Relieve 3D & Láser",
    },
    {
      id: "estampados",
      label: "Estampados",
      icon: Shirt,
      desc: "DTF Textil, sublimación, vinilo de corte.",
    },
    {
      id: "impresion_3d",
      label: "Impresión 3D",
      icon: Box,
      desc: "Prototipos, piezas a medida y corpóreos.",
    }
  ];`;
code = code.replace(/const mainFamilies:[\s\S]*?\];/m, newMainFamilies);

// 4. Remove subcategoriesByFamily and currentSubcategories
code = code.replace(/const subcategoriesByFamily:[\s\S]*?const currentSubcategories =[^;]+;/m, '');

// 5. Update stepTitles
code = code.replace(/const stepTitles = \[[^\]]+\];/, `const stepTitles = [
    "Línea de Producto",
    "Material y Sustrato",
    "Medidas y Cantidad",
    "Calidad de Impresión",
    "Terminaciones",
    "Diseño / Originales",
    "Entrega / Instalación",
    "Resumen de Orden"
  ];`);
code = code.replace(/const totalSteps = 9;/, 'const totalSteps = 8;');

// 6. Delete old currentStep === 2
code = code.replace(/\{currentStep === 2 && \([\s\S]*?\{currentStep === 3 && \(/m, '{currentStep === 3 && (');

// 7. Decrement currentStep checks
for (let i = 9; i >= 3; i--) {
  code = code.replace(new RegExp(`currentStep === ${i}`, 'g'), `currentStep === ${i - 1}`);
  code = code.replace(new RegExp(`setCurrentStep\\(${i}\\)`, 'g'), `setCurrentStep(${i - 1})`);
}

// 8. Fix the onClick in Step 1 to go to step 2 instead of 2 (wait, the old code had setCurrentStep(2) in step 1, which now should be 2. Let's see what it was: it was setCurrentStep(2). Now that step 2 is material, we just set it to 2.)
// Actually the old step 1 onClick went to step 2. We keep it 2. And the logic there needs to set material.
fs.writeFileSync('src/components/views/CotizadorView.tsx', code);
