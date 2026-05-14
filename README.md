# BeaDark

Minimal VS Code theme extension focused on calm, low-noise readability.

## Active Theme

- `Bea's Theme v2.1`
- Theme file: `themes/Bea's Theme v2.1-color-theme.json`

## Build VSIX

- `npm run build:vsix`
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

## Test in Extension Host

- Launch config: `Theme Test (Extension Host)`
- Shortcut: `F5`
