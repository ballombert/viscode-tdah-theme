const { isDeepStrictEqual } = require('node:util');

const STATE_KEY = 'beadark.reading.v1';
const FOCUS = {
  'editor.minimap.enabled': false,
  'editor.codeLens': false,
  'editor.cursorBlinking': 'solid',
  'editor.cursorSmoothCaretAnimation': 'off',
  'editor.smoothScrolling': false,
};

function stored(value) {
  return value === undefined ? { present: false } : { present: true, value };
}

function unstored(value) {
  return value.present ? value.value : undefined;
}

function createSettingsManager(vscode, context) {
  const origin = context.globalStorageUri.toString();
  const output = vscode.window.createOutputChannel('BeaDark');
  context.subscriptions.push(output);
  context.globalState.setKeysForSync([]);
  let queue = Promise.resolve();

  const stateFor = (scope) => scope === 'global' ? context.globalState : context.workspaceState;
  const targetFor = (scope) => scope === 'global'
    ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace;
  const config = () => vscode.workspace.getConfiguration();
  const explicit = (key, scope) => config().inspect(key)?.[scope === 'global' ? 'globalValue' : 'workspaceValue'];
  const workspaceId = () => vscode.workspace.workspaceFile?.toString()
    || JSON.stringify((vscode.workspace.workspaceFolders || []).map((folder) => folder.uri.toString()).sort());
  const identity = (scope) => scope === 'global' ? origin : `${origin}:${workspaceId()}`;
  const read = (scope) => {
    const journal = stateFor(scope).get(STATE_KEY);
    if (!journal) return { version: 1, identity: identity(scope), profiles: {} };
    if (journal.version !== 1 || journal.identity !== identity(scope)) {
      throw new Error('Saved settings belong to a different profile/workspace or unsupported format. No settings were changed.');
    }
    return structuredClone(journal);
  };
  const save = (scope, journal) => stateFor(scope).update(STATE_KEY, journal);

  function serialize(action) {
    const result = queue.then(action);
    // Keep the queue usable; the returned promise still rejects for the command's error handler.
    queue = result.catch(() => {});
    return result;
  }

  async function report(error) {
    output.appendLine(error.stack || String(error));
    await vscode.window.showErrorMessage(`BeaDark: ${error.message} See the BeaDark output channel for details.`);
  }

  async function chooseScope() {
    const options = [{ label: 'User settings (current VS Code profile)', scope: 'global' }];
    if (vscode.workspace.workspaceFolders?.length || vscode.workspace.workspaceFile) {
      options.push({ label: 'Workspace settings (this workspace only)', scope: 'workspace' });
    }
    return (await vscode.window.showQuickPick(options, { title: 'BeaDark: choose settings scope' }))?.scope;
  }

  function overrideWarnings(values, scope) {
    const document = vscode.window.activeTextEditor?.document;
    const resource = document ? { uri: document.uri, languageId: document.languageId } : undefined;
    const current = vscode.workspace.getConfiguration(undefined, resource);
    const warnings = [];
    for (const key of Object.keys(values)) {
      const inspected = current.inspect(key);
      if (!inspected) throw new Error(`Unknown VS Code setting: ${key}`);
      const overridden = (scope === 'global' && inspected.workspaceValue !== undefined)
        || inspected.workspaceFolderValue !== undefined
        || ['defaultLanguageValue', 'globalLanguageValue', 'workspaceLanguageValue', 'workspaceFolderLanguageValue']
          .some((field) => inspected[field] !== undefined);
      if (overridden) warnings.push(key);
    }
    return warnings.length
      ? `\n\nHigher-priority workspace/folder/language values may mask these settings: ${warnings.join(', ')}. `
        + 'Only the chosen scope is changed. Other languages may also have overrides.'
      : '\n\nOther files or languages can have higher-priority settings; these are not overwritten.';
  }

  async function apply(profile, values, scope) {
    const journal = read(scope);
    const before = Object.fromEntries(Object.keys(values).map((key) => [key, stored(explicit(key, scope))]));
    const display = Object.entries(values).map(([key, value]) =>
      `${key}: ${JSON.stringify(config().get(key))} -> ${JSON.stringify(value)}`).join('\n');
    const approved = await vscode.window.showWarningMessage(
      `BeaDark: apply ${profile} to ${scope === 'global' ? 'the current user profile' : 'this workspace'}?\n\n${display}`
        + overrideWarnings(values, scope)
        + (profile === 'typography'
          ? '\n\nFont files must already be installed locally. BeaDark cannot detect installed fonts.' : ''),
      { modal: true }, 'Apply');
    if (approved !== 'Apply') return false;
    const previous = structuredClone(journal.profiles[profile] || {});
    const entries = journal.profiles[profile] ||= {};
    for (const [key, value] of Object.entries(values)) {
      const entry = entries[key];
      // Rebase a later explicit user edit so restoring never loses that edit.
      if (!entry || !isDeepStrictEqual(before[key], entry.applied)) {
        entries[key] = { original: before[key], applied: stored(value) };
      } else {
        entries[key].pendingBefore = before[key];
        entries[key].applied = stored(value);
      }
    }
    await save(scope, journal);
    const written = [];
    try {
      for (const [key, value] of Object.entries(values)) {
        if (!isDeepStrictEqual(stored(explicit(key, scope)), before[key])) {
          throw new Error(`Setting changed during confirmation: ${key}. Please try again.`);
        }
        written.push(key);
        await config().update(key, value, targetFor(scope), false);
      }
      for (const key of Object.keys(values)) delete entries[key].pendingBefore;
      await save(scope, journal);
    } catch (error) {
      const rollbackErrors = [];
      for (const key of Object.keys(values).filter((key) => !written.includes(key))) {
        if (previous[key]) entries[key] = previous[key];
        else delete entries[key];
      }
      for (const key of written.reverse()) {
        try {
          const current = stored(explicit(key, scope));
          if (!isDeepStrictEqual(current, before[key])
            && !isDeepStrictEqual(current, stored(values[key]))) {
            rollbackErrors.push(`${key}: changed externally; not overwritten`);
            continue;
          }
          if (!isDeepStrictEqual(current, before[key])) {
            await config().update(key, unstored(before[key]), targetFor(scope), false);
          }
          if (previous[key]) entries[key] = previous[key];
          else delete entries[key];
        } catch (rollbackError) {
          rollbackErrors.push(`${key}: ${rollbackError.message}`);
        }
      }
      try { await save(scope, journal); } catch (saveError) { rollbackErrors.push(`backup: ${saveError.message}`); }
      throw new Error(`Could not apply ${profile}: ${error.message}. `
        + (rollbackErrors.length ? `Recovery backup retained. Rollback incomplete: ${rollbackErrors.join('; ')}`
          : 'Changes were rolled back.'));
    }
    await vscode.window.showInformationMessage(`BeaDark: ${profile} applied. Use "BeaDark: Restore Reading or Focus Settings" to undo.`);
    return true;
  }

  async function restore(profile, scope) {
    const journal = read(scope);
    const entries = journal.profiles[profile];
    if (!entries || !Object.keys(entries).length) {
      await vscode.window.showInformationMessage(`BeaDark: no saved ${profile} settings in this scope.`);
      return;
    }
    const owned = (key, entry) => {
      const current = stored(explicit(key, scope));
      return isDeepStrictEqual(current, entry.applied)
        || (entry.pendingBefore && isDeepStrictEqual(current, entry.pendingBefore));
    };
    const candidates = Object.entries(entries).filter(([key, entry]) => owned(key, entry));
    const skipped = Object.keys(entries).filter((key) => !candidates.some(([candidate]) => candidate === key));
    const approved = await vscode.window.showWarningMessage(
      `BeaDark: restore ${profile} in ${scope} settings?\n\n`
        + candidates.map(([key, entry]) => `${key} -> ${entry.original.present ? JSON.stringify(entry.original.value) : '(remove explicit value)'}`).join('\n')
        + (skipped.length ? `\n\nKeep newer user values: ${skipped.join(', ')}` : ''),
      { modal: true }, 'Restore');
    if (approved !== 'Restore') return;
    for (const [key, entry] of candidates) {
      if (!owned(key, entry)) continue;
      try {
        await config().update(key, unstored(entry.original), targetFor(scope), false);
        delete entries[key];
        await save(scope, journal);
      } catch (error) {
        throw new Error(`Restore stopped at ${key}: ${error.message}. Remaining backup retained; restored keys stay restored.`);
      }
    }
    // User edits are deliberately left in place and no longer owned by BeaDark.
    for (const key of skipped) delete entries[key];
    await save(scope, journal);
    await vscode.window.showInformationMessage('BeaDark: restoration completed; newer user settings were preserved.');
  }

  return { serialize, report, chooseScope, apply, restore, read, output };
}

module.exports = { createSettingsManager, FOCUS, STATE_KEY };
