const fs = require('node:fs');
const path = require('node:path');
const { createSettingsManager, FOCUS } = require('./lib/reading-settings');

const FONT_HELP = 'https://github.com/ballombert/viscode-tdah-theme#reading-fonts';

async function chooseTypography(vscode, manager) {
  const font = await vscode.window.showQuickPick([
    { label: 'Atkinson Hyperlegible Mono', description: 'Recommended monospace; install locally first', family: "'Atkinson Hyperlegible Mono', monospace" },
    { label: 'OpenDyslexic', description: 'Optional personal preference; proportional versions affect code alignment', family: "'OpenDyslexic', monospace" },
    { label: 'Custom installed font', description: 'Including Dyslexie with your own license', custom: true },
    { label: 'Font installation guide', help: true },
  ], { title: 'BeaDark: choose a reading font (no download or detection)' });
  if (!font) return;
  if (font.help) {
    await vscode.env.openExternal(vscode.Uri.parse(FONT_HELP));
    return;
  }
  let family = font.family;
  if (font.custom) {
    const name = await vscode.window.showInputBox({
      title: 'Locally installed font family', prompt: 'Enter the exact family name, not a path. A monospace fallback will be added.',
      validateInput: (value) => !value.trim() || /['",;\n\r]/.test(value)
        ? 'Enter a single font family without quotes, commas or semicolons.' : undefined,
    });
    if (name === undefined) return;
    family = `'${name.trim()}', monospace`;
  }
  const numbers = {};
  for (const [key, title, initial, min, max] of [
    ['editor.fontSize', 'Font size (pixels)', 16, 10, 40],
    ['editor.lineHeight', 'Line-height multiplier', 1.5, 1, 2],
    ['editor.letterSpacing', 'Letter spacing (pixels)', 0.2, 0, 2],
  ]) {
    const value = await vscode.window.showInputBox({
      title: `BeaDark: ${title}`, value: String(initial),
      validateInput: (text) => text.trim() && Number.isFinite(Number(text)) && Number(text) >= min && Number(text) <= max
        ? undefined : `Enter a number from ${min} to ${max} (decimal point).`,
    });
    if (value === undefined) return;
    numbers[key] = Number(value);
  }
  const scope = await manager.chooseScope();
  if (!scope) return;
  await manager.apply('typography', { 'editor.fontFamily': family, ...numbers, 'editor.fontLigatures': false }, scope);
}

async function showLegend(vscode, context) {
  const selected = vscode.workspace.getConfiguration('workbench').get('colorTheme');
  const contribution = context.extension.packageJSON.contributes.themes.find((theme) => theme.label === selected);
  if (!contribution) {
    await vscode.window.showInformationMessage('BeaDark: select a Bea Theme first to display its actual color legend.');
    return;
  }
  const theme = JSON.parse(fs.readFileSync(path.join(context.extensionPath, contribution.path), 'utf8'));
  const examples = [
    ['keyword', 'Keywords', 'if / return / import'],
    ['function', 'Functions and methods', 'calculate()'],
    ['type', 'Types and classes', 'User / Result'],
    ['string', 'Strings', '"hello"'],
    ['number', 'Numbers and constants', '42 / true'],
    ['decorator', 'Decorators and annotations', '@cache / #[derive]'],
    ['variable', 'Variables', 'value'],
    ['comment', 'Comments', '// explanation'],
  ];
  await vscode.window.showQuickPick(examples.map(([token, label, example]) => ({
    label, description: `${theme.semanticTokenColors[token]}  ${example}`,
  })), { title: `${selected}: syntax roles (actual hex colors)`, placeHolder: 'Text roles remain readable without relying on hue alone.' });
}

function activate(context) {
  const vscode = require('vscode');
  const manager = createSettingsManager(vscode, context);
  const register = (id, action) => context.subscriptions.push(vscode.commands.registerCommand(id, () =>
    manager.serialize(action).catch((error) => manager.report(error))));
  register('beadark.chooseTypography', () => chooseTypography(vscode, manager));
  register('beadark.enableFocus', async () => {
    const scope = await manager.chooseScope();
    if (scope) await manager.apply('focus', FOCUS, scope);
  });
  register('beadark.restoreSettings', async () => {
    const profile = await vscode.window.showQuickPick(['typography', 'focus'], { title: 'BeaDark: settings to restore' });
    if (!profile) return;
    const scope = await manager.chooseScope();
    if (scope) await manager.restore(profile, scope);
  });
  register('beadark.showLegend', () => showLegend(vscode, context));
}

function deactivate() {}

module.exports = { activate, deactivate, chooseTypography, showLegend };
