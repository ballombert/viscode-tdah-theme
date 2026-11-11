const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ROLES, parseColor, composite, contrast, paletteIssues, renderTheme, themeChecks, readJson } = require('../scripts/theme-contract');

const manifest = readJson('themes/manifest.json');
const pkg = readJson('package.json');
const template = fs.readFileSync(manifest.template, 'utf8');

test('WCAG luminance and alpha composition use exact, unrounded thresholds', () => {
  assert.equal(contrast(parseColor('#FFFFFF'), parseColor('#000000')), 21);
  assert.equal(contrast(parseColor('#123456'), parseColor('#123456')), 1);
  assert.deepEqual(composite(parseColor('#FFFFFF80'), parseColor('#000000')), [128 / 255, 128 / 255, 128 / 255, 1]);
  assert.ok(contrast(parseColor('#777777'), parseColor('#FFFFFF')) < 4.5);
  assert.ok(contrast(parseColor('#767676'), parseColor('#FFFFFF')) > 4.5);
  assert.throws(() => contrast(parseColor('#FFFFFF'), parseColor('#00000000')), /opaque/);
  for (const invalid of ['#GGGGGG', '#12345Z', '#123', '', null, '#123456789']) {
    assert.throws(() => parseColor(invalid), /Invalid color/);
  }
});

test('manifest and package contain exactly nine unique, consistent contributions', () => {
  assert.equal(manifest.variants.length, 9);
  assert.equal(new Set(manifest.variants.map((v) => v.id)).size, 9);
  assert.equal(new Set(manifest.variants.map((v) => v.out)).size, 9);
  assert.equal(new Set(manifest.variants.map((v) => v.label)).size, 9);
  assert.deepEqual(pkg.contributes.themes, manifest.variants.map((v) => ({
    label: v.label, uiTheme: v.uiTheme, path: `./${v.out}`,
  })));
  assert.equal(manifest.variants.filter((v) => v.collection === 'calm').length, 7);
  assert.equal(manifest.variants.filter((v) => v.collection === 'neon').length, 2);
  assert.ok(pkg.icon && fs.existsSync(pkg.icon));
  const icon = fs.readFileSync(pkg.icon);
  assert.deepEqual([...icon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(icon.readUInt32BE(16) >= 128 && icon.readUInt32BE(20) >= 128);
  for (const key of ['description', 'homepage', 'bugs', 'galleryBanner', 'keywords', 'main']) assert.ok(pkg[key]);
  assert.equal(pkg.contributes.commands.length, 4);
  assert.ok(fs.existsSync(pkg.main));
});

for (const variant of manifest.variants) {
  test(`${variant.id}: generated output, palette, syntax roles and contrast contract`, () => {
    const palette = readJson(variant.palette).colors;
    assert.deepEqual(paletteIssues(palette, variant.collection), []);
    const expected = renderTheme(template, palette, variant.themeName, variant.themeType);
    const output = readJson(variant.out);
    assert.deepEqual(output, expected);
    assert.equal(output.semanticHighlighting, true);
    for (const [role, key] of Object.entries(ROLES)) assert.equal(output.semanticTokenColors[role], palette[key]);
    const failures = themeChecks(output, palette).filter((check) => !check.pass);
    assert.deepEqual(failures, []);
    assert.equal(JSON.stringify(output).includes('{{'), false);
    const unsafe = output.tokenColors.find((entry) => entry.name === 'J - Rust unsafe');
    assert.equal(unsafe.settings.foreground, palette[ROLES.keyword]);
    assert.equal(output.tokenColors.some((entry) => entry.scope.includes('meta.function-call')), false);
    for (const [name, role] of [
      ['A - Keywords / storage / modifiers', 'keyword'], ['B - Fonctions', 'function'],
      ['B - Types et classes', 'type'], ['A - Chaines', 'string'], ['A - Nombres et constantes', 'number'],
      ['H - TS/JS decorateurs', 'decorator'], ['I - Python decorateurs', 'decorator'],
      ['J - Rust attributs', 'decorator'], ['L - C# attributs', 'decorator'],
    ]) assert.equal(output.tokenColors.find((entry) => entry.name === name).settings.foreground, palette[ROLES[role]]);
  });
}

test('warm exceptions are restricted to Neon types and decorators', () => {
  const calm = readJson(manifest.variants[0].palette).colors;
  const neon = readJson(manifest.variants[7].palette).colors;
  assert.ok(paletteIssues({ ...calm, COLOR_SYNTAX_TYPE: '#FF8ADA' }, 'calm').length);
  assert.ok(paletteIssues({ ...calm, COLOR_SYNTAX_DECORATOR: '#E7DC74' }, 'calm').length);
  assert.deepEqual(paletteIssues(neon, 'neon'), []);
  assert.ok(paletteIssues({ ...neon, COLOR_ACCENT_BLUE: '#E7DC74' }, 'neon').length);
  assert.ok(paletteIssues({ ...neon, COLOR_SYNTAX_TYPE: '#FF5555' }, 'neon').length);
  assert.ok(paletteIssues({ ...neon, COLOR_ACCENT_BLUE: neon.COLOR_ACCENT_GREEN }, 'neon').length);
  assert.ok(paletteIssues(neon, 'typo').length);
  const missing = { ...neon };
  delete missing.COLOR_SYNTAX_TYPE;
  assert.ok(paletteIssues(missing, 'neon').length);
});

test('low contrast and missing palette values fail, not silently default', () => {
  const palette = readJson(manifest.variants[0].palette).colors;
  assert.throws(() => renderTheme(template, {}, 'Missing', 'dark'), /Missing palette/);
  const bad = { ...palette, COLOR_ACCENT_BLUE: palette.COLOR_BG_EDITOR };
  const theme = renderTheme(template, bad, 'Bad', 'dark');
  assert.ok(themeChecks(theme, bad).some((check) => !check.pass && check.name.startsWith('COLOR_ACCENT_BLUE')));
});

test('language fixtures and scope contracts cover every documented language', () => {
  const fixtureDir = path.join(__dirname, 'fixtures');
  const contracts = {
    'example.ts': 'keyword.control.import', 'example.js': 'string.template',
    'example.py': 'keyword.operator.logical.python',
    'example.rs': 'entity.name.type.trait.rust', 'example.go': 'keyword.channel.go',
    'example.cs': 'entity.name.type.interface.cs', 'example.html': 'entity.name.tag',
    'example.css': 'support.type.property-name.css', 'example.json': 'constant.numeric.json',
    'example.yaml': 'constant.numeric.yaml', 'example.md': 'markup.heading.atx.1.markdown',
  };
  const theme = readJson(manifest.variants[0].out);
  for (const [fixture, scope] of Object.entries(contracts)) {
    assert.ok(fs.readFileSync(path.join(fixtureDir, fixture), 'utf8').trim());
    assert.ok(theme.tokenColors.some((entry) => entry.scope.includes(scope)), scope);
  }
});

test('extraction refuses to overwrite the shared maintained template', () => {
  const result = spawnSync(process.execPath, ['scripts/extract-theme-palette.js',
    '--template', manifest.template], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot overwrite maintained/);
});
