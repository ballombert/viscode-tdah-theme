const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function connect(port) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === 'page' && target.url.includes('workbench'));
  assert.ok(page, 'VS Code workbench debugging target must be available');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const { resolve, reject, timer } = pending.get(message.id);
    clearTimeout(timer);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });
  return {
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const requestId = ++id;
        const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
        pending.set(requestId, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: requestId, method, params }));
      });
    },
    close() { socket.close(); },
  };
}

async function verifyRendering(vscode, extension, captureDirectory) {
  const cdp = await connect(Number(process.env.BEADARK_CDP_PORT));
  const configuration = () => vscode.workspace.getConfiguration();
  const original = configuration().inspect('editor.semanticHighlighting.enabled').workspaceValue;
  const automaticTheme = Object.fromEntries(['window.autoDetectHighContrast', 'window.autoDetectColorScheme']
    .map((key) => [key, configuration().inspect(key).globalValue]));
  const fixture = vscode.Uri.file(path.join(extension.extensionPath, 'test/fixtures/example.ts'));
  const toRgb = (hex) => `rgb(${hex.slice(1).match(/../g).map((part) => parseInt(part, 16)).join(', ')})`;
  try {
    // Control the isolated test environment, never the extension's accessibility behavior.
    for (const key of Object.keys(automaticTheme)) {
      await configuration().update(key, false, vscode.ConfigurationTarget.Global);
    }
    const document = await vscode.workspace.openTextDocument(fixture);
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand('workbench.action.closePanel');
    await vscode.commands.executeCommand('workbench.action.closeSidebar');
    await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
    if (captureDirectory) await fs.mkdir(captureDirectory, { recursive: true });
    for (const semantic of [false, true]) {
      await configuration().update('editor.semanticHighlighting.enabled', semantic, vscode.ConfigurationTarget.Workspace);
      for (const contribution of extension.packageJSON.contributes.themes) {
        const theme = JSON.parse(await fs.readFile(path.join(extension.extensionPath, contribution.path), 'utf8'));
        await configuration().update('workbench.colorTheme', contribution.label, vscode.ConfigurationTarget.Workspace);
        const expected = toRgb(theme.semanticTokenColors.keyword);
        const expression = `(() => {
          const editor = [...document.querySelectorAll('.monaco-editor')].find(element =>
            element.getBoundingClientRect().height > 100 && element.querySelector('.view-lines')?.textContent.includes('readFile'));
          const tokens = [...(editor?.querySelectorAll('.view-line span') || [])];
          const keyword = tokens.find(span => span.textContent.trim() === 'import');
          const declaration = tokens.find(span => span.textContent.trim() === 'interface');
          const bracket = tokens.find(span => span.textContent.trim() === '{');
          const colorOf = predicate => {
            const token = tokens.find(span => span.childElementCount === 0
              && predicate(span.textContent.replaceAll(String.fromCharCode(160), ' ').trim()));
            return token && getComputedStyle(token).color;
          };
          const decorators = tokens.filter(span => span.childElementCount === 0
            && ['sealed', '@sealed'].includes(span.textContent.trim()));
          return {
            background: editor && getComputedStyle(editor).backgroundColor,
            keyword: keyword && getComputedStyle(keyword).color,
            declaration: declaration && getComputedStyle(declaration).color,
            bracket: bracket && getComputedStyle(bracket).color,
            function: colorOf(text => text === 'loadUser'),
            type: colorOf(text => text === 'User'),
            string: colorOf(text => text.includes('Invalid name')),
            number: colorOf(text => text === '42'),
            decorator: decorators.length && getComputedStyle(decorators.at(-1)).color,
            comment: colorOf(text => text.startsWith('// Keep comments'))
          };
        })()`;
        let actual;
        const deadline = Date.now() + 10000;
        do {
          const result = await cdp.call('Runtime.evaluate', { expression, returnByValue: true });
          actual = result.result.value;
          if (actual.keyword === expected && actual.declaration === expected
            && actual.background === toRgb(theme.colors['editor.background'])) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (Date.now() < deadline);
        if (captureDirectory && !semantic) {
          const screenshot = await cdp.call('Page.captureScreenshot', { format: 'png' });
          const filename = path.basename(contribution.path).replace('.json', '.png');
          await fs.writeFile(path.join(captureDirectory, filename), Buffer.from(screenshot.data, 'base64'));
        }
        assert.equal(actual.background, toRgb(theme.colors['editor.background']), `${contribution.label}: rendered background`);
        assert.equal(actual.keyword, expected, `${contribution.label}: rendered import keyword, semantic=${semantic}`);
        assert.equal(actual.declaration, expected, `${contribution.label}: declaration keywords are not colored as types`);
        assert.equal(actual.bracket, toRgb(theme.semanticTokenColors.operator), `${contribution.label}: brackets stay neutral`);
        for (const role of ['function', 'type', 'string', 'number', 'decorator', 'comment']) {
          assert.equal(actual[role], toRgb(theme.semanticTokenColors[role]), `${contribution.label}: rendered ${role}, semantic=${semantic}`);
        }
      }
    }
    await configuration().update('editor.semanticHighlighting.enabled', false, vscode.ConfigurationTarget.Workspace);
    for (const [file, anchor, text, role] of [
      ['example.js', 'greet', 'export', 'keyword'],
      ['example.py', 'greeting', 'from', 'keyword'],
      ['example.rs', 'unsafe', 'unsafe', 'keyword'],
      ['example.go', 'messages', 'package', 'keyword'],
      ['example.cs', 'INamed', 'interface', 'keyword'],
      ['example.html', 'Ouvrir', 'button', 'keyword'],
      ['example.css', 'spacing', 'display', 'variable'],
      ['example.json', 'enabled', 'name', 'keyword'],
      ['example.yaml', 'defaults', 'name', 'keyword'],
      ['example.md', 'Reading', 'Reading example', 'keyword'],
    ]) {
      const sample = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(extension.extensionPath, 'test/fixtures', file)));
      assert.notEqual(sample.languageId, 'plaintext', `${file}: built-in grammar must be installed`);
      await vscode.window.showTextDocument(sample);
      for (const contribution of extension.packageJSON.contributes.themes) {
        const theme = JSON.parse(await fs.readFile(path.join(extension.extensionPath, contribution.path), 'utf8'));
        await configuration().update('workbench.colorTheme', contribution.label, vscode.ConfigurationTarget.Workspace);
        const expression = `(() => {
          const normalize = value => value.replaceAll(String.fromCharCode(160), ' ').trim();
          const editor = [...document.querySelectorAll('.monaco-editor')].find(element =>
            element.getBoundingClientRect().height > 100 && normalize(element.querySelector('.view-lines')?.textContent || '').includes(${JSON.stringify(anchor)}));
          const token = [...(editor?.querySelectorAll('.view-line span') || [])].find(span =>
            span.childElementCount === 0 && normalize(span.textContent).includes(${JSON.stringify(text)}));
          return token && getComputedStyle(token).color;
        })()`;
        const expected = toRgb(theme.semanticTokenColors[role]);
        let actual;
        const deadline = Date.now() + 10000;
        do {
          const result = await cdp.call('Runtime.evaluate', { expression, returnByValue: true });
          actual = result.result.value;
          if (actual === expected) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (Date.now() < deadline);
        assert.equal(actual, expected, `${contribution.label}: ${file} ${text} must use ${role}`);
      }
    }
    console.log('BeaDark rendering: background, six syntax roles, declaration keywords, comments and neutral brackets matched all 9 themes with semantic highlighting off/on.');
    console.log('BeaDark TextMate rendering: JS, Python, Rust, Go, C#, HTML, CSS, JSON, YAML and Markdown role probes passed in all 9 themes.');
  } finally {
    await configuration().update('editor.semanticHighlighting.enabled', original, vscode.ConfigurationTarget.Workspace);
    for (const [key, value] of Object.entries(automaticTheme)) {
      await configuration().update(key, value, vscode.ConfigurationTarget.Global);
    }
    cdp.close();
  }
}

module.exports = { verifyRendering };
