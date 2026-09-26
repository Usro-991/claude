// Pemeriksaan cepat: sintaks semua file JS dan setiap layar yang dipakai benar-benar terdaftar.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'www', 'js');
let src = '';
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  new vm.Script(code, { filename: f }); // melempar error bila sintaks salah
  src += code + '\n';
}

const defined = new Set([...src.matchAll(/Screens\['([\w-]+)'\]\s*=/g)].map((m) => m[1]));
const used = new Set([...src.matchAll(/go\('([\w-]+)'/g)].map((m) => m[1]));
for (const m of src.matchAll(/\['([\w-]+)',\s*(?:\{[^}]*\}|'[^']*'),/g)) if (/-|^(draw|memory|balloon|learn)$/.test(m[1])) used.add(m[1]);

const missing = [...used].filter((s) => !defined.has(s));
if (missing.length) {
  console.error('Layar belum didefinisikan:', missing.join(', '));
  process.exit(1);
}
console.log(`OK: ${defined.size} layar terdaftar, semua referensi valid.`);
