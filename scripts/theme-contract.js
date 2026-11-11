const fs = require('node:fs');

const ROLES = {
  keyword: 'COLOR_ACCENT_BLUE',
  function: 'COLOR_ACCENT_MINT',
  type: 'COLOR_SYNTAX_TYPE',
  string: 'COLOR_ACCENT_GREEN',
  number: 'COLOR_ACCENT_PURPLE',
  decorator: 'COLOR_SYNTAX_DECORATOR',
};
const CODE_TOKENS = ['COLOR_TEXT_PRIMARY', 'COLOR_TEXT_SECONDARY', ...Object.values(ROLES),
  'COLOR_ACCENT_RED', 'COLOR_STATE_WARNING'];
const TEXT_TOKENS = [...CODE_TOKENS, 'COLOR_TEXT_MUTED', 'COLOR_TEXT_SUBTLE'];
const BACKGROUNDS = ['editor.background', 'editor.lineHighlightBackground', 'editor.selectionBackground',
  'editor.inactiveSelectionBackground', 'editor.selectionHighlightBackground', 'editor.wordHighlightBackground',
  'editor.wordHighlightStrongBackground', 'editor.findMatchBackground', 'editor.findMatchHighlightBackground'];

function parseColor(value) {
  if (typeof value !== 'string' || !/^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) {
    throw new Error(`Invalid color: ${value}`);
  }
  const channels = value.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255);
  return [...channels.slice(0, 3), channels[3] ?? 1];
}

function composite(foreground, background) {
  const a = foreground[3] + background[3] * (1 - foreground[3]);
  if (a === 0) throw new Error('Cannot resolve a fully transparent background.');
  return [0, 1, 2].map((i) =>
    (foreground[i] * foreground[3] + background[i] * background[3] * (1 - foreground[3])) / a).concat(a);
}

function contrast(foreground, background) {
  if (background[3] !== 1) throw new Error('Contrast requires an opaque resolved background.');
  const luminance = (color) => color.slice(0, 3)
    .map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const fg = luminance(composite(foreground, background));
  const bg = luminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function hueAndSaturation(value) {
  const [r, g, b] = parseColor(value);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0 };
  let h;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return { h: (h * 60 + 360) % 360, s: delta / (1 - Math.abs(max + min - 1)) };
}

function paletteIssues(palette, collection) {
  const issues = [];
  if (!['calm', 'neon'].includes(collection)) return [`Unknown palette collection: ${collection}`];
  for (const [key, value] of Object.entries(palette)) {
    try { parseColor(value); } catch (error) { issues.push(`${key}: ${error.message}`); }
  }
  for (const key of [...TEXT_TOKENS, 'COLOR_BG_EDITOR', 'COLOR_BG_SURFACE', 'COLOR_BORDER_FOCUS']) {
    if (!Object.hasOwn(palette, key)) issues.push(`${key}: missing`);
  }
  for (const key of ['COLOR_TEXT_PRIMARY', 'COLOR_TEXT_SECONDARY', ...Object.values(ROLES), 'COLOR_TEXT_MUTED', 'COLOR_TEXT_SUBTLE']) {
    if (!/^#[\da-f]{6}$/i.test(palette[key] || '')) {
      issues.push(`${key}: expected opaque #RRGGBB`);
      continue;
    }
    const { h, s } = hueAndSaturation(palette[key]);
    const warm = s >= 0.2 && (h <= 70 || h >= 300);
    const pinkType = collection === 'neon' && key === ROLES.type && h >= 300 && h <= 345;
    const yellowDecorator = collection === 'neon' && key === ROLES.decorator && h >= 45 && h <= 70;
    if (warm && !pinkType && !yellowDecorator) issues.push(`${key}: warm hue not allowed (${palette[key]})`);
  }
  const accents = Object.values(ROLES).map((key) => palette[key]);
  if (collection === 'neon' && new Set(accents).size !== accents.length) {
    issues.push('Neon requires six distinct syntax accents.');
  }
  const families = collection === 'neon'
    ? { keyword: [200, 245], function: [175, 200], type: [300, 345], string: [90, 155], number: [250, 295], decorator: [45, 70] }
    : { keyword: [200, 245], function: [150, 180], type: [175, 200], string: [90, 155], number: [250, 295], decorator: [250, 295] };
  for (const [role, [min, max]] of Object.entries(families)) {
    const value = palette[ROLES[role]];
    if (!/^#[\da-f]{6}$/i.test(value || '')) continue;
    const { h, s } = hueAndSaturation(value);
    if (s < 0.2 || h < min || h > max) issues.push(`${role}: expected ${collection} hue ${min}-${max}, got ${h.toFixed(1)}`);
  }
  return issues;
}

function parseTemplate(content) {
  // The template only uses full-line comments, never inline comments or trailing commas.
  return JSON.parse(content.replace(/^\s*\/\/.*$/gm, ''));
}

function renderTheme(content, palette, name, type) {
  const replaced = content.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, key) => {
    if (typeof palette[key] !== 'string') throw new Error(`Missing palette value: ${key}`);
    return palette[key];
  });
  const theme = parseTemplate(replaced);
  theme.name = name;
  theme.type = type;
  return theme;
}

function themeChecks(theme, palette) {
  const checks = [];
  const colors = theme.colors;
  const editor = parseColor(colors['editor.background']);
  const surface = parseColor(colors['sideBar.background']);
  const add = (name, fg, bg, minimum) => {
    const ratio = contrast(parseColor(fg), bg);
    checks.push({ name, ratio, minimum, pass: ratio >= minimum });
  };
  for (const key of TEXT_TOKENS) {
    for (const background of BACKGROUNDS) {
      const bg = composite(parseColor(colors[background]), editor);
      add(`${key} / ${background}`, palette[key], bg,
        background === 'editor.background' && CODE_TOKENS.includes(key) ? 7 : 4.5);
    }
  }
  for (const [fg, bg] of [
    ['sideBar.foreground', 'sideBar.background'], ['input.foreground', 'input.background'],
    ['input.placeholderForeground', 'input.background'], ['dropdown.foreground', 'dropdown.background'],
    ['statusBar.foreground', 'statusBar.background'], ['tab.inactiveForeground', 'tab.inactiveBackground'],
    ['list.activeSelectionForeground', 'list.activeSelectionBackground'],
    ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground'],
    ['list.hoverForeground', 'list.hoverBackground'],
    ['button.foreground', 'button.background'], ['button.foreground', 'button.hoverBackground'],
    ['statusBar.debuggingForeground', 'statusBar.debuggingBackground'],
    ['editorHoverWidget.foreground', 'editorHoverWidget.background'],
    ['editorSuggestWidget.foreground', 'editorSuggestWidget.background'],
    ['editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground'],
  ]) add(`${fg} / ${bg}`, colors[fg], composite(parseColor(colors[bg]), editor), 4.5);
  for (const background of [editor, surface]) {
    add('focusBorder / adjacent background', colors.focusBorder, background, 3);
    add('input.border / adjacent background', colors['input.border'], background, 3);
  }
  for (const key of ['editorCursor.foreground', 'editorError.foreground', 'editorWarning.foreground',
    'editorInfo.foreground', 'editorHint.foreground', 'editorBracketMatch.border', 'editor.findMatchBorder']) {
    add(`${key} / editor`, colors[key], editor, 3);
  }
  return checks;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = { ROLES, CODE_TOKENS, parseColor, composite, contrast, paletteIssues,
  parseTemplate, renderTheme, themeChecks, readJson };
