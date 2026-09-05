const fs = require('fs');

let content = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

// The HomeView has a hero gradient: `from-[#0C0D11] via-[#0C0D11]/60 to-transparent`
// I need to change these to support both light and dark modes
// dark mode: from-[#0C0D11] via-[#0C0D11]/60
// light mode: from-[#FAFAFC] via-[#FAFAFC]/60
content = content.replace(/from-\[#0C0D11\] via-\[#0C0D11\]\/60/g, "from-[#FAFAFC] dark:from-[#0C0D11] via-[#FAFAFC]/60 dark:via-[#0C0D11]/60");
content = content.replace(/bg-\[var\(--bg-page\)\]\/70/g, "bg-[#FAFAFC]/70 dark:bg-[#0C0D11]/70");

fs.writeFileSync('src/components/views/HomeView.tsx', content);
