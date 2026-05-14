# BeaDark

Minimal VS Code theme extension focused on calm, low-noise readability.

## Included Themes (single VSIX)

- Bea Theme Onyx (dark)
- Bea Theme Deep Sea (dark)
- Bea Theme Forest Night (dark)
- Bea Theme Slate Focus (dark)
- Bea Theme Dracula (Cool) (dark)
- Bea Theme Polar (light)
- Bea Theme Paper Mint (light)

Theme outputs are generated in `themes/generated/` and all variants are bundled in one VSIX.

## Palette Policy

- No yellow/orange/red/pink for regular text roles (outside error states).
- Warm tones are reserved for explicit error signaling.
- Warning UI remains distinct and controlled by the palette policy checks.

## Generate Themes

- `npm run theme:build-all` (build all variants from `themes/manifest.json`)
- `npm run theme:check-palettes` (validate warm-tone policy)
- `npm run theme:apply-palette -- --palette <path> --out <path>` (single variant)

## Build VSIX

- `npm run build:vsix` (includes `theme:build-all` before packaging)
- or VS Code task: `Theme: Build VSIX`

## Release automatique

- Chaque push sur `main` déclenche un build GitHub Actions.
- Le pipeline genere une version de pre-release unique au format `0.0.1-build.<run_number>.<short_sha>`.
- La release GitHub publie le fichier `.vsix` associe a cette version.

## Install VSIX locally

- `npm run install:vsix`
- or VS Code task: `Theme: Install Latest VSIX`

## Rebuild + Install

- VS Code task: `Theme: Build + Install`
- or `npm run rebuild:vsix && npm run install:vsix`

## Test in Extension Host

- Launch config: `Theme Test (Extension Host)`
- Shortcut: `F5`
