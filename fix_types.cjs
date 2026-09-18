const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

const regex = /export type MaterialCategory =[^;]+;/m;
const newType = `export type MaterialCategory =
  | "gigantografias"
  | "carteles"
  | "corporeos"
  | "estampados"
  | "impresion_3d"
  | "todos";`;

code = code.replace(regex, newType);
fs.writeFileSync('src/types/index.ts', code);
