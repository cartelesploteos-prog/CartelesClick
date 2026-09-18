const { execSync } = require('child_process');
const fs = require('fs');

const files = execSync('find src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Quick regex to strip inline typography overrides from headers
    content = content.replace(/<h1 className="[^"]*"/g, '<h1 className="text-canonical-h1"');
    content = content.replace(/<h2 className="[^"]*"/g, '<h2 className="text-canonical-h2"');
    content = content.replace(/<h3 className="[^"]*"/g, '<h3 className="text-canonical-h3"');
    content = content.replace(/<h4 className="[^"]*"/g, '<h4 className="text-canonical-h4"');
    
    fs.writeFileSync(file, content);
});

console.log("Typography canonicalized.");
