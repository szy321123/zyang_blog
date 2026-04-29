/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

const root = path.resolve(__dirname, '..');
const butterflyConfigPath = path.join(root, '_config.butterfly.yml');
const mainConfigPath = path.join(root, '_config.yml');

if (!exists(butterflyConfigPath)) {
  fail('_config.butterfly.yml not found');
  process.exit(1);
}
if (!exists(mainConfigPath)) {
  fail('_config.yml not found');
  process.exit(1);
}

const butterfly = read(butterflyConfigPath);
const mainConfig = read(mainConfigPath);

if (/use:\s*katex/.test(butterfly) || /use:\s*mathjax/.test(butterfly)) {
  ok('math.use is valid (katex or mathjax)');
} else {
  fail('math.use should be katex or mathjax');
}

if (/text:\s*萌ICP备\d+号/.test(butterfly) && /url:\s*https:\/\/icp\.gov\.moe\/\?keyword=\d+/.test(butterfly)) {
  ok('ICP config exists');
} else {
  fail('ICP config is missing or malformed');
}

if (/url:\s*https?:\/\/[^\s]+/.test(mainConfig)) {
  ok('site url configured');
} else {
  fail('site url missing in _config.yml');
}

const requiredAssets = [
  path.join(root, 'source', 'css', 'custom.css'),
  path.join(root, 'source', 'css', 'custom-carousel.css'),
  path.join(root, 'source', 'fonts', 'yozai-medium.css'),
  path.join(root, 'source', 'js', 'universe-particles.js')
];

for (const asset of requiredAssets) {
  if (exists(asset)) {
    ok(`asset present: ${path.relative(root, asset)}`);
  } else {
    fail(`asset missing: ${path.relative(root, asset)}`);
  }
}

if (process.exitCode) {
  console.error('\nPredeploy check failed.');
  process.exit(process.exitCode);
}

console.log('\nPredeploy check passed.');
