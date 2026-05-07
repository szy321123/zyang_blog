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
const mainConfigPath = path.join(root, '_config.yml');

if (!exists(mainConfigPath)) {
  fail('_config.yml not found');
  process.exit(1);
}

function warn(msg) {
  console.warn(`WARN: ${msg}`);
}

const mainConfig = read(mainConfigPath);

// detect theme from _config.yml
let theme = null;
const tm = /theme:\s*([^\s]+)/.exec(mainConfig);
if (tm) theme = tm[1];

// candidate theme config paths (override file, theme folder config, fallback butterfly)
const candidates = [];
if (theme) {
  candidates.push(path.join(root, `_config.${theme}.yml`));
  candidates.push(path.join(root, 'themes', theme, '_config.yml'));
}
candidates.push(path.join(root, '_config.anzhiyu.yml'));
candidates.push(path.join(root, '_config.butterfly.yml'));

const themeConfigPath = candidates.find(p => exists(p));
if (!themeConfigPath) {
  fail('No theme configuration found (expected _config.<theme>.yml or themes/<theme>/_config.yml)');
  process.exit(1);
}

const themeConfig = read(themeConfigPath);

// math check (works for both anzhiyu and butterfly configs).
// Support patterns: 'use: katex|mathjax' or presence of 'katex:' / 'mathjax:' sections.
if (/use:\s*katex/.test(themeConfig) || /use:\s*mathjax/.test(themeConfig) || /\bkatex:\s*/.test(themeConfig) || /\bmathjax:\s*/.test(themeConfig)) {
  ok('math configuration detected (katex or mathjax)');
} else {
  fail('math configuration (katex or mathjax) not found in theme configuration');
}

// ICP check: required for Butterfly, optional (warn) for others
if (theme === 'butterfly') {
  if (/text:\s*萌ICP备\d+号/.test(themeConfig) && /url:\s*https:\/\/icp\.gov\.moe\/\?keyword=\d+/.test(themeConfig)) {
    ok('ICP config exists');
  } else {
    fail('ICP config is missing or malformed for butterfly theme');
  }
} else {
  if (/text:\s*萌ICP备\d+号/.test(themeConfig) && /url:\s*https:\/\/icp\.gov\.moe\/\?keyword=\d+/.test(themeConfig)) {
    ok('ICP config exists');
  } else {
    warn('ICP config not found in theme configuration (not required for current theme)');
  }
}

// site URL check from main config
if (/url:\s*https?:\/\/[^\s]+/.test(mainConfig)) {
  ok('site url configured');
} else {
  fail('site url missing in _config.yml');
}

if (process.exitCode) {
  console.error('\nPredeploy check failed.');
  process.exit(process.exitCode);
}

console.log('\nPredeploy check passed.');
