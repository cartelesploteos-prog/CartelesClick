const fs = require('fs');
let file = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');
const oldCode = `            <button
              onClick={() => onNavigate("cotizador")}
              className="cta-border-beam relative overflow-hidden px-5 py-2.5 rounded-full bg-[#FF5520] hover:bg-[#FF6B38] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Calculator className="w-4 h-4" />
              <span>Abrir Cotizador Avanzado</span>
              <ArrowRight className="w-4 h-4" />
              <BorderBeam
                size={38}
                initialOffset={15}              
              />
            </button>`;

const newCode = `            <CTAButton
              onClick={() => onNavigate("cotizador")}
              className="!px-5 !py-2.5 !text-xs shrink-0"
            >
              <Calculator className="w-4 h-4" />
              <span>Abrir Cotizador Avanzado</span>
              <ArrowRight className="w-4 h-4" />
            </CTAButton>`;

file = file.replace(oldCode, newCode);
fs.writeFileSync('src/components/views/HomeView.tsx', file);
console.log("Replaced 1");
