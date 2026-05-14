# Bea Theme v2.1 - Specification

## Objectif

Palette de code calme et lisible pour reduire la charge attentionnelle (TDAH).  
Fond fixe `#191919`, contraste selectif, hierarchie de couleur par sens et non par bruit.

---

## Tableau 1 - Palette nominative

| Nom | Hex | Usage |
|---|---|---|
| bg.canvas | `#191919` | Fond principal editeur |
| bg.elevated | `#202020` | Side bar, panneaux, popups |
| bg.activeLine | `#24272E` | Ligne active |
| bg.selection | `#2B313A` | Selection et surbrillance mot |
| border.subtle | `#30353D` | Bordures discretes |
| fg.primary | `#E6EAF0` | Texte principal |
| fg.secondary | `#B5BDC9` | Texte secondaire, parametres, operateurs |
| fg.muted | `#8C95A3` | Metadonnees, placeholders, inactif |
| fg.comment | `#6F7A89` | Commentaires |
| accent.keyword | `#7AA2F7` | Keywords, control flow, tags, imports |
| accent.function | `#7CD4B8` | Fonctions, methodes, events, macros |
| accent.type | `#E6C07B` | Types, classes, interfaces, namespaces |
| accent.string | `#98C379` | Chaines de caracteres |
| accent.number | `#C792EA` | Nombres, constantes, regexp, decorateurs |
| accent.error | `#E06C75` | Erreurs, invalid, unsafe |
| state.info | `#7AA2F7` | Information UI (= accent.keyword) |
| state.success | `#7CD4B8` | Success UI (= accent.function) |
| state.warning | `#E6C07B` | Warning UI (= accent.type) |
| state.error | `#E06C75` | Error UI (= accent.error) |

---

## Tableau 2 - Scopes par domaine

### A - Noyau syntaxique

| Scope | Foreground | FontStyle |
|---|---|---|
| `comment` | fg.comment | — |
| `punctuation.definition.comment` | fg.comment | — |
| `keyword` | accent.keyword | — |
| `storage` | accent.keyword | — |
| `storage.modifier` | accent.keyword | — |
| `keyword.operator` | fg.secondary | — |
| `punctuation` | fg.secondary | — |
| `meta.brace` | fg.secondary | — |
| `meta.delimiter` | fg.secondary | — |
| `string` | accent.string | — |
| `string.quoted` | accent.string | — |
| `string.template` | accent.string | — |
| `constant.numeric` | accent.number | — |
| `constant.language` | accent.number | — |
| `constant.character` | accent.number | — |
| `constant.other` | accent.number | — |
| `invalid` | accent.error | — |
| `invalid.illegal` | accent.error | — |
| `invalid.deprecated` | accent.error | — |

---

### B - Identifiants et symboles

| Scope | Foreground | FontStyle |
|---|---|---|
| `entity.name.function` | accent.function | — |
| `support.function` | accent.function | — |
| `meta.function-call` | accent.function | — |
| `variable.function` | accent.function | — |
| `entity.name.type` | accent.type | — |
| `entity.name.class` | accent.type | — |
| `support.type` | accent.type | — |
| `support.class` | accent.type | — |
| `storage.type` | accent.type | — |
| `variable` | fg.primary | — |
| `meta.definition.variable.name` | fg.primary | — |
| `support.variable` | fg.primary | — |
| `variable.other.readwrite` | fg.primary | — |
| `variable.parameter` | fg.secondary | — |
| `meta.function.parameters` | fg.secondary | — |
| `variable.language.this` | accent.type | — |
| `variable.language.self` | accent.type | — |

---

### C - Markup et diff

| Scope | Foreground | FontStyle |
|---|---|---|
| `markup.heading`, `markup.heading entity.name` | accent.keyword | bold |
| `markup.bold` | fg.secondary | bold |
| `markup.italic` | fg.secondary | italic |
| `markup.underline` | fg.secondary | underline |
| `markup.strikethrough` | fg.comment | — |
| `markup.link` | accent.function | — |
| `markup.underline.link` | accent.function | — |
| `markup.inline.raw` | accent.function | — |
| `markup.fenced_code` | fg.primary | — |
| `markup.inserted` | state.success | — |
| `punctuation.definition.inserted` | state.success | — |
| `markup.deleted` | state.error | — |
| `punctuation.definition.deleted` | state.error | — |
| `markup.changed` | state.warning | — |
| `meta.diff.header` | fg.secondary | — |

---

### D - HTML et CSS

| Scope | Foreground | FontStyle |
|---|---|---|
| `entity.name.tag` | accent.keyword | — |
| `punctuation.definition.tag` | accent.keyword | — |
| `entity.other.attribute-name` | fg.secondary | — |
| `entity.name.tag.css` | accent.type | — |
| `entity.other.attribute-name.class.css` | accent.type | — |
| `entity.other.attribute-name.id.css` | accent.type | — |
| `meta.selector` | accent.type | — |
| `support.type.property-name.css` | fg.primary | — |
| `support.type.property-name` | fg.primary | — |
| `variable.css` | accent.keyword | — |
| `variable.scss` | accent.keyword | — |
| `variable.other.less` | accent.keyword | — |

---

### E - JSON

| Scope | Foreground | FontStyle |
|---|---|---|
| `support.type.property-name.json` | accent.keyword | — |
| `meta.structure.dictionary.key.json string.quoted.double` | accent.keyword | — |
| `meta.object-literal.key` | accent.keyword | — |
| `meta.object-literal.key entity.name.function` | accent.keyword | — |
| `meta.structure.dictionary.value.json string.quoted.double` | accent.string | — |
| `constant.numeric.json` | accent.number | — |
| `constant.language.json` | accent.number | — |
| `punctuation.separator.dictionary.key-value.json` | fg.secondary | — |
| `punctuation.separator.array.json` | fg.secondary | — |

---

### F - YAML

| Scope | Foreground | FontStyle |
|---|---|---|
| `entity.name.tag.yaml` | accent.keyword | — |
| `string.quoted.single.yaml` | accent.string | — |
| `string.quoted.double.yaml` | accent.string | — |
| `string.unquoted.plain.out.yaml` | accent.string | — |
| `constant.language.boolean.yaml` | accent.number | — |
| `constant.language.null.yaml` | accent.number | — |
| `constant.numeric.yaml` | accent.number | — |
| `entity.name.type.anchor.yaml` | accent.number | — |
| `variable.other.alias.yaml` | accent.number | — |
| `punctuation.definition.anchor.yaml` | accent.number | — |
| `punctuation.definition.alias.yaml` | accent.number | — |
| `punctuation.definition.block.sequence.item.yaml` | fg.secondary | — |
| `punctuation.definition.document.begin.yaml` | fg.comment | — |
| `punctuation.definition.document.end.yaml` | fg.comment | — |

---

### G - Markdown

| Scope | Foreground | FontStyle |
|---|---|---|
| `markup.heading.atx.1.markdown` | accent.keyword | bold |
| `markup.heading.atx.2.markdown` | accent.function | bold |
| `markup.heading.atx.3.markdown` | fg.secondary | bold |
| `markup.heading.atx.4-6.markdown` | fg.secondary | bold |
| `markup.bold.markdown` | fg.primary | bold |
| `markup.italic.markdown` | fg.secondary | italic |
| `markup.inline.raw.string.markdown` | accent.function | — |
| `markup.fenced_code.block.markdown` | fg.primary | — |
| `fenced_code.block.language.markdown` | accent.type | — |
| `markup.quote.markdown` | fg.comment | — |
| `punctuation.definition.list.begin.markdown` | accent.keyword | — |
| `meta.link.inline.markdown` | accent.function | — |
| `string.other.link.title.markdown` | accent.function | — |
| `markup.underline.link.markdown` | accent.keyword | — |
| `markup.underline.link.image.markdown` | accent.keyword | — |
| `string.other.link.description.markdown` | fg.secondary | — |
| `meta.separator.markdown` | border.subtle | — |

---

### H - TypeScript et JavaScript

| Scope | Foreground | FontStyle |
|---|---|---|
| `meta.type.annotation` | accent.type | — |
| `meta.return-type` | accent.type | — |
| `support.type.primitive` | accent.type | — |
| `support.type.builtin` | accent.type | — |
| `entity.name.type.module` | accent.type | — |
| `entity.name.type.interface` | accent.type | — |
| `entity.name.namespace` | accent.type | — |
| `variable.other.constant` | accent.number | — |
| `variable.other.object.property` | accent.keyword | — |
| `meta.decorator` | accent.number | — |
| `punctuation.decorator` | accent.number | — |
| `keyword.control.import` | accent.keyword | — |
| `keyword.control.export` | accent.keyword | — |
| `keyword.control.from` | accent.keyword | — |
| `storage.type.function.arrow` | accent.keyword | — |
| `punctuation.accessor` | fg.secondary | — |
| `punctuation.separator.key-value` | fg.secondary | — |
| `punctuation.definition.template-expression.begin` | accent.keyword | — |
| `punctuation.definition.template-expression.end` | accent.keyword | — |

---

### I - Python

| Scope | Foreground | FontStyle |
|---|---|---|
| `variable.language.special.self.python` | accent.type | — |
| `variable.parameter.function.language.special.cls.python` | accent.type | — |
| `support.function.magic.python` | accent.function | — |
| `entity.name.function.magic.python` | accent.function | — |
| `entity.name.function.decorator.python` | accent.number | — |
| `meta.function.decorator.python` | accent.number | — |
| `keyword.operator.logical.python` | accent.keyword | — |
| `support.type.python` | accent.type | — |
| `variable.other.constant.python` | accent.number | — |
| `punctuation.definition.interpolation.begin.python` | accent.keyword | — |
| `punctuation.definition.interpolation.end.python` | accent.keyword | — |

---

### J - Rust

| Scope | Foreground | FontStyle |
|---|---|---|
| `entity.name.lifetime.rust` | accent.number | — |
| `storage.modifier.lifetime.rust` | accent.number | — |
| `punctuation.definition.lifetime.rust` | accent.number | — |
| `meta.macro.rust` | accent.function | — |
| `support.macro.rust` | accent.function | — |
| `entity.name.function.macro.rust` | accent.function | — |
| `meta.attribute.rust` | accent.number | — |
| `punctuation.definition.attribute.rust` | accent.number | — |
| `entity.name.type.alias.rust` | accent.type | — |
| `entity.name.type.trait.rust` | accent.type | — |
| `storage.modifier.unsafe.rust` | accent.error | — |
| `keyword.other.unsafe.rust` | accent.error | — |
| `meta.path.rust` | fg.primary | — |

---

### K - Go

| Scope | Foreground | FontStyle |
|---|---|---|
| `support.function.builtin.go` | accent.function | — |
| `entity.name.package.go` | accent.type | — |
| `entity.name.type.go` | accent.type | — |
| `keyword.channel.go` | accent.keyword | — |
| `keyword.const.go` | accent.keyword | — |
| `keyword.var.go` | accent.keyword | — |
| `keyword.type.go` | accent.keyword | — |
| `constant.other.placeholder.go` | accent.number | — |

---

### L - C#

| Scope | Foreground | FontStyle |
|---|---|---|
| `entity.name.type.class.cs` | accent.type | — |
| `entity.name.type.struct.cs` | accent.type | — |
| `entity.name.type.enum.cs` | accent.type | — |
| `entity.name.type.interface.cs` | accent.type | — |
| `entity.name.type.delegate.cs` | accent.type | — |
| `source.cs storage.type` | accent.type | — |
| `entity.name.type.attribute.cs` | accent.number | — |
| `meta.attribute.cs` | accent.number | — |
| `comment.block.documentation.cs` | fg.comment | — |
| `comment.xml.doc.cs` | fg.comment | — |
| `meta.preprocessor.cs` | accent.number | — |
| `keyword.preprocessor.cs` | accent.number | — |
| `constant.language.null.cs` | accent.number | — |
| `punctuation.definition.interpolation.begin.cs` | accent.keyword | — |
| `punctuation.definition.interpolation.end.cs` | accent.keyword | — |
| `keyword.query.cs` | accent.keyword | — |

---

### M - Regex et templates

| Scope | Foreground | FontStyle |
|---|---|---|
| `string.regexp` | accent.number | — |
| `constant.regexp` | accent.number | — |
| `keyword.control.anchor.regexp` | accent.number | — |

---

### N - Semantic tokens (LSP)

| Token semantique | Foreground |
|---|---|
| `namespace` | accent.type |
| `class`, `class.defaultLibrary` | accent.type |
| `enum` | accent.type |
| `interface` | accent.type |
| `struct` | accent.type |
| `typeParameter` | accent.type |
| `type`, `type.defaultLibrary` | accent.type |
| `function`, `function.defaultLibrary` | accent.function |
| `method` | accent.function |
| `macro` | accent.function |
| `event` | accent.function |
| `decorator` | accent.number |
| `variable` | fg.primary |
| `variable.readonly` | fg.secondary |
| `parameter` | fg.secondary |
| `property` | accent.keyword |
| `property.readonly` | accent.keyword |
| `enumMember` | accent.number |
| `number` | accent.number |
| `regexp` | accent.number |
| `string` | accent.string |
| `keyword` | accent.keyword |
| `comment` | fg.comment |
| `operator` | fg.secondary |
| `label` | accent.keyword |

---

### O - UI editeur (aide a la concentration)

| Cle UI | Foreground / Valeur |
|---|---|
| `editor.background` | bg.canvas |
| `editor.foreground` | fg.primary |
| `editor.lineHighlightBackground` | bg.activeLine |
| `editor.selectionBackground` | bg.selection |
| `editor.wordHighlightBackground` | bg.selection |
| `editorLineNumber.foreground` | fg.comment |
| `editorLineNumber.activeForeground` | fg.secondary |
| `editorCursor.foreground` | accent.keyword |
| `editorError.foreground` | state.error |
| `editorWarning.foreground` | state.warning |
| `editorInfo.foreground` | state.info |
| `editorHint.foreground` | state.success |
| `editorIndentGuide.background1` | bg.selection |
| `editorIndentGuide.activeBackground1` | border.subtle |
| `editorBracketMatch.border` | accent.keyword |
| `tab.activeBorderTop` | accent.keyword |
| `editorGutter.addedBackground` | state.success |
| `editorGutter.modifiedBackground` | state.info |
| `editorGutter.deletedBackground` | state.error |

---

## Police recommandee

| Critere | Choix |
|---|---|
| Principale | Atkinson Hyperlegible Mono Nerd Font |
| Fallback | JetBrainsMono Nerd Font |
| Taille | 15–16 px |
| Line height | 1.5 |
| Ligatures | Desactivees |
| Letter spacing | 0 a 0.2 |

Telechargement Atkinson:  
<https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/AtkinsonHyperlegibleMono.zip>
