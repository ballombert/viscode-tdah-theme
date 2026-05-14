#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_TEMPLATE = 'themes/templates/bea-v2.1.template.jsonc';
const DEFAULT_PALETTE = 'themes/palettes/bea-v2.1.palette.json';
const DEFAULT_OUT = "themes/Bea's Theme v2.1-color-theme.generated.json";
const TOKEN_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
const NAME_LINE_RE = /^\s*"name"\s*:\s*"[^"]*"/m;
const TYPE_LINE_RE = /^\s*"type"\s*:\s*"(dark|light|hc)"/m;

function parseArgs(argv) {
  const args = {
    template: DEFAULT_TEMPLATE,
    palette: DEFAULT_PALETTE,
    out: DEFAULT_OUT,
    themeName: null,
    themeType: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--template') args.template = argv[i + 1];
    if (arg === '--palette') args.palette = argv[i + 1];
    if (arg === '--out') args.out = argv[i + 1];
    if (arg === '--theme-name') args.themeName = argv[i + 1];
    if (arg === '--theme-type') args.themeType = argv[i + 1];
  }

  return args;
}

function applyThemeMetadata(content, themeName, themeType) {
  let output = content;

  if (themeName) {
    output = output.replace(NAME_LINE_RE, `  "name": "${themeName}"`);
  }

  if (themeType) {
    output = output.replace(TYPE_LINE_RE, `  "type": "${themeType}"`);
  }

  return output;
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function loadPalette(palettePath) {
  const raw = fs.readFileSync(palettePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (parsed && typeof parsed === 'object' && parsed.colors && typeof parsed.colors === 'object') {
    return parsed.colors;
  }

  if (parsed && typeof parsed === 'object') {
    return parsed;
  }

  throw new Error('Invalid palette format. Expected an object or { colors: { ... } }.');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const templatePath = path.resolve(process.cwd(), args.template);
  const palettePath = path.resolve(process.cwd(), args.palette);
  const outPath = path.resolve(process.cwd(), args.out);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${args.template}`);
  }
  if (!fs.existsSync(palettePath)) {
    throw new Error(`Palette file not found: ${args.palette}`);
  }

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const palette = loadPalette(palettePath);
  const missing = new Set();

  const replaced = templateContent.replace(TOKEN_RE, (fullMatch, token) => {
    const value = palette[token];
    if (typeof value !== 'string') {
      missing.add(token);
      return fullMatch;
    }
    return value;
  });

  if (missing.size > 0) {
    const list = Array.from(missing).sort().join(', ');
    throw new Error(`Missing palette values for tokens: ${list}`);
  }

  const output = applyThemeMetadata(replaced, args.themeName, args.themeType);

  ensureDirForFile(outPath);
  fs.writeFileSync(outPath, output, 'utf8');

  console.log(`Generated theme file: ${path.relative(process.cwd(), outPath)}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
