#!/usr/bin/env node
const path = require('node:path');
const { readJson, paletteIssues } = require('./theme-contract');

try {
  const index = process.argv.indexOf('--manifest');
  const manifest = readJson(path.resolve(index < 0 ? 'themes/manifest.json' : process.argv[index + 1]));
  if (!Array.isArray(manifest.variants) || !manifest.variants.length) throw new Error('Manifest contains no variants.');
  const issues = manifest.variants.flatMap((variant) => {
    const palette = readJson(variant.palette);
    return paletteIssues(palette.colors, variant.collection).map((issue) => `${variant.id}: ${issue}`);
  });
  if (issues.length) throw new Error(`Palette policy check failed:\n${issues.join('\n')}`);
  console.log(`Palette policy check passed for ${manifest.variants.length} variants.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
