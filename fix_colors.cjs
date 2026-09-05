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
  
  // Replace arbitrary hex colors with logical names or remove them to rely on standard tailwind classes.
  // Dark mode text overrides: dark:text-[#...] -> dark:text-white
  content = content.replace(/dark:text-\[#[a-fA-F0-9]+\](\/[0-9]+)?/g, 'dark:text-white');
  // Light mode text overrides: text-[#...] -> text-black (unless it's primary/accent, let's just make them primary or text-black)
  // Let's do a more intelligent replace for specific known colors if we want, or just strip them.
  // For purple-ish / cyan-ish text:
  content = content.replace(/text-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\]/gi, 'text-primary');
  // For lime-ish text:
  content = content.replace(/text-\[#(B6FF00|c9ff33|d8ff66|7a9900)\]/gi, 'text-accent');
  // Other text colors to black
  content = content.replace(/text-\[#[a-fA-F0-9]+\](\/[0-9]+)?/g, ''); // just remove them so it inherits

  // Backgrounds:
  content = content.replace(/dark:bg-\[#(151720|242834|2d3242|373d4f|111111)\](\/[0-9]+)?/gi, 'dark:bg-black');
  content = content.replace(/bg-\[#(f7f8fc|eeeff6|ffffff|e2e5ee|f4f4f5)\](\/[0-9]+)?/gi, 'bg-white');
  content = content.replace(/dark:bg-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'dark:bg-primary');
  content = content.replace(/bg-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'bg-primary');
  content = content.replace(/dark:bg-\[#(B6FF00|c9ff33|d8ff66|7a9900|2e3900|3d4c00)\](\/[0-9]+)?/gi, 'dark:bg-accent');
  content = content.replace(/bg-\[#(B6FF00|c9ff33|d8ff66|7a9900|f8ffe5|f0ffcc)\](\/[0-9]+)?/gi, 'bg-accent');
  // Other generic bgs
  content = content.replace(/bg-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/dark:bg-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');

  // Borders:
  content = content.replace(/border-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'border-primary');
  content = content.replace(/dark:border-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'dark:border-primary');
  content = content.replace(/border-\[#(B6FF00|c9ff33|d8ff66|7a9900)\](\/[0-9]+)?/gi, 'border-accent');
  content = content.replace(/dark:border-\[#(B6FF00|c9ff33|d8ff66|7a9900)\](\/[0-9]+)?/gi, 'dark:border-accent');
  content = content.replace(/border-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/dark:border-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');

  // Shadows:
  content = content.replace(/shadow-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'shadow-primary');
  content = content.replace(/shadow-\[#(B6FF00|c9ff33|d8ff66|7a9900)\](\/[0-9]+)?/gi, 'shadow-accent');
  content = content.replace(/shadow-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');

  // Hover states
  content = content.replace(/hover:bg-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/hover:text-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/hover:border-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');

  // Focus rings
  content = content.replace(/focus-visible:ring-\[#(5a28e5|7D53FF|9b7aff|c3afff|6739f5|8f6eff)\](\/[0-9]+)?/gi, 'focus-visible:ring-primary');
  content = content.replace(/focus-visible:ring-\[#(B6FF00|c9ff33|d8ff66|7a9900)\](\/[0-9]+)?/gi, 'focus-visible:ring-accent');
  content = content.replace(/focus-visible:ring-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/focus:ring-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/ring-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');
  content = content.replace(/dark:ring-\[#[a-fA-F0-9]+\](\/[0-9]+)?/gi, '');

  // Clean up multiple spaces that might have been created
  content = content.replace(/\s{2,}/g, ' ');
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/\s+"/g, '"');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Colors normalized!');
