const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSettingsManager, FOCUS, STATE_KEY } = require('../lib/reading-settings');
const { chooseTypography, showLegend } = require('../extension');
const manifest = require('../package.json');

function harness() {
  const global = {};
  const workspace = {};
  const overrides = {};
  const messages = [];
  const writes = [];
  const picks = [];
  const inputs = [];
  let answer = 'Apply';
  let writeHook;
  const storage = () => {
    const data = {};
    return {
      get: (key) => data[key] && structuredClone(data[key]),
      update: async (key, value) => { data[key] = structuredClone(value); },
      setKeysForSync: () => {},
    };
  };
  const context = {
    globalStorageUri: { toString: () => 'file:///profile-A/globalStorage/beadark' },
    globalState: storage(), workspaceState: storage(), subscriptions: [],
    extensionPath: require('node:path').resolve(__dirname, '..'),
    extension: { packageJSON: manifest },
  };
  const vscode = {
    ConfigurationTarget: { Global: 1, Workspace: 2 },
    Uri: { parse: (value) => value },
    env: { openExternal: async (uri) => { messages.push(uri); } },
    workspace: {
      workspaceFolders: [{ uri: { toString: () => 'file:///workspace-A' } }],
      getConfiguration: (section) => ({
        get: (key) => section === 'workbench' && key === 'colorTheme' ? 'Bea Theme Neon Night'
          : workspace[key] ?? global[key] ?? 'default',
        inspect: (key) => ({ globalValue: global[key], workspaceValue: workspace[key], ...overrides[key] }),
        update: async (key, value, target) => {
          writes.push({ key, value, target });
          if (writeHook) await writeHook(key, value, target);
          const settings = target === 1 ? global : workspace;
          if (value === undefined) delete settings[key];
          else settings[key] = value;
        },
      }),
    },
    window: {
      activeTextEditor: { document: { uri: 'file:///workspace-A/code.js', languageId: 'javascript' } },
      createOutputChannel: () => ({ appendLine: (text) => messages.push(text), dispose() {} }),
      showWarningMessage: async (text) => { messages.push(text); return typeof answer === 'function' ? answer() : answer; },
      showInformationMessage: async (text) => { messages.push(text); },
      showErrorMessage: async (text) => { messages.push(text); },
      showQuickPick: async (items) => {
        messages.push(items);
        const pick = picks.shift();
        return typeof pick === 'number' ? items[pick] : pick;
      },
      showInputBox: async (options) => {
        const value = inputs.shift();
        if (value !== undefined) assert.equal(options.validateInput(value), undefined);
        return value;
      },
    },
  };
  return {
    vscode, context, global, workspace, overrides, messages, writes, picks, inputs,
    manager: createSettingsManager(vscode, context),
    answer: (value) => { answer = value; }, hook: (value) => { writeHook = value; },
  };
}

test('cancellation never writes settings or saves a backup', async () => {
  const h = harness();
  h.answer(undefined);
  assert.equal(await h.manager.apply('focus', FOCUS, 'global'), false);
  assert.equal(h.writes.length, 0);
  assert.equal(h.context.globalState.get(STATE_KEY), undefined);
  assert.equal(await h.manager.chooseScope(), undefined);
});

test('confirmation applies exact focus settings without touching diagnostics', async () => {
  const h = harness();
  await h.manager.apply('focus', FOCUS, 'global');
  assert.deepEqual(h.global, FOCUS);
  assert.equal(Object.keys(h.global).some((key) => /diagnostic|suggest|accessibility|inlay/i.test(key)), false);
  assert.ok(h.context.globalState.get(STATE_KEY));
  assert.ok(h.messages.some((text) => typeof text === 'string' && text.includes('->')));
});

test('missing explicit values are removed on restore, including after reload', async () => {
  const h = harness();
  await h.manager.apply('focus', FOCUS, 'global');
  const manager = createSettingsManager(h.vscode, h.context);
  h.answer('Restore');
  await manager.restore('focus', 'global');
  assert.deepEqual(h.global, {});
});

test('workspace scope and profile backups are isolated', async () => {
  const h = harness();
  h.global['editor.codeLens'] = true;
  await h.manager.apply('focus', FOCUS, 'workspace');
  assert.equal(h.global['editor.codeLens'], true);
  assert.deepEqual(h.workspace, FOCUS);
  assert.equal(h.context.globalState.get(STATE_KEY), undefined);
  h.answer('Restore');
  await h.manager.restore('focus', 'workspace');
  assert.deepEqual(h.workspace, {});
  h.answer('Apply');
  await h.manager.apply('focus', FOCUS, 'global');
  h.context.globalStorageUri = { toString: () => 'file:///profile-B/globalStorage/beadark' };
  const other = createSettingsManager(h.vscode, h.context);
  await assert.rejects(() => other.restore('focus', 'global'), /different profile/);
});

test('repeated applications retain originals and typography is independent', async () => {
  const h = harness();
  h.global['editor.fontSize'] = 14;
  await h.manager.apply('typography', { 'editor.fontSize': 16 }, 'global');
  await h.manager.apply('typography', { 'editor.fontSize': 18 }, 'global');
  await h.manager.apply('focus', FOCUS, 'global');
  h.answer('Restore');
  await h.manager.restore('typography', 'global');
  assert.equal(h.global['editor.fontSize'], 14);
  assert.equal(h.global['editor.codeLens'], false);
});

test('later user changes survive restoration and reapplication', async () => {
  const h = harness();
  await h.manager.apply('focus', FOCUS, 'global');
  h.global['editor.codeLens'] = true;
  h.answer('Restore');
  await h.manager.restore('focus', 'global');
  assert.deepEqual(h.global, { 'editor.codeLens': true });
  h.answer('Apply');
  await h.manager.apply('typography', { 'editor.fontSize': 16 }, 'global');
  h.global['editor.fontSize'] = 19;
  await h.manager.apply('typography', { 'editor.fontSize': 18 }, 'global');
  h.answer('Restore');
  await h.manager.restore('typography', 'global');
  assert.equal(h.global['editor.fontSize'], 19);
});

test('workspace and language overrides are explained, not overwritten', async () => {
  const h = harness();
  h.workspace['editor.codeLens'] = true;
  h.overrides['editor.codeLens'] = { globalLanguageValue: true };
  await h.manager.apply('focus', FOCUS, 'global');
  assert.equal(h.workspace['editor.codeLens'], true);
  assert.ok(h.messages.some((text) => typeof text === 'string' && text.includes('may mask') && text.includes('editor.codeLens')));
});

test('failed persistence stops before any setting is touched', async () => {
  const h = harness();
  h.context.globalState.update = async () => { throw new Error('disk full'); };
  await assert.rejects(() => h.manager.apply('focus', FOCUS, 'global'), /disk full/);
  assert.equal(h.writes.length, 0);
});

test('partial write failure rolls back safely and reports failure', async () => {
  const h = harness();
  h.global['editor.codeLens'] = true;
  let failed = false;
  h.hook((key) => {
    if (key === 'editor.codeLens' && !failed) { failed = true; throw new Error('write denied'); }
  });
  await assert.rejects(() => h.manager.apply('focus', FOCUS, 'global'), /write denied.*rolled back/);
  assert.deepEqual(h.global, { 'editor.codeLens': true });
  assert.deepEqual(h.manager.read('global').profiles.focus, {});
});

test('failed rollback retains recoverable backups', async () => {
  const h = harness();
  h.hook((key, value) => {
    if (key === 'editor.codeLens' || value === undefined) throw new Error('write denied');
  });
  await assert.rejects(() => h.manager.apply('focus', FOCUS, 'global'), /Recovery backup retained/);
  assert.equal(h.global['editor.minimap.enabled'], false);
  h.hook(undefined);
  h.answer('Restore');
  await h.manager.restore('focus', 'global');
  assert.deepEqual(h.global, {});
});

test('a crash before reapplication writes does not lose the original restoration point', async () => {
  const h = harness();
  h.global['editor.fontSize'] = 14;
  await h.manager.apply('typography', { 'editor.fontSize': 16 }, 'global');
  const journal = h.context.globalState.get(STATE_KEY);
  journal.profiles.typography['editor.fontSize'].pendingBefore = { present: true, value: 16 };
  journal.profiles.typography['editor.fontSize'].applied = { present: true, value: 18 };
  await h.context.globalState.update(STATE_KEY, journal);
  h.answer('Restore');
  await createSettingsManager(h.vscode, h.context).restore('typography', 'global');
  assert.equal(h.global['editor.fontSize'], 14);
});

test('failure to finalize a backup rolls back already written settings', async () => {
  const h = harness();
  const update = h.context.globalState.update;
  let saves = 0;
  h.context.globalState.update = async (...args) => {
    if (++saves === 2) throw new Error('disk full on finalize');
    return update(...args);
  };
  await assert.rejects(() => h.manager.apply('focus', FOCUS, 'global'), /disk full on finalize.*rolled back/);
  assert.deepEqual(h.global, {});
});

test('user edit during confirmation aborts without overwriting it', async () => {
  const h = harness();
  h.answer(() => { h.global['editor.codeLens'] = true; return 'Apply'; });
  await assert.rejects(() => h.manager.apply('focus', FOCUS, 'global'), /changed during confirmation/);
  assert.deepEqual(h.global, { 'editor.codeLens': true });
});

test('restore cancellation and restore write failures retain backups', async () => {
  const h = harness();
  await h.manager.apply('focus', FOCUS, 'global');
  h.answer(undefined);
  await h.manager.restore('focus', 'global');
  assert.deepEqual(h.global, FOCUS);
  h.answer('Restore');
  h.hook(() => { throw new Error('read only'); });
  await assert.rejects(() => h.manager.restore('focus', 'global'), /Remaining backup retained/);
  assert.ok(Object.keys(h.manager.read('global').profiles.focus).length);
});

test('typography cancellation at every wizard step has no side effects', async () => {
  for (let step = 0; step < 5; step++) {
    const h = harness();
    h.picks.push(step === 0 ? undefined : 0);
    h.inputs.push(...['16', '1.5', '0.2'].slice(0, Math.max(0, step - 1)));
    await chooseTypography(h.vscode, h.manager);
    assert.equal(h.writes.length, 0);
  }
});

test('typography uses local family fallback, adjustable metrics and confirmation', async () => {
  const h = harness();
  h.picks.push(2, 0);
  h.inputs.push('Dyslexie', '18', '1.6', '0.4');
  await chooseTypography(h.vscode, h.manager);
  assert.deepEqual(h.global, {
    'editor.fontFamily': "'Dyslexie', monospace",
    'editor.fontSize': 18, 'editor.lineHeight': 1.6, 'editor.letterSpacing': 0.4, 'editor.fontLigatures': false,
  });
});

test('legend reads the selected theme colors instead of hard-coding Neon hex', async () => {
  const h = harness();
  await showLegend(h.vscode, h.context);
  const items = h.messages.find(Array.isArray);
  assert.equal(items.length, 8);
  assert.ok(items.some((item) => item.label === 'Types and classes' && item.description.startsWith('#FF8ADA')));
});

test('operations serialize even after a failure and errors are surfaced', async () => {
  const h = harness();
  const events = [];
  const first = h.manager.serialize(async () => { events.push(1); throw new Error('expected'); });
  const second = h.manager.serialize(async () => { events.push(2); });
  await assert.rejects(first, /expected/);
  await second;
  assert.deepEqual(events, [1, 2]);
  await h.manager.report(new Error('visible failure'));
  assert.ok(h.messages.some((text) => typeof text === 'string' && text.includes('visible failure')));
});
