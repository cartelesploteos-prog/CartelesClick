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
  // Primary Buttons & Elements
  { regex: /bg-\[#7D53FF\]/g, to: 'bg-primary' },
  { regex: /hover:bg-\[#6739f5\]/g, to: 'hover:bg-primary-hover' },
  
  { regex: /bg-\[#6739f5\]/g, to: 'bg-primary-hover' },
  { regex: /hover:bg-\[#7D53FF\]/g, to: 'hover:bg-primary' },
  
  { regex: /text-\[#7D53FF\]/g, to: 'text-primary' },
  { regex: /text-\[#6739f5\]/g, to: 'text-primary-hover' },
  
  { regex: /border-\[#7D53FF\]/g, to: 'border-primary' },

  // Accent Elements
  { regex: /bg-\[#B6FF00\]/g, to: 'bg-accent' },
  { regex: /hover:bg-\[#c9ff33\]/g, to: 'hover:bg-accent-hover' }, // c9ff33 or similar
  
  { regex: /text-\[#B6FF00\]/g, to: 'text-accent' },
  { regex: /border-\[#B6FF00\]/g, to: 'border-accent' },
  
  // Shadows (replace manual specific shadows with token shadows where possible)
  { regex: /shadow-lg shadow-\[#6739f5\]\/25/g, to: 'shadow-cta hover:shadow-cta-hover' },
  { regex: /shadow-md shadow-\[#6739f5\]\/20/g, to: 'shadow-cta' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({regex, to}) => {
    content = content.replace(regex, to);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated tokens in ${file}`);
  }
});
