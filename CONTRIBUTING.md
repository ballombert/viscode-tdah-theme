# Contributing to BeaDark

Thank you for helping improve BeaDark. Bug reports, documentation fixes,
accessibility feedback, theme refinements and code contributions are welcome.
There is no single visual preference that works for everyone: describe the
problem and the trade-offs, and avoid presenting a design as a medical treatment.

## Report a problem or suggest an improvement

Search the [existing issues](https://github.com/ballombert/viscode-tdah-theme/issues)
before opening a new one. Include:

- The extension version, VS Code version and operating system.
- The selected theme and the steps needed to reproduce the problem.
- Expected and actual behavior, with a small example or screenshot when useful.
- For syntax colors, the language, its extension/provider, and whether semantic
  highlighting is enabled.
- For settings or restoration, the selected VS Code profile, scope
  (user/workspace) and relevant overrides, without sharing private values.

Remove private code, personal information and secrets from logs and screenshots.
For general usage questions, include what you have already tried; see the
[troubleshooting guide](README.md#troubleshooting).

## Set up the project

Requirements: Git, Node.js 22 or later, npm and desktop VS Code 1.118.0 or later.
From a clone:

```sh
git clone https://github.com/ballombert/viscode-tdah-theme.git
cd viscode-tdah-theme
npm ci
npm run check
```

`npm run check` builds the themes, checks their contrast and runs the automated
tests. It writes generated theme files and compatibility outputs; review those
changes rather than discarding edits you did not make. To try the extension in a
separate Extension Host window, open the repository in VS Code and press **F5**
with the **Theme Test (Extension Host)** launch configuration selected.
See [validation.md](docs/validation.md) for the automated and visual checklists.

## Where to make changes

| Area | Source of truth |
|---|---|
| Theme definitions and variant list | [themes/manifest.json](themes/manifest.json) |
| Individual color values | [themes/palettes/](themes/palettes/) |
| Shared TextMate, semantic and UI rules | [themes/templates/bea-v2.1.template.jsonc](themes/templates/bea-v2.1.template.jsonc) |
| Generated theme outputs | [themes/generated/](themes/generated/) — regenerate; do not edit by hand |
| Extension commands and settings | [extension.js](extension.js), [lib/reading-settings.js](lib/reading-settings.js) |
| Publication metadata and VS Code contributions | [package.json](package.json) |
| Tests and language examples | [test/](test/) |
| Design constraints | [theme specification](docs/beadark-spec.md) |

The v2.1 compatibility palette and historical theme file are regenerated from
Onyx; they are not independent sources. `npm run theme:extract-and-apply` writes
an exploratory copy under ignored `themes/extracted/`, not the maintained
template or palettes.

### Theme changes

1. Edit the appropriate palette or shared template. Preserve each collection's
   role mapping and the existing theme labels unless the change explicitly calls
   for a compatibility break.
2. Run `npm run theme:build-all`, `npm run theme:check-contrast` and `npm test`,
   or run all three via `npm run check`.
3. Include the relevant regenerated files in your pull request. Examine the
   changes in both light and dark variants and check selections, comments,
   keyboard focus and diagnostics when affected.
4. If adding a variant, update the theme manifest **and** the contribution in
   `package.json`; keep names, paths and types consistent. Extend the tests and
   documentation where needed.

The contrast checks cover declared foreground/background pairs, not every VS
Code state or extension. See the [specification](docs/beadark-spec.md)
and [validation checklist](docs/validation.md) before making accessibility claims.
Semantic token providers and TextMate grammars can differ by language; inspect
actual tokens when changing language-specific rules.

### Commands and settings

Keep typography and focus opt-in. Show the proposed changes and scope before
confirmation, preserve later user edits when restoring settings, and surface
errors. Add or update tests for behavior changes, including cancellation and
restoration. Do not silently download or bundle fonts; check the font's license
before proposing redistribution.

## Submit a pull request

1. Create a branch in your fork or clone and keep the change focused.
2. Add or update tests and documentation relevant to the change.
3. Run `npm run check`. For packaging changes, also run `npm run build:vsix`.
   The build does not install or publish the extension.
4. Open a pull request describing the motivation, changes, tests run and any
   limitations. For visual changes, include representative before/after
   screenshots and the tested theme(s), if possible.
5. Link the related issue when applicable and be respectful in review and
   discussion. Accessibility feedback from people with different needs is
   especially valuable.

By contributing, you agree that your contribution may be distributed under the
repository's [MIT License](LICENSE). Only submit material you have the right to
contribute.
