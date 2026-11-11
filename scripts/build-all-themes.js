#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readJson, renderTheme } = require('./theme-contract');

const DEFAULT_MANIFEST = 'themes/manifest.json';

function parseArgs(argv) {
  const args = { manifest: DEFAULT_MANIFEST };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--manifest') args.manifest = argv[i + 1];
  }

  return args;
}

function runNodeScript(scriptPath, scriptArgs) {
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(process.cwd(), args.manifest);
  const applyScript = path.resolve(process.cwd(), 'scripts/apply-theme-palette.js');
  const policyScript = path.resolve(process.cwd(), 'scripts/check-palette-policy.js');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${args.manifest}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const template = manifest.template;
  const variants = Array.isArray(manifest.variants) ? manifest.variants : [];

  if (!template) {
    throw new Error('Manifest template path is missing.');
  }
  if (variants.length === 0) {
    throw new Error('Manifest contains no variants.');
  }

  runNodeScript(policyScript, ['--manifest', args.manifest]);

  for (const variant of variants) {
    if (!variant.palette || !variant.out || !variant.themeName || !variant.themeType) {
      throw new Error(`Variant ${variant.id || '<unknown>'} is missing required fields.`);
    }

    console.log(`Building ${variant.id}...`);
    runNodeScript(applyScript, [
      '--template',
      template,
      '--palette',
      variant.palette,
      '--out',
      variant.out,
      '--theme-name',
      variant.themeName,
      '--theme-type',
      variant.themeType,
    ]);
  }

  console.log(`Built ${variants.length} theme variant(s).`);
  if (args.manifest === DEFAULT_MANIFEST) {
    const palette = readJson(variants[0].palette);
    fs.writeFileSync('themes/palettes/bea-v2.1.palette.json',
      `${JSON.stringify({ ...palette, name: 'Bea v2.1 compatibility palette (Onyx)' }, null, 2)}\n`);
    const compatibilityTheme = renderTheme(fs.readFileSync(template, 'utf8'), palette.colors, "Bea's Theme v2.1", 'dark');
    fs.writeFileSync("themes/Bea's Theme v2.1-color-theme.json", `${JSON.stringify(compatibilityTheme, null, 2)}\n`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
