# Realistic card art folder

Put realistic JPG/PNG full-card images here using these filenames:

- fb_qb_ross.jpg
- fb_rb_knox.jpg
- fb_wr_blaze.jpg
- etc.

The game first tries `assets/realistic/<card_id>.jpg`.
If that file is missing, it falls back to the generated SVG in `assets/cards/`.

Use `PROMPTS.json` for suggested prompts to generate fictional realistic athlete cards.

## Required image size

Use a portrait trading-card aspect ratio:

```text
900 × 1260 px
```

or any clean 5:7 ratio, such as:

```text
750 × 1050
1000 × 1400
1500 × 2100
```

Avoid landscape card sheets for in-game assets. Each file should be one full card, not a 2x2 layout.
