const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredPaths = [
  'release/win-unpacked/MathNova.exe',
  'release/win-unpacked/resources/app.asar',
  'release/win-unpacked/resources/client/dist/index.html',
  'release/win-unpacked/resources/server/dist/index.js',
  'release/win-unpacked/resources/server/.env',
  'release/win-unpacked/resources/icon.png',
  'release/MathNova Setup 1.0.0.exe',
];

const missing = requiredPaths.filter((item) => !fs.existsSync(path.join(root, item)));
if (missing.length) {
  console.error(`Faltan recursos del release:\n${missing.join('\n')}`);
  process.exit(1);
}

const env = fs.readFileSync(
  path.join(root, 'release/win-unpacked/resources/server/.env'),
  'utf8',
);
for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!new RegExp(`^${key}=.+$`, 'm').test(env)) {
    console.error(`Falta ${key} en la configuración empaquetada.`);
    process.exit(1);
  }
}

const installer = fs.statSync(path.join(root, 'release/MathNova Setup 1.0.0.exe'));
console.log(`Release Windows verificado (${(installer.size / 1024 / 1024).toFixed(1)} MB).`);
