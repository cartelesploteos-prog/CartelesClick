const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/h2, \.text-canonical-h2 \{\n(.*?)\n    font-weight: 700;\n  \}/s, 'h2, .text-canonical-h2 {\n$1\n    font-weight: 600;\n  }');
css = css.replace(/h3, \.text-canonical-h3 \{\n(.*?)\n    font-weight: 700;\n  \}/s, 'h3, .text-canonical-h3 {\n$1\n    font-weight: 600;\n  }');
css = css.replace(/h4, \.text-canonical-h4 \{\n(.*?)\n    font-weight: 700;\n  \}/s, 'h4, .text-canonical-h4 {\n$1\n    font-weight: 600;\n  }');
css = css.replace(/h5, \.text-canonical-h5 \{\n(.*?)\n    font-weight: 700;\n  \}/s, 'h5, .text-canonical-h5 {\n$1\n    font-weight: 500;\n  }');

fs.writeFileSync('src/index.css', css);
