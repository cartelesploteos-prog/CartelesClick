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
  // SLATE
  { regex: /slate-950/g, to: '[#151720]' },
  { regex: /slate-900/g, to: '[#151720]' },
  { regex: /slate-800/g, to: '[#242834]' },
  { regex: /slate-700/g, to: '[#2d3242]' },
  { regex: /slate-600/g, to: '[#3b4254]' },
  { regex: /slate-500/g, to: '[#56607a]' },
  { regex: /slate-400/g, to: '[#9da5bc]' },
  { regex: /slate-300/g, to: '[#e2e5ee]' },
  { regex: /slate-200/g, to: '[#eeeff6]' },
  { regex: /slate-100/g, to: '[#f7f8fc]' },
  { regex: /slate-50/g, to: 'white' },

  // SKY (Purple)
  { regex: /sky-200/g, to: '[#cbbaff]' },
  
  // AMBER / EMERALD (Lime)
  { regex: /amber-200/g, to: '[#e6ff99]' },
  { regex: /emerald-200/g, to: '[#e6ff99]' },

  { regex: /gray-200/g, to: '[#eeeff6]' },
  { regex: /zinc-200/g, to: '[#eeeff6]' },
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
