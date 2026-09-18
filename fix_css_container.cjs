const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const containerSafeCss = `
.container-safe {
  width: 100%;
  max-width: var(--container-fluid-max, 80rem);
  margin-left: auto;
  margin-right: auto;
  padding-left: clamp(4%, 4vw, 2rem);
  padding-right: clamp(4%, 4vw, 2rem);
}
`;

css += containerSafeCss;
fs.writeFileSync('src/index.css', css);
