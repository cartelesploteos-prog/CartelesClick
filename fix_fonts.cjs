const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/h2, \.text-canonical-h2 \{([\s\S]*?)font-weight: 700;/g, 'h2, .text-canonical-h2 {$1font-weight: 600;');
css = css.replace(/h3, \.text-canonical-h3 \{([\s\S]*?)font-weight: 700;/g, 'h3, .text-canonical-h3 {$1font-weight: 600;');
css = css.replace(/h4, \.text-canonical-h4 \{([\s\S]*?)font-weight: 700;/g, 'h4, .text-canonical-h4 {$1font-weight: 600;');
css = css.replace(/h5, \.text-canonical-h5 \{([\s\S]*?)font-weight: 700;/g, 'h5, .text-canonical-h5 {$1font-weight: 500;');

fs.writeFileSync('src/index.css', css);
