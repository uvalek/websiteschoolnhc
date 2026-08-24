// Imprime una linea del reporte de optimizacion.
// argv: etiqueta, rutaAntes, rutaDespues, dimsAntes, dimsDespues
const fs = require('fs');
const [etiqueta, antes, despues, dimA, dimB] = process.argv.slice(2);
const kb = n => (n / 1024).toFixed(0).padStart(6) + ' KB';
const a = fs.statSync(antes).size, b = fs.statSync(despues).size;
const pct = Math.round(100 - (b * 100) / a);
const marca = pct > 80 ? ' (*)' : '';
console.log(
  etiqueta.padEnd(22) + kb(a) + ' -> ' + kb(b) +
  ('  -' + pct + '%').padEnd(9) + (dimA + ' -> ' + dimB).padEnd(26) + marca
);
