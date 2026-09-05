const fs = require('fs');
const path = require('path');

const walk = function(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove bento glows completely
  content = content.replace(/bento-glow-[a-z]+/g, '');

  // Remove opacities from primary/accent bg to enforce strict 30/10
  content = content.replace(/bg-primary\/[0-9]+/g, 'bg-primary text-white');
  content = content.replace(/bg-accent\/[0-9]+/g, 'bg-accent text-black');

  // Ensure text uses strictly the 60/30/10 colors
  content = content.replace(/text-\[var\(--text-secondary\)]/g, 'text-[var(--text-primary)]');
  content = content.replace(/dark:text-\[var\(--text-secondary\)]/g, 'dark:text-white');
  content = content.replace(/text-\[var\(--text-muted\)]/g, 'text-[var(--text-primary)]');
  content = content.replace(/dark:text-\[var\(--text-muted\)]/g, 'dark:text-white');

  // Some text colors might be primary-hover or accent-hover, let's strictly use primary and accent
  content = content.replace(/text-primary-hover/g, 'text-primary');
  content = content.replace(/bg-primary-hover/g, 'bg-primary');
  content = content.replace(/text-accent-hover/g, 'text-accent');
  content = content.replace(/bg-accent-hover/g, 'bg-accent');
  
  // Clean up duplicate spaces
  content = content.replace(/\s{2,}/g, ' ');
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/\s+"/g, '"');

  fs.writeFileSync(file, content, 'utf8');
});

// Also fix index.css to remove muted and secondary colors so it defaults to solid black/white
let css = fs.readFileSync('./src/index.css', 'utf8');
css = css.replace(/--text-secondary:.*/g, '--text-secondary: var(--text-primary);');
css = css.replace(/--text-muted:.*/g, '--text-muted: var(--text-primary);');
css = css.replace(/--bg-surface-subtle:.*/g, '--bg-surface-subtle: transparent;');
css = css.replace(/--bg-surface-elevated:.*/g, '--bg-surface-elevated: var(--bg-surface);');
fs.writeFileSync('./src/index.css', css, 'utf8');

console.log('Strict 60-30-10 applied!');
