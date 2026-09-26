// Menyalin file Capacitor (versi <script> biasa) ke www/vendor agar bisa dipakai tanpa bundler.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www', 'vendor');
fs.mkdirSync(out, { recursive: true });

const files = {
  'capacitor.js': 'node_modules/@capacitor/core/dist/capacitor.js',
  'tts.js': 'node_modules/@capacitor-community/text-to-speech/dist/plugin.js',
  'app.js': 'node_modules/@capacitor/app/dist/plugin.js',
};

for (const [name, src] of Object.entries(files)) {
  const code = fs.readFileSync(path.join(root, src), 'utf8').replace(/\/\/# sourceMappingURL=.*$/m, '');
  fs.writeFileSync(path.join(out, name), code);
  console.log('vendor:', name);
}
