# Brand fonts

The 2026 Cardano brand uses two typefaces, both from the Chivo project by
Omnibus-Type and downloaded from Google Fonts:

| File | Family | Used for |
| ---- | ------ | -------- |
| `Chivo-VariableFont_wght.woff2` | Chivo | All site text (`--ifm-font-family-base`) |
| `Chivo-Italic-VariableFont_wght.woff2` | Chivo (italic) | Italic text |
| `ChivoMono-VariableFont_wght.woff2` | Chivo Mono | Chip buttons, badges, and uppercase labels (`--site-font-family-mono-label`) |

All three are variable fonts covering weights 100–900; the site's weight
scale is defined as tokens in `src/css/custom.css`, which is also where the
`@font-face` declarations live. Files are woff2 because it is roughly half
the size of the raw TTF downloads; convert with
`fonttools ttLib.woff2 compress` if you ever replace them.

`scripts/fonts/` holds separate static Chivo cuts (400/700). They exist
because the OG-card generator's renderer (Satori) cannot parse variable
fonts; do not delete them when touching this directory.

The fonts are licensed under the SIL Open Font License 1.1, see `OFL.txt`.
