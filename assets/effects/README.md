# Major Sports Card Collector — Foil / Glow / Reveal System

This package contains a practical Tier 1 visual effects implementation for the browser version of **Major Sports Card Collector**.

## Files

- `msc-card-effects.css`  
  Rarity glow, foil overlays, shimmer, hover/select states, reveal classes, mobile fallbacks, reduced-motion support.

- `msc-card-effects.js`  
  Framework-agnostic reveal helpers for card flip, pack reveal, big pull, jackpot, and lightweight particles.

- `demo.html`  
  Standalone demo showing the system in action.

## Basic integration

Add the CSS:

```html
<link rel="stylesheet" href="/path/to/msc-card-effects.css">
```

Add the JS:

```html
<script src="/path/to/msc-card-effects.js"></script>
```

Use this markup pattern:

```html
<div class="msc-card" data-rarity="rare" data-foil="gold">
  <div class="msc-card__inner">
    <div class="msc-card__art">
      <img src="/card-art/example.png" alt="">
    </div>
    <div class="msc-card__position">WR</div>
    <div class="msc-card__rating">85<small>OVR</small></div>
    <div class="msc-card__name">Player Name</div>
    <div class="msc-card__team">Team Name</div>
    <div class="msc-card__badge">MSC</div>
  </div>
</div>
```

## Supported rarities

```txt
common
uncommon
rare
epic
legendary
```

## Supported foil variants

```txt
base
bronze
silver
gold
holo
rainbow
```

`holo` and `rainbow` are included as future-ready options but should be used sparingly.

## Reveal helpers

Reveal one card:

```js
const card = document.querySelector(".msc-card");
MSCVisualFX.revealCard(card);
```

Reveal a pack:

```js
const cards = document.querySelectorAll(".pack-result .msc-card");
MSCVisualFX.revealPack(cards);
```

Big pull:

```js
MSCVisualFX.bigPull(card);
```

Jackpot:

```js
MSCVisualFX.jackpot(card, {
  title: "Jackpot Pull",
  subtitle: "Special reward"
});
```

## Face-down cards

Add this class before reveal:

```html
<div class="msc-card is-face-down" data-rarity="rare" data-foil="gold">
```

The JS will remove `is-face-down` during reveal.

## Recommended implementation order

1. Add `data-rarity` and `data-foil` to existing card components.
2. Add `msc-card-effects.css`.
3. Map your existing card markup to the suggested class names.
4. Add `msc-card-effects.js`.
5. Use `MSCVisualFX.revealPack()` on pack opening.
6. Use `MSCVisualFX.bigPull()` for Epic, Legendary, and premium foil hits.
7. Use `MSCVisualFX.jackpot()` only for special rewards or top chase cards.

## Rarity vs foil rule

Rarity controls:

```txt
outer border
outer glow
reveal importance
```

Foil controls:

```txt
surface finish
shimmer sweep
metallic trim
```

This prevents a Rare Gold Foil from looking identical to a Legendary.

## Mobile / performance notes

The system avoids heavy WebGL and persistent particle systems.

Built-in safeguards:

- Uses `transform` and `opacity` for most motion.
- Limits particles.
- Reduces blur on mobile.
- Honors `prefers-reduced-motion`.
- Disables Epic/Legendary idle animation inside `.msc-card-grid`.

Use `.msc-card-grid` on large collection screens:

```html
<div class="msc-card-grid">
  ...
</div>
```

This keeps large card grids from running too many idle animations.
