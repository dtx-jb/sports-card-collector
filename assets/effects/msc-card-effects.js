/*
Major Sports Card Collector
Foil / Glow / Reveal Visual System JS

This file is intentionally framework-agnostic.
It works with plain HTML, React-rendered DOM, Vue, Svelte, etc.

Main helpers:
MSCVisualFX.revealCard(cardEl)
MSCVisualFX.revealPack(cardEls)
MSCVisualFX.bigPull(cardEl)
MSCVisualFX.jackpot(cardEl, options)
MSCVisualFX.spawnParticles(options)
*/

(function attachMSCVisualFX(global) {
  "use strict";

  const RARITY_ORDER = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  };

  const RARITY_COLOR = {
    common: "#8b949e",
    uncommon: "#35d16f",
    rare: "#2f8cff",
    epic: "#b04cff",
    legendary: "#f4c84a",
    jackpot: "#f4c84a"
  };

  const REVEAL_TIMING = {
    normalFlip: 620,
    normalReveal: 760,
    bigPull: 1450,
    jackpot: 1900
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function prefersReducedMotion() {
    return global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobileViewport() {
    return global.matchMedia &&
      global.matchMedia("(max-width: 680px)").matches;
  }

  function getRarity(cardEl) {
    return (cardEl?.dataset?.rarity || "common").toLowerCase();
  }

  function getFoil(cardEl) {
    return (cardEl?.dataset?.foil || "base").toLowerCase();
  }

  function rarityScore(cardEl) {
    return RARITY_ORDER[getRarity(cardEl)] || 1;
  }

  function isHighValue(cardEl) {
    const rarity = getRarity(cardEl);
    const foil = getFoil(cardEl);
    return rarity === "epic" ||
      rarity === "legendary" ||
      foil === "gold" ||
      foil === "holo" ||
      foil === "rainbow";
  }

  function forceRestartAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    // Force style flush.
    void el.offsetWidth;
    el.classList.add(className);
  }

  async function revealCard(cardEl, options = {}) {
    if (!cardEl) return;

    const {
      faceDownClass = "is-face-down",
      revealClass = "is-flipping",
      holdMs = 0
    } = options;

    if (holdMs > 0) await sleep(holdMs);

    cardEl.classList.add("is-revealing");
    forceRestartAnimation(cardEl, revealClass);

    const flipTime = prefersReducedMotion() ? 0 : REVEAL_TIMING.normalFlip;
    const midpoint = Math.round(flipTime * 0.45);

    await sleep(midpoint);
    cardEl.classList.remove(faceDownClass);

    await sleep(Math.max(0, flipTime - midpoint));
    cardEl.classList.remove(revealClass);

    await sleep(120);
    cardEl.classList.remove("is-revealing");
  }

  async function revealPack(cardEls, options = {}) {
    const cards = Array.from(cardEls || []).filter(Boolean);
    const {
      delayBetweenCards = isMobileViewport() ? 90 : 140,
      highValuePause = 280,
      revealHighValueAsBigPull = true
    } = options;

    for (const card of cards) {
      const score = rarityScore(card);

      if (score >= 4 && revealHighValueAsBigPull) {
        await bigPull(card, {
          title: getRarity(card).toUpperCase()
        });
      } else {
        const pause = score >= 3 ? highValuePause : 0;
        await revealCard(card, { holdMs: pause });
      }

      await sleep(delayBetweenCards);
    }
  }

  async function bigPull(cardEl, options = {}) {
    if (!cardEl) return;

    const rarity = getRarity(cardEl);
    const title = options.title || (rarity === "legendary" ? "Legendary Pull" : "Big Pull");
    const particleCount = prefersReducedMotion()
      ? 0
      : rarity === "legendary"
        ? (isMobileViewport() ? 14 : 24)
        : (isMobileViewport() ? 8 : 14);

    const layer = createRevealLayer({ title, rarity });
    document.body.appendChild(layer.root);

    await sleep(30);
    layer.root.classList.add("is-active");

    const clone = cardEl.cloneNode(true);
    clone.classList.remove("is-face-down");
    clone.classList.add("is-big-pull");
    layer.stage.appendChild(clone);

    await sleep(620);

    spawnParticles({
      count: particleCount,
      color: RARITY_COLOR[rarity] || RARITY_COLOR.rare,
      originEl: clone
    });

    await sleep(prefersReducedMotion() ? 400 : REVEAL_TIMING.bigPull + 350);

    layer.root.classList.remove("is-active");
    await sleep(190);
    layer.root.remove();

    cardEl.classList.remove("is-face-down");
    cardEl.classList.add("is-revealing");
    setTimeout(() => cardEl.classList.remove("is-revealing"), 750);
  }

  async function jackpot(cardEl, options = {}) {
    if (!cardEl) return;

    const title = options.title || "Jackpot Pull";
    const subtitle = options.subtitle || "";
    const particleCount = prefersReducedMotion()
      ? 0
      : isMobileViewport()
        ? 18
        : 42;

    const layer = createRevealLayer({
      title,
      rarity: "jackpot",
      subtitle
    });

    document.body.appendChild(layer.root);
    await sleep(30);
    layer.root.classList.add("is-active");

    const clone = cardEl.cloneNode(true);
    clone.classList.remove("is-face-down");
    clone.classList.add("is-jackpot");
    layer.stage.appendChild(clone);

    await sleep(850);

    spawnParticles({
      count: particleCount,
      color: RARITY_COLOR.jackpot,
      originEl: clone,
      distance: isMobileViewport() ? 120 : 190
    });

    await sleep(prefersReducedMotion() ? 650 : REVEAL_TIMING.jackpot + 700);

    layer.root.classList.remove("is-active");
    await sleep(190);
    layer.root.remove();

    cardEl.classList.remove("is-face-down");
    cardEl.classList.add("is-revealing");
    setTimeout(() => cardEl.classList.remove("is-revealing"), 850);
  }

  function createRevealLayer({ title, rarity = "rare", subtitle = "" } = {}) {
    const root = document.createElement("div");
    root.className = "msc-reveal-layer";

    const stage = document.createElement("div");
    stage.className = "msc-reveal-stage";

    const heading = document.createElement("h2");
    heading.className = "msc-reveal-title";
    heading.dataset.rarity = rarity;
    heading.textContent = title;

    stage.appendChild(heading);

    if (subtitle) {
      const sub = document.createElement("p");
      sub.style.margin = "0";
      sub.style.color = "rgba(255,255,255,.76)";
      sub.style.font = "700 14px/1.3 system-ui, -apple-system, Segoe UI, sans-serif";
      sub.textContent = subtitle;
      stage.appendChild(sub);
    }

    root.appendChild(stage);
    return { root, stage };
  }

  function spawnParticles(options = {}) {
    if (prefersReducedMotion()) return [];

    const {
      count = 12,
      color = "#ffffff",
      originEl = null,
      x = null,
      y = null,
      distance = 140
    } = options;

    let originX = x;
    let originY = y;

    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }

    if (originX == null) originX = global.innerWidth / 2;
    if (originY == null) originY = global.innerHeight / 2;

    const particles = [];

    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("span");
      p.className = "msc-particle";
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.color = color;

      const angle = (Math.PI * 2 * i) / count;
      const variance = 0.65 + Math.random() * 0.55;
      const dx = Math.cos(angle) * distance * variance;
      const dy = Math.sin(angle) * distance * variance;

      p.style.setProperty("--particle-x", `${dx}px`);
      p.style.setProperty("--particle-y", `${dy}px`);

      document.body.appendChild(p);
      particles.push(p);

      setTimeout(() => p.remove(), 760);
    }

    return particles;
  }

  function wireDemoControls(root = document) {
    root.querySelectorAll("[data-msc-action]").forEach(button => {
      button.addEventListener("click", async () => {
        const action = button.dataset.mscAction;
        const selector = button.dataset.mscTarget || ".msc-card";
        const cards = Array.from(root.querySelectorAll(selector));

        if (action === "reveal-card") {
          await revealCard(cards[0]);
        }

        if (action === "reveal-pack") {
          await revealPack(cards);
        }

        if (action === "big-pull") {
          const target = cards.find(isHighValue) || cards[cards.length - 1];
          await bigPull(target);
        }

        if (action === "jackpot") {
          const target = cards.find(card => getRarity(card) === "legendary") || cards[cards.length - 1];
          await jackpot(target, {
            title: "Jackpot Pull",
            subtitle: "Special reward"
          });
        }

        if (action === "reset") {
          cards.forEach(card => {
            card.classList.add("is-face-down");
            card.classList.remove("is-revealing", "is-selected", "is-flipping", "is-big-pull", "is-jackpot");
          });
        }
      });
    });
  }

  const API = {
    revealCard,
    revealPack,
    bigPull,
    jackpot,
    spawnParticles,
    wireDemoControls,
    getRarity,
    getFoil,
    rarityScore,
    isHighValue
  };

  global.MSCVisualFX = API;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
})(typeof window !== "undefined" ? window : globalThis);
