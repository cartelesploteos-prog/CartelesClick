const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') return;
    }
  });
  return filelist;
};

const files = walkSync('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

// Maps
const replacements = [
  // SLATE / NEUTRAL -> TEXT & BG
  { regex: /text-slate-900/g, to: 'text-[var(--text-primary)]' },
  { regex: /text-slate-800/g, to: 'text-[var(--text-primary)]' },
  { regex: /text-slate-700/g, to: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-600/g, to: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-500/g, to: 'text-[var(--text-muted)]' },
  { regex: /text-slate-400/g, to: 'text-[var(--text-muted)]' },
  { regex: /text-slate-300/g, to: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-200/g, to: 'text-[var(--text-primary)]' },
  { regex: /text-slate-100/g, to: 'text-white' },
  { regex: /text-slate-50/g, to: 'text-white' },

  { regex: /bg-slate-950/g, to: 'bg-[#151720]' },
  { regex: /bg-slate-900/g, to: 'bg-[#151720]' },
  { regex: /bg-slate-800/g, to: 'bg-[#242834]' },
  { regex: /bg-slate-700/g, to: 'bg-[#2d3242]' },
  { regex: /bg-slate-100/g, to: 'bg-[#eeeff6]' },
  { regex: /bg-slate-50/g, to: 'bg-[#f7f8fc]' },

  { regex: /border-slate-800/g, to: 'border-[var(--border-strong)]' },
  { regex: /border-slate-700/g, to: 'border-[var(--border-strong)]' },
  { regex: /border-slate-300/g, to: 'border-[var(--border-subtle)]' },
  { regex: /border-slate-200/g, to: 'border-[var(--border-subtle)]' },
  { regex: /border-slate-100/g, to: 'border-[var(--border-subtle)]' },
  
  // SKY / PURPLE -> PURPLE (#7D53FF)
  { regex: /sky-500/g, to: '[#7D53FF]' },
  { regex: /sky-600/g, to: '[#6739f5]' },
  { regex: /sky-400/g, to: '[#9b7aff]' },
  { regex: /sky-300/g, to: '[#b69dff]' },
  { regex: /sky-700/g, to: '[#5a28e5]' },
  { regex: /sky-800/g, to: '[#4d22c4]' },
  { regex: /sky-900/g, to: '[#3a1a94]' },
  { regex: /sky-950/g, to: '[#2a126b]' },
  { regex: /sky-100/g, to: '[#e5dcff]' },
  { regex: /sky-50/g, to: '[#f2eeff]' },

  { regex: /purple-500/g, to: '[#7D53FF]' },
  { regex: /purple-600/g, to: '[#6739f5]' },
  { regex: /purple-400/g, to: '[#9b7aff]' },
  { regex: /purple-300/g, to: '[#b69dff]' },
  { regex: /purple-800/g, to: '[#4d22c4]' },
  { regex: /purple-900/g, to: '[#3a1a94]' },
  { regex: /purple-100/g, to: '[#e5dcff]' },

  // AMBER / EMERALD -> LIME (#B6FF00)
  { regex: /amber-500/g, to: '[#B6FF00]' },
  { regex: /amber-600/g, to: '[#9acc00]' },
  { regex: /amber-400/g, to: '[#c9ff33]' },
  { regex: /amber-300/g, to: '[#d8ff66]' },
  { regex: /amber-700/g, to: '[#7a9900]' },
  { regex: /amber-800/g, to: '[#5c7300]' },
  { regex: /amber-900/g, to: '[#3d4c00]' },
  { regex: /amber-950/g, to: '[#2e3900]' },
  { regex: /amber-100/g, to: '[#f0ffcc]' },
  { regex: /amber-50/g, to: '[#f8ffe5]' },

  { regex: /emerald-500/g, to: '[#B6FF00]' },
  { regex: /emerald-600/g, to: '[#9acc00]' },
  { regex: /emerald-400/g, to: '[#c9ff33]' },
  { regex: /emerald-300/g, to: '[#d8ff66]' },
  { regex: /emerald-700/g, to: '[#7a9900]' },
  { regex: /emerald-800/g, to: '[#5c7300]' },
  { regex: /emerald-900/g, to: '[#3d4c00]' },
  { regex: /emerald-950/g, to: '[#2e3900]' },
  { regex: /emerald-100/g, to: '[#f0ffcc]' },
  { regex: /emerald-50/g, to: '[#f8ffe5]' },

  // ROSE
  { regex: /rose-500/g, to: 'red-500' }, // Errors should stay red
  { regex: /rose-950/g, to: 'red-950' },
  { regex: /rose-50/g, to: 'red-50' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({regex, to}) => {
    content = content.replace(regex, to);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
