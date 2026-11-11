const assert = require('node:assert/strict');
const vscode = require('vscode');
const { createSettingsManager, FOCUS } = require('../../lib/reading-settings');

async function run() {
  const extension = vscode.extensions.getExtension('ballombert.beadark');
  assert.ok(extension, 'Development extension must be loaded');
  const configuration = vscode.workspace.getConfiguration();
  const originalFocus = Object.fromEntries(Object.keys(FOCUS).map((key) => [key, configuration.inspect(key).workspaceValue]));
  const originalTypography = configuration.inspect('editor.fontSize').workspaceValue;
  const originalTheme = configuration.inspect('workbench.colorTheme').workspaceValue;
  await extension.activate();
  for (const [key, value] of Object.entries(originalFocus)) {
    assert.deepEqual(configuration.inspect(key).workspaceValue, value, 'Activation must not mutate settings');
  }
  const commands = await vscode.commands.getCommands(true);
  for (const entry of extension.packageJSON.contributes.commands) assert.ok(commands.includes(entry.command));
  assert.equal(extension.packageJSON.contributes.themes.length, 9);
  assert.ok(vscode.workspace.workspaceFolders?.length, 'Open an isolated test folder to test workspace settings');
  const state = new Map();
  const memento = {
    get: (key) => state.get(key),
    update: async (key, value) => { state.set(key, structuredClone(value)); },
    setKeysForSync() {},
  };
  let answer = 'Apply';
  const messages = [];
  const facade = {
    ConfigurationTarget: vscode.ConfigurationTarget,
    workspace: vscode.workspace,
    window: {
      activeTextEditor: vscode.window.activeTextEditor,
      createOutputChannel: vscode.window.createOutputChannel,
      showWarningMessage: async (text) => { messages.push(text); return answer; },
      showInformationMessage: async (text) => { messages.push(text); },
    },
  };
  const subscriptions = [];
  const context = {
    globalStorageUri: vscode.Uri.parse('file:///beadark-test-profile'),
    globalState: memento, workspaceState: memento, subscriptions,
  };
  const manager = createSettingsManager(facade, context);
  try {
    await manager.apply('focus', FOCUS, 'workspace');
    for (const [key, value] of Object.entries(FOCUS)) assert.equal(configuration.inspect(key).workspaceValue, value);
    answer = 'Restore';
    await createSettingsManager(facade, context).restore('focus', 'workspace');
    for (const [key, value] of Object.entries(originalFocus)) assert.deepEqual(configuration.inspect(key).workspaceValue, value);
    answer = 'Apply';
    await manager.apply('typography', { 'editor.fontSize': 18 }, 'workspace');
    await configuration.update('editor.fontSize', 19, vscode.ConfigurationTarget.Workspace);
    answer = 'Restore';
    await manager.restore('typography', 'workspace');
    assert.equal(configuration.inspect('editor.fontSize').workspaceValue, 19, 'Preserve a later user edit');
    for (const theme of extension.packageJSON.contributes.themes) {
      await configuration.update('workbench.colorTheme', theme.label, vscode.ConfigurationTarget.Workspace);
      assert.equal(vscode.workspace.getConfiguration().get('workbench.colorTheme'), theme.label);
    }
    assert.ok(messages.some((text) => text.includes('Keep newer user values')));
    if (process.env.BEADARK_CDP_PORT) {
      await require('./render').verifyRendering(vscode, extension, process.env.BEADARK_CAPTURE_DIR);
    }
    console.log('BeaDark Extension Host: activation, 4 commands, 9 theme selections and real settings/restore passed.');
  } finally {
    for (const [key, value] of Object.entries(originalFocus)) {
      await configuration.update(key, value, vscode.ConfigurationTarget.Workspace);
    }
    await configuration.update('editor.fontSize', originalTypography, vscode.ConfigurationTarget.Workspace);
    await configuration.update('workbench.colorTheme', originalTheme, vscode.ConfigurationTarget.Workspace);
    for (const subscription of subscriptions) subscription.dispose();
  }
}

module.exports = { run };
