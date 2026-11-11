# BeaDark : specification de lisibilite

## Objectif

Fort contraste utile, interface calme et reperes syntaxiques previsibles.
La lisibilite mesuree ne prouve pas une reduction des symptomes du TDAH ou de la
dyslexie. Le confort depend de la personne, de l'ecran et de l'eclairage.

Cette specification remplace l'ancienne table de couleurs v2.1 ; les couleurs
exactes sont dans les palettes et dans la legende du theme selectionne.

## Variantes dans un seul VSIX

| Collection | Variante | Mode |
|---|---|---|
| calm | Bea Theme Onyx | dark |
| calm | Bea Theme Deep Sea | dark |
| calm | Bea Theme Forest Night | dark |
| calm | Bea Theme Slate Focus | dark |
| calm | Bea Theme Dracula (Cool) | dark |
| calm | Bea Theme Polar | light |
| calm | Bea Theme Paper Mint | light |
| neon | Bea Theme Neon Night | dark |
| neon | Bea Theme Neon Day | light |

Les sept premiers labels et chemins de contribution sont conserves.
Les themes restent declares `vs-dark`/`vs`, sans reclassement arbitraire en
`hc-black`/`hc-light`. Les modes HC natifs de VS Code restent disponibles.

## Roles de couleur

| Token de palette | Sens | Calm | Neon |
|---|---|---|---|
| COLOR_ACCENT_BLUE | mots-cles, controle, cles JSON | bleu | bleu electrique |
| COLOR_ACCENT_MINT | fonctions, methodes, macros | menthe | cyan electrique |
| COLOR_SYNTAX_TYPE | types, classes, interfaces | cyan froid | rose |
| COLOR_ACCENT_GREEN | chaines | vert | vert neon |
| COLOR_ACCENT_PURPLE | nombres, constantes, regexp | violet | violet lumineux |
| COLOR_SYNTAX_DECORATOR | decorateurs, annotations | violet | jaune |
| COLOR_TEXT_PRIMARY | variables et texte principal | neutre | neutre |
| COLOR_TEXT_SECONDARY | parametres, operateurs, ponctuation | neutre | neutre |
| COLOR_TEXT_MUTED | commentaires | neutre lisible | neutre lisible |
| COLOR_TEXT_SUBTLE | metadonnees et texte UI secondaire | neutre lisible | neutre lisible |
| COLOR_ACCENT_RED | erreurs | rouge | rouge |
| COLOR_STATE_WARNING | avertissements UI | ambre controle | ambre controle |

La politique froide demeure pour les roles texte de Calm. Pour Neon seulement,
le rose est autorise pour les types et le jaune pour les decorateurs.
Une collection inconnue ou une couleur invalide fait echouer la verification.
Ces restrictions esthetiques ne sont pas des prescriptions medicales.

Neon est facultatif, sans halo, animation ni decoration supplementaire.
Neon Day utilise des teintes plus foncees afin de respecter le contraste.
Les six accents ont des valeurs distinctes ; cela ne garantit pas qu'ils sont
tous discernables avec chaque deficience de perception des couleurs.
Les noms, la syntaxe, les soulignements et les messages restent essentiels.

## Contrats de contraste

Calcul sRGB WCAG : linearisation, luminance relative puis
`(Lmax + 0.05) / (Lmin + 0.05)`. Composition alpha avant mesure.
Le test compare le resultat non arrondi.

- Code normal : 7:1 minimum pour texte principal, secondaire et six roles.
- Commentaires, texte UI actif et texte secondaire : 4,5:1 minimum.
- Texte de l'editeur sur fond de selection, selection inactive, occurrence,
  recherche et ligne active : 4,5:1 minimum, y compris commentaires.
- Focus et bordure de saisie : 3:1 minimum sur fond editeur et surface.
- Curseur, diagnostics et bordure de recherche : 3:1 sur fond editeur.

La liste executable des **134 paires par theme** se trouve dans
`scripts/theme-contract.js`. Les fonds effectivement testes sont nommes
explicitement ; les ombres, separateurs decoratifs et espaces restent discrets.
Le terminal, tous les etats de toutes les extensions, les superpositions multiples
et les surcharges utilisateur ne sont pas couverts par une certification globale.

Les fonds de boutons sont independants des couleurs syntaxiques.
Les diagnostics ne partagent plus le role des types. La barre de debug conserve
un fond calme avec un repere colore plutot qu'un grand aplat vif.

## Coloration TextMate et LSP

Le template conserve les domaines existants : noyau generique, JS/TS, Python,
Rust, Go, C#, HTML/CSS, JSON, YAML, Markdown et regexp.
Les semantic tokens reprennent les memes roles que TextMate.

- Pas de coloration englobante de `meta.function-call` ni de toute une liste de
  parametres : les sous-expressions conservent leurs propres roles.
- Mots-cles de declaration (`const`, `function`, `interface`, `class`) : bleu,
  pas la couleur du nom de type. Les six niveaux de parentheses/accolades restent
  neutres ; seule la paire active a un repere de correspondance.
- Decorateurs : noms et ponctuations cibles plutot que leur expression complete.
- `unsafe` Rust reste un mot-cle ; il n'est pas en soi une erreur.
- Depreciation : barrement, sans forcer une couleur d'erreur.
- Constantes readonly : violet lorsque le fournisseur les identifie ainsi.

La couverture reelle depend des grammaires et des fournisseurs semantiques.
Les tests de scopes verifies dans les JSON ne remplacent pas la verification
de tokenisation dans Extension Host. Les exemples sont dans `test/fixtures/`.

## Commandes facultatives

| Commande | Fonction |
|---|---|
| beadark.chooseTypography | police locale, taille, interligne, espacement, ligatures off |
| beadark.enableFocus | minimap et CodeLens off, curseur fixe, animations douces off |
| beadark.restoreSettings | restaurer typographie ou concentration |
| beadark.showLegend | noms des roles, exemples et couleurs du theme actif |

Activation uniquement a l'appel d'une commande, aucune mutation au chargement.
Choix de portee utilisateur du profil courant ou espace de travail, apercu,
puis confirmation. Annulation sans effet. Diagnostics, suggestions, inlay hints,
guides et aides d'accessibilite sont conserves.

Sauvegarde persistante avant ecriture, groupes independants, valeurs absentes
restaurees par suppression. Une valeur modifiee ensuite par l'utilisateur n'est
pas ecrasee. Reapplication apres changement manuel : ce changement devient le
nouveau point de restauration. Les operations d'une fenetre sont serialisees.
Les surcharges workspace/folder/langage detectees pour le document actif sont
signalees ; elles ne sont pas automatiquement reecrites.

Echecs : notification, journal BeaDark, rollback prudent ; sauvegarde residuelle
conservee si le rollback echoue. Restaurer dans le profil/espace initial avant
desinstallation. Aucun hook de desinstallation n'est presume.

## Typographie

Atkinson Hyperlegible Mono est le choix de depart propose. OpenDyslexic reste
optionnel ; sa version proportionnelle peut casser les alignements. Dyslexie est
une autre famille, utilisable via saisie personnelle si installee et autorisee.
Aucun fichier de police n'est redistribue ni telecharge par l'extension.

Valeurs proposees : 16 px, interligne 1,5, espacement 0,2 px, ligatures off.
Valeurs ajustables : taille 10-40 px, interligne 1-2, espacement 0-2 px.
Ces bornes sont des choix de produit, non des seuils medicaux.
L'API VS Code ne fournit pas d'inventaire fiable des polices locales.
Le repli `monospace` ne transforme pas une famille proportionnelle en chasse fixe.
La police du terminal et celle de l'interface ne sont pas modifiees.

## Generation et publication

- Template maintenu : `themes/templates/bea-v2.1.template.jsonc`.
- Source des variantes : `themes/manifest.json`, sans duplication des metadonnees
  de publication de `package.json`.
- Palettes maintenues : `themes/palettes/`.
- Sorties JSON strictes : `themes/generated/`.
- Source historique v2.1 et palette de compatibilite : copies Onyx regenerees,
  pas des sources independantes a modifier.
- Extraction exploratoire : `themes/extracted/` ignore par Git ; impossible
  d'ecraser le template partage ou les palettes maintenues avec l'extracteur.
- `npm run check` valide politique, contraste, contrats et commandes.
- `npm run build:vsix` execute les controles avant packaging.

Le VSIX contient l'icone PNG 512 px existante, les neuf themes et le code des
commandes. Tests, scripts de developpement et palettes ne sont pas embarques.
Identifiant `ballombert.beadark` et moteur VS Code existants conserves.
La verification detaillee figure dans [validation.md](./validation.md).

## Recherche et limites

Sources : [README, Contrast targets and evidence](../README.md#contrast-targets-and-evidence).
Les seuils WCAG concernent la perception visuelle, pas un effet clinique.
L'etude Kuster ne montre pas de superiorite universelle de Dyslexie.
L'etude Zorzi porte sur des enfants lisant du texte, pas sur des adultes lisant
du code. Les descriptions Atkinson/OpenDyslexic sont celles de leurs concepteurs.
Comparer personnellement confort et erreurs ; ne pas promettre que Neon ou une
police particuliere ameliorent l'attention de tous les utilisateurs.
