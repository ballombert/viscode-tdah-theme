# Validation

## Automated

```sh
npm ci
npm run check
npm run build:vsix
```

`npm run check` regenerates nine themes and checks the palette policy, 134
contrast pairs per theme, metadata consistency and unit tests. Tests include
invalid colors, alpha composition, failed contrast, missing palette values,
restricted Neon exceptions, safe extraction, command cancellation, scopes,
restoration after restart, user edits, overrides and partial write failures.

Generation must be deterministic: rebuilding twice must not change any theme.
Inspect the VSIX ZIP: all nine generated themes, the icon, extension entry point
and reading-settings module must exist; tests, local backups and dependencies
must not be included. Verify the publisher/name, icon, description, links,
categories, commands and theme contributions from the packaged manifest.

Only the nine declared background states are measured, not every possible stack
of multiple decorations. Scope-contract tests do not tokenize source code.
Actual TextMate and language-server behavior needs the checks below.

## Extension Host smoke test

With the locally installed VS Code CLI, create a fresh, short, isolated directory
and workspace without changing your normal settings. From the repository root
in a POSIX-compatible shell:

```sh
TEST_ROOT="$(mktemp -d /tmp/beadark-test.XXXXXX)"
mkdir "$TEST_ROOT/workspace"
code --wait --new-window --user-data-dir "$TEST_ROOT/user" \
  --extensions-dir "$TEST_ROOT/extensions" \
  --extensionDevelopmentPath="$PWD" \
  --extensionTestsPath="$PWD/test/host/index.js" "$TEST_ROOT/workspace"
```

`TEST_ROOT` is specific to this run. Keep its value if you want to inspect or
remove that directory after VS Code exits. Do not reuse someone else's data
directory. On Windows, use equivalent fresh directories and absolute paths.
The host test activates BeaDark, verifies commands and theme contributions,
exercises settings with the real Configuration API using temporary workspace
values and restores everything in `finally`. It does not automate font
installation, modal confirmation or visual comfort.

### Actual renderer checks

The optional renderer test uses VS Code's local Chromium debugging interface,
not a separate imitation of the theme. Bind it to localhost and close the test
instance afterwards. On macOS, the directly launched application reports the
Extension Host test exit status:

```sh
BEADARK_CDP_PORT=9334 \
  "/Applications/Visual Studio Code.app/Contents/MacOS/Code" \
  --remote-debugging-port=9334 --remote-debugging-address=127.0.0.1 \
  --user-data-dir "$TEST_ROOT/user" \
  --extensions-dir "$TEST_ROOT/extensions" \
  --extensionDevelopmentPath="$PWD" \
  --extensionTestsPath="$PWD/test/host/index.js" "$TEST_ROOT/workspace"
```

Run the directory setup above in the same shell first. Use an unused local port.
An optional `BEADARK_CAPTURE_DIR` saves screenshots of
the nine TypeScript theme views. macOS IPC paths must be short; a long
`--user-data-dir` can prevent VS Code from starting.

The test checks actual DOM/computed colors for the background, six TypeScript
syntax roles, declaration keywords, comments and neutral bracket pairs in all
nine themes with semantic highlighting off/on. It also checks representative
TextMate tokens in JS, Python, Rust, Go, C#, HTML, CSS, JSON, YAML and Markdown
across all nine themes.

Only in the isolated renderer test, automatic system color-scheme/high-contrast
switching is temporarily disabled, then restored. The extension itself never
changes those accessibility settings.

### Validation performed

- Unit tests and all 1,206 declared contrast pairs pass.
- VS Code 1.145.2 on macOS: activation without preference mutation, command
  registration, nine theme selections, real Configuration API writes and
  selective restoration pass.
- The optional actual-renderer checks above pass with the bundled grammars.
  They exposed and now guard against declaration keywords being colored as types
  and default rainbow brackets adding unplanned accents.
- The original PNG is 512 x 512; 16 px and 32 px reductions retain its silhouette.
- VSIX contents and publication metadata were inspected after packaging.

Not established by these checks: installed Atkinson/OpenDyslexic/Dyslexie font
rendering, every language-server-specific semantic modifier, all popup/modal
interactions, screen-reader compatibility, color-vision-deficiency discrimination
or individual comfort. Use the checklist below for those evaluations.

## Visual checklist (F5)

Use each theme with the files in `test/fixtures/`.

1. Compare keywords, functions, types, strings, numbers, decorators, comments
   and neutral punctuation. Inspect tokens with **Developer: Inspect Editor
   Tokens and Scopes**.
2. Compare `editor.semanticHighlighting.enabled` on/off in the test window;
   wait for the relevant language service. Missing optional language extensions
   mean semantic coverage for those languages is not validated.
3. Check active line, selection/inactive selection, search results and occurrence
   highlighting. Confirm small comments remain readable.
4. Open completion, hover, dropdowns and inputs. Navigate by keyboard; check focus
   outlines, active/inactive tabs and selections.
5. Trigger error and warning diagnostics; check squiggles, messages and gutter.
   Check debug status-bar cues without a distracting full-width color flash.
6. Try both Neon variants. Confirm six role colors and absence of glow/animation.
   Inspect in grayscale and with color-vision-deficiency simulations; do not
   assume all six hues remain distinguishable.
7. Test typography with actually installed fonts, including `0 O`, `1 l I`,
   brackets, indentation and box alignment. Inspect fallback with a deliberately
   missing family. Do not claim to have tested unavailable fonts.
8. Apply/cancel focus and typography separately. Restart the host; restore each
   group. Change a value manually before restoring; it must survive. Check user,
   workspace and language overrides.
9. Check the original icon at 16, 32, 128 and 512 px and in the VSIX details.

Contrast arithmetic is reproducible. Visual comfort, assistive-technology
compatibility and clinical benefit cannot be inferred from these unit tests.
