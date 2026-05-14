#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_MANIFEST = 'themes/manifest.json';

const ENFORCED_TOKENS = [
  'COLOR_TEXT_PRIMARY',
  'COLOR_TEXT_SECONDARY',
  'COLOR_TEXT_SUBTLE',
  'COLOR_TEXT_MUTED',
  'COLOR_ACCENT_BLUE',
  'COLOR_ACCENT_MINT',
  'COLOR_ACCENT_GREEN',
  'COLOR_ACCENT_PURPLE',
  'COLOR_ACCENT_AMBER',
];

function parseArgs(argv) {
  const args = { manifest: DEFAULT_MANIFEST };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--manifest') args.manifest = argv[i + 1];
  }

  return args;
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return null;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function isWarmHue(hue, saturation) {
  if (saturation < 0.2) return false;
  return hue <= 30 || hue >= 330 || (hue >= 30 && hue <= 70);
}

function checkPalette(palettePath) {
  const raw = fs.readFileSync(palettePath, 'utf8');
  const parsed = JSON.parse(raw);
  const colors = parsed.colors || parsed;
  const violations = [];

  for (const token of ENFORCED_TOKENS) {
    const value = colors[token];
    if (typeof value !== 'string') {
      violations.push(`${token}: missing`);
      continue;
    }

    const hex = value.slice(0, 7);
    const rgb = hexToRgb(hex);
    if (!rgb) {
      violations.push(`${token}: invalid hex (${value})`);
      continue;
    }

    const { h, s } = rgbToHsl(rgb);
    if (isWarmHue(h, s)) {
      violations.push(`${token}: warm hue not allowed (${value})`);
    }
  }

  return violations;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(process.cwd(), args.manifest);

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${args.manifest}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const variants = Array.isArray(manifest.variants) ? manifest.variants : [];

  if (variants.length === 0) {
    throw new Error('Manifest contains no variants.');
  }

  const allViolations = [];

  for (const variant of variants) {
    const palettePath = path.resolve(process.cwd(), variant.palette);
    if (!fs.existsSync(palettePath)) {
      allViolations.push(`${variant.id}: palette file not found (${variant.palette})`);
      continue;
    }

    const violations = checkPalette(palettePath);
    for (const violation of violations) {
      allViolations.push(`${variant.id}: ${violation}`);
    }
  }

  if (allViolations.length > 0) {
    console.error('Palette policy check failed:');
    for (const violation of allViolations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log(`Palette policy check passed for ${variants.length} variant(s).`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
