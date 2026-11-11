# BeaDark

**Colorful code, quieter surroundings.** BeaDark is a collection of nine
contrast-checked color themes for Visual Studio Code, including two optional
Neon variants. It also offers independent, reversible commands for reading
typography and focus.

The project explores ways to make code easier to read with strong contrast,
consistent syntax colors and fewer visual distractions. It does not diagnose
or treat ADHD or dyslexia, and no theme or font works best for everyone.

- Seven calm themes and two Neon themes, in light and dark variants.
- A consistent color role for keywords, functions, types, strings and more.
- Optional focus and typography settings, applied only after confirmation.
- No font downloads, telemetry, added animations or glow effects.

[Get started](#installation) · [Themes](#themes) ·
[Reading fonts](#reading-fonts) · [Accessibility and evidence](#contrast-targets-and-evidence) ·
[Contributing](CONTRIBUTING.md) · [Report an issue](https://github.com/ballombert/viscode-tdah-theme/issues)

## Installation

### From a VSIX

BeaDark requires **desktop VS Code 1.118.0 or later**. Download a `.vsix` asset
from the repository's [GitHub Releases](https://github.com/ballombert/viscode-tdah-theme/releases)
page, if a release is available. To install it:

1. In VS Code, open **Extensions** (`Ctrl+Shift+X` on Windows/Linux,
   `Cmd+Shift+X` on macOS).
2. Select **… → Install from VSIX…**, then choose the downloaded file.
3. If prompted, reload the window.
4. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`), run
   **Preferences: Color Theme**, and select a **Bea Theme**.

Alternatively, if the `code` command is installed, run:

```sh
code --install-extension /path/to/beadark.vsix
```

Replace the path with the downloaded file; quote it if it contains spaces.
To build a VSIX from source, follow [Develop and validate](#develop-and-validate).
The optional commands use a desktop extension host; VS Code for the Web is not
currently a documented target.

### First steps

Try **Bea Theme Onyx** for a dark, calm palette or **Bea Theme Polar** for a
light one. For brighter syntax accents, select **Bea Theme Neon Night** or
**Bea Theme Neon Day**. Choosing a theme does not change your font or enable
the focus settings.

To try the optional settings, open the Command Palette and run
**BeaDark: Choose Reading Typography** or **BeaDark: Enable Focus Settings**.
You can review and cancel the proposed changes before they are applied.

## Themes

| Collection | Dark | Light |
|---|---|---|
| Calm | Onyx, Deep Sea, Forest Night, Slate Focus, Dracula (Cool) | Polar, Paper Mint |
| Neon | Neon Night | Neon Day |

Select **Preferences: Color Theme** and choose a **Bea Theme**.
All nine themes are included in one VSIX. The original seven labels are unchanged,
but their colors now have stronger contrast, including readable comments.
These remain ordinary dark/light themes, not VS Code's native high-contrast modes.
System high-contrast detection can take priority over a selected theme;
BeaDark deliberately leaves that accessibility preference untouched.

## Syntax color roles

| Role | Calm collection | Neon collection |
|---|---|---|
| Keywords / control flow | Blue | Electric blue |
| Functions / methods | Mint | Electric cyan |
| Types / classes | Cool cyan | Neon pink |
| Strings | Green | Neon green |
| Numbers / constants | Violet | Bright violet |
| Decorators / annotations | Violet | Yellow |
| Variables / punctuation | Neutral | Neutral |
| Errors | Red + diagnostic cues | Red + diagnostic cues |

Neon is an optional aesthetic, not a proven attention aid. **Neon Day uses darker
versions of the six accents**: fluorescent colors on a pale background would not
be readable. Neither collection uses halos, flashing or rainbow UI borders.
Warnings have their own UI role, separate from types and decorators.

TextMate scopes provide the baseline. Language extensions can refine the result
through semantic tokens; exact coverage depends on the grammar/provider.
The same role keeps its color across languages within a collection.
Use **BeaDark: Show Syntax Color Legend** for the selected theme's actual hex values.
Color alone is not enough: syntax, squiggles and diagnostic messages remain useful,
including for people who cannot distinguish all six hues.

## Optional commands

Open the Command Palette:

- **BeaDark: Choose Reading Typography** — choose a locally installed family,
  size (10–40 px), line height (1–2 ×) and letter spacing (0–2 px).
  Proposed starting values: 16 px, 1.5 ×, 0.2 px; ligatures off.
- **BeaDark: Enable Focus Settings** — hide the minimap and CodeLens, use a
  solid cursor, disable smooth caret animation and smooth scrolling.
  Diagnostics, suggestions, inlay hints, guides and accessibility settings are
  **not disabled**.
- **BeaDark: Restore Reading or Focus Settings** — restore one group at a time.
- **BeaDark: Show Syntax Color Legend** — text labels, examples and actual colors;
  no permanent panel.

Typography and focus are independent. Each command lets you choose **user settings
in the current VS Code profile** or **workspace settings**, then shows a change
preview and asks for confirmation. Canceling makes no changes. The theme is never
switched automatically.

Backups are saved locally before settings are written and survive extension-host
restarts. Restoration removes values that were originally absent and preserves
later user edits. Repeated applications keep the original backup; reapplying after
a manual change takes that newer choice as the restoration point. If a write
fails, BeaDark reports it, attempts rollback and retains any remaining recovery
backup. Details appear in the **BeaDark** output channel.

Workspace/folder and language-specific settings can override user preferences.
BeaDark warns about detected overrides in the active document; it does not rewrite
them or inspect every possible language. Restore in the original profile/workspace
**before uninstalling**, deleting that workspace, or changing profiles. Uninstalling
an extension cannot reliably run a restoration command.

## Reading fonts

Fonts must be **installed manually on the computer running the VS Code UI**.
A color theme cannot install or enforce a font. BeaDark cannot enumerate installed
fonts: if a family is unavailable, VS Code uses the configured `monospace` fallback.
Check the result visually, especially `0 O`, `1 l I`, punctuation and indentation.
The terminal and workbench fonts are not changed.

- [Atkinson Hyperlegible Mono — Braille Institute](https://www.brailleinstitute.org/freefont/):
  recommended starting point for code, with fixed-width and differentiated glyphs.
- [OpenDyslexic](https://opendyslexic.org/): optional personal preference.
  The selected family is `OpenDyslexic`; proportional versions can disrupt
  code alignment. A monospace fallback does **not** make a proportional font
  monospaced. Use Custom installed font for another installed family/version.
- **Dyslexie** is a different font, not a synonym for OpenDyslexic. If you already
  have it installed under its applicable license, enter its family through
  **Custom installed font**. No font files are bundled or redistributed.

On macOS, install fonts using Font Book; on Windows, use the font file's Install
action; on Linux, follow your distribution's font installation instructions.
Restart VS Code if a newly installed font is not picked up.

No font is universally best for dyslexia, and this extension does not diagnose
or treat ADHD/dyslexia. Larger spacing is adjustable, not imposed as a treatment.

## Contrast targets and evidence

The build checks **134 declared foreground/background pairs per theme**:

- **7:1** for code text on the normal editor background (comments excluded).
- **4.5:1** for comments, UI text and code on the declared selection, active-line,
  search and occurrence-highlight backgrounds.
- **3:1** for essential focus, input boundary and editor diagnostic/cursor cues.

Transparent backgrounds are composited before measurement; thresholds are not
rounded to pass. Decorative borders and whitespace are intentionally quieter.
This is **not a blanket WCAG certification of VS Code**, its extensions, terminal
output, every popup, stacked decoration or custom user override. Terminal ANSI
colors also depend on applications' chosen foreground/background combinations.

Sources informing the design:

- W3C: [minimum text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html),
  [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- W3C: [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/):
  personalization and avoiding unnecessary interruptions; supplemental guidance,
  not clinical evidence for this theme.
- Kuster et al.: [Dyslexie font does not benefit reading in children with or without dyslexia](https://doi.org/10.1007/s11881-017-0154-6).
  Font marketing is not evidence of universal benefit.
- Zorzi et al. (2012): [Extra-large letter spacing improves reading in dyslexia](https://pmc.ncbi.nlm.nih.gov/articles/PMC3396504/).
  A study of children reading prose, not proof about adults reading source code.

Try short, comparable reading tasks using your normal font and a proposed font.
Compare comfort, mistakes and navigation in both light and dark environments.
Keep what helps you; high contrast and saturated accents are not comfortable
for everyone.

## Troubleshooting

| Problem | What to check |
|---|---|
| The theme or commands are missing | Confirm the VSIX is installed and enabled in desktop VS Code, check your VS Code version, then reload the window. Search for `Bea Theme` or `BeaDark:` in the Command Palette. |
| A font looks unchanged | Install the font on the computer running the VS Code UI, verify its exact family name, and restart VS Code. An unavailable font falls back to `monospace`. |
| A confirmed setting appears unchanged | A workspace, folder or language-specific setting may take precedence. Review the warning shown by BeaDark and inspect your VS Code settings for overrides. |
| Colors differ from the legend | Check theme or token-color customizations, the active language extension and semantic highlighting. The legend describes the theme's defaults, not user overrides. |
| The chosen theme switches unexpectedly | VS Code may select a theme based on system color-scheme or high-contrast settings. BeaDark does not disable those accessibility settings. |
| Settings were not restored | Choose the same profile or workspace and settings group used when applying them. Later manual changes are intentionally preserved. Check the **BeaDark** output channel for errors. |

For a reproducible problem, [open an issue](https://github.com/ballombert/viscode-tdah-theme/issues)
and include the VS Code and extension versions, operating system, theme name,
steps to reproduce and expected behavior. For syntax-color issues, include a
small example, language extension and whether semantic highlighting is enabled.
Remove private code and personal information from screenshots and logs.

## Develop and validate

Node.js **22+** and npm:

```sh
npm ci
npm run check
npm run build:vsix
```

- `npm run theme:build-all`: deterministic generation from
  [the manifest](themes/manifest.json), palettes and the shared JSONC template.
- `npm run theme:check-palettes`: cold-tone policy for Calm; narrowly scoped
  pink/yellow exceptions for Neon types/decorators only.
- `npm run theme:check-contrast`: measured pairs and explicit failures.
- `npm test`: contrast math, theme contracts, metadata and command behavior.
- `npm run theme:extract-and-apply`: exploratory extraction into ignored
  `themes/extracted/`, never over the maintained palettes/template.
- `npm run install:vsix`: explicitly install the latest local VSIX.
- **F5**, configuration **Theme Test (Extension Host)**: isolated development window.

See the [specification](docs/beadark-spec.md) and
[validation checklist](docs/validation.md) for scope and visual checks.
The [contribution guide](CONTRIBUTING.md) explains the source files, generated
outputs and pull request workflow.
`package.json` is the only publication-metadata source; the theme manifest only
describes generation. The original 512 px BeaDark monogram is retained and packaged.

The build-only `@vscode/vsce` dependency is pinned. Its `minimatch` dependency is
overridden to 11.0.8 to avoid
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249);
packaging is verified with that version. No npm dependency is shipped at runtime.

## Releases

Pushes to `main` run checks and package all nine themes and commands.
The existing GitHub workflow publishes a GitHub release containing a uniquely
build-versioned VSIX. Local builds do not publish or install anything.

## License and contributions

BeaDark is available under the [MIT License](LICENSE). Contributions, bug reports
and accessibility feedback are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
Font files are not included in the extension and remain subject to their own
licenses.
