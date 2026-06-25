/*
Example integration adapter

Use this file as a guide if your game already has card data objects.

Expected card data shape:

{
  name: "Asher Reed",
  team: "Detroit Motors",
  position: "C",
  overall: 85,
  rarity: "rare",
  foil: "gold",
  artUrl: "/cards/asher-reed.png"
}
*/

function createMSCCard(card) {
  const root = document.createElement("div");
  root.className = "msc-card";
  root.dataset.rarity = card.rarity || "common";
  root.dataset.foil = card.foil || "base";

  root.innerHTML = `
    <div class="msc-card__inner">
      <div class="msc-card__art">
        ${card.artUrl ? `<img src="${card.artUrl}" alt="">` : ""}
      </div>
      <div class="msc-card__position">${card.position || ""}</div>
      <div class="msc-card__rating">${card.overall ?? ""}<small>OVR</small></div>
      <div class="msc-card__name">${card.name || "Player Name"}</div>
      <div class="msc-card__team">${card.team || ""}</div>
      <div class="msc-card__badge">MSC</div>
    </div>
  `;

  return root;
}

async function openPack(packCards, container) {
  container.innerHTML = "";

  const cardEls = packCards.map(cardData => {
    const el = createMSCCard(cardData);
    el.classList.add("is-face-down");
    container.appendChild(el);
    return el;
  });

  await MSCVisualFX.revealPack(cardEls);
}
