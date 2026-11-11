#!/usr/bin/env node
const { readJson, themeChecks } = require('./theme-contract');

try {
  const manifest = readJson('themes/manifest.json');
  if (!manifest.variants?.length) throw new Error('Manifest contains no variants.');
  let failures = 0;
  for (const variant of manifest.variants) {
    const checks = themeChecks(readJson(variant.out), readJson(variant.palette).colors);
    const failed = checks.filter((check) => !check.pass);
    failures += failed.length;
    console.log(`${variant.id}: ${checks.length - failed.length}/${checks.length} contrast pairs passed`);
    for (const check of failed) console.error(`  ${check.name}: ${check.ratio.toFixed(3)} < ${check.minimum}`);
  }
  if (failures) throw new Error(`${failures} contrast checks failed.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
