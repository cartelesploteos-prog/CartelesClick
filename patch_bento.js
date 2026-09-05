const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const bentoCellCode = `
const BentoGridCell = React.memo(({ 
  item, 
  onNavigate, 
  setSelectedItemDetail, 
  handleCopyPrompt, 
  copiedPromptId 
}: any) => {
  return (
    <div
      className="ideogram-card overflow-hidden group relative flex flex-col justify-between"
      style={{ borderRadius: '7px' }}
    >
      <div className="relative aspect-video sm:aspect-square overflow-hidden bg-[#181A22]">
        <img
          src={item.image}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-[7px] bg-black/75 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 shadow-sm">
            {item.aspectRatio} · {item.aspectRatioLabel}
          </span>
          <span className="px-2.5 py-1 rounded-[7px] bg-[#FF5520]/90 backdrop-blur-md text-white text-[10px] font-semibold shadow-sm">
            {item.material}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D11] via-[#0C0D11]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 space-y-3">
          <p className="text-xs text-white line-clamp-2 leading-relaxed">
            "{item.prompt}"
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("poster", encodeURIComponent(item.prompt))}
              className="flex-1 py-2 rounded-[7px] bg-[#FF5520] hover:bg-[#FF6B38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Remix en Creator</span>
            </button>
            <button
              onClick={() => onNavigate("cotizador", item.materialId)}
              className="py-2 px-3 rounded-[7px] bg-white/[0.15] hover:bg-white/[0.25] text-white text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-md transition-all active:scale-95"
              title="Cotizar m² en vivo"
            >
              <Calculator className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedItemDetail(item)}
              className="py-2 px-3 rounded-[7px] bg-white/[0.15] hover:bg-white/[0.25] text-white text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-md transition-all active:scale-95"
              title="Ver Detalle"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white truncate max-w-[200px]">
            {item.title}
          </span>
          <span className="text-[11px] text-[#949BA4]">{item.author}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>{item.material}</span>
          <button
            onClick={() => handleCopyPrompt(item.prompt, item.id)}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            {copiedPromptId === item.id ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
`;

code = code.replace("export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {", bentoCellCode + "\nexport const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {");

const startIdx = code.indexOf('{filteredExplore.map((item) => (');
const endIdx = code.indexOf('</div>', startIdx) + '</div>'.length; // that is just the first div close, wait...
