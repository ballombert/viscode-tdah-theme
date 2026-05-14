#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_SOURCE = "themes/Bea's Theme v2.1-color-theme.json";
const DEFAULT_PALETTE = 'themes/palettes/bea-v2.1.palette.json';
const DEFAULT_TEMPLATE = 'themes/templates/bea-v2.1.template.jsonc';
const DEFAULT_NAMING = 'semantic';
const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const SEMANTIC_TOKEN_BY_HEX = {
  '#191919': 'COLOR_BG_EDITOR',
  '#202020': 'COLOR_BG_SURFACE',
  '#24272E': 'COLOR_BG_HOVER',
  '#2B313A': 'COLOR_BG_SELECTION',
  '#2B313A66': 'COLOR_BG_SELECTION_SOFT',
  '#2B313A88': 'COLOR_BG_WORD_HIGHLIGHT',
  '#2B313A99': 'COLOR_BG_SELECTION_STRONG',
  '#30353D': 'COLOR_BORDER',
  '#3A4250': 'COLOR_BORDER_FOCUS',
  '#3A425088': 'COLOR_BG_WORD_HIGHLIGHT_STRONG',
  '#6F7A89': 'COLOR_TEXT_MUTED',
  '#7AA2F7': 'COLOR_ACCENT_BLUE',
  '#7CD4B8': 'COLOR_ACCENT_MINT',
  '#8AAFF8': 'COLOR_ACCENT_BLUE_HOVER',
  '#8C95A3': 'COLOR_TEXT_SUBTLE',
  '#98C379': 'COLOR_ACCENT_GREEN',
  '#B5BDC9': 'COLOR_TEXT_SECONDARY',
  '#C792EA': 'COLOR_ACCENT_PURPLE',
  '#E06C75': 'COLOR_ACCENT_RED',
  '#E6C07B': 'COLOR_ACCENT_AMBER',
  '#E6EAF0': 'COLOR_TEXT_PRIMARY',
};

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    palette: DEFAULT_PALETTE,
    template: DEFAULT_TEMPLATE,
    naming: DEFAULT_NAMING,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source') args.source = argv[i + 1];
    if (arg === '--palette') args.palette = argv[i + 1];
    if (arg === '--template') args.template = argv[i + 1];
    if (arg === '--naming') args.naming = argv[i + 1];
  }

  return args;
}

function toToken(hexColor, namingMode) {
  if (namingMode === 'semantic') {
    return SEMANTIC_TOKEN_BY_HEX[hexColor] || `COLOR_HEX_${hexColor.slice(1).toUpperCase()}`;
  }
  return `C_${hexColor.slice(1).toUpperCase()}`;
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePath = path.resolve(process.cwd(), args.source);
  const palettePath = path.resolve(process.cwd(), args.palette);
  const templatePath = path.resolve(process.cwd(), args.template);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${args.source}`);
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  const uniqueColors = [];
  const seen = new Set();

  sourceContent.replace(HEX_COLOR_RE, (match) => {
    const normalized = `#${match.slice(1).toUpperCase()}`;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueColors.push(normalized);
    }
    return match;
  });

  const paletteColors = {};
  for (const color of uniqueColors) {
    paletteColors[toToken(color, args.naming)] = color;
  }

  const templateContent = sourceContent.replace(HEX_COLOR_RE, (match) => {
    const normalized = `#${match.slice(1).toUpperCase()}`;
    return `{{${toToken(normalized, args.naming)}}}`;
  });

  const paletteDoc = {
    name: 'Bea v2.1 extracted palette',
    source: args.source,
    naming: args.naming,
    generatedAt: new Date().toISOString(),
    colors: paletteColors,
  };

  ensureDirForFile(palettePath);
  ensureDirForFile(templatePath);

  fs.writeFileSync(palettePath, `${JSON.stringify(paletteDoc, null, 2)}\n`, 'utf8');
  fs.writeFileSync(templatePath, templateContent, 'utf8');

  console.log(`Extracted ${uniqueColors.length} unique colors.`);
  console.log(`Palette: ${path.relative(process.cwd(), palettePath)}`);
  console.log(`Template: ${path.relative(process.cwd(), templatePath)}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
