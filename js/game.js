// js/game.js

const SAVE_KEY = "majorSportsCardCollector_core_stability_test_v1";

let state = loadGame();
let currentView = "home";
let filterSport = "All";
let filterRarity = "All";
let binderPage = 0;
let lineupSort = "overall";
let lineupSportFilter = "All";
let lineupRarityFilter = "All";
let lineupPositionFilter = "All";
let lineupOwnedView = "All";
let lastPack = [];
let packOpening = null;
let packQueue = [];
let matchState = null;
let inspectingCardId = null;
let inspectFlipped = false;
let statBattleGame = null;
let tradeMarketGame = null;
let blackjackGame = null;

function normalizeState(){
  state.stats = state.stats || {};
  if(typeof state.stats.matchesWon !== "number") state.stats.matchesWon = 0;
  if(typeof state.stats.matchesLost !== "number") state.stats.matchesLost = 0;
  if(typeof state.stats.cupWins !== "number") state.stats.cupWins = 0;
  if(typeof state.stats.cupLosses !== "number") state.stats.cupLosses = 0;
  if(typeof state.stats.packsOpened !== "number") state.stats.packsOpened = 0;
  if(typeof state.stats.totalCards !== "number") state.stats.totalCards = Object.values(state.collection || {}).reduce((a,b) => a + b, 0);
  if(typeof state.stats.dailyClaims !== "number") state.stats.dailyClaims = 0;
  if(typeof state.stats.sponsorClaims !== "number") state.stats.sponsorClaims = 0;
  if(typeof state.stats.doublesSold !== "number") state.stats.doublesSold = 0;
  if(typeof state.stats.upgradesMade !== "number") state.stats.upgradesMade = 0;
  if(typeof state.trainingPoints !== "number") state.trainingPoints = 0;
  if(typeof state.streak !== "number") state.streak = 1;
  state.upgrades = state.upgrades || {};
  state.foil = state.foil || {};
  state.daily = state.daily || {bonus:false,sponsor:false,drill:false,shop:false};

  
  
  if(typeof state.collectorXP !== "number") state.collectorXP = 0;
  if(typeof state.packUnlockOverride !== "boolean") state.packUnlockOverride = false;

  state.packPity = state.packPity || {};
  state.packHistory = state.packHistory || [];
  state.packStats = state.packStats || {};

  Object.keys(PACKS).forEach(key => {
    state.packPity[key] = state.packPity[key] || {rareDry:0, epicDry:0, legendaryDry:0};
    state.packStats[key] = state.packStats[key] || {opened:0, rarePlus:0, epicPlus:0, legendary:0};
  });

  
  if(typeof state.stats.cupTournaments !== "number") state.stats.cupTournaments = 0;
  if(typeof state.stats.cupChampionships !== "number") state.stats.cupChampionships = 0;
  if(typeof state.stats.cupRunnerUps !== "number") state.stats.cupRunnerUps = 0;
  if(typeof state.stats.cupPrizeCards !== "number") state.stats.cupPrizeCards = 0;
  state.cupSeason = state.cupSeason || null;
  state.cupHistory = state.cupHistory || [];
  state.cupTierTitles = state.cupTierTitles || {};

  state.stats.blackjack = state.stats.blackjack || {
    hands:0,
    wins:0,
    losses:0,
    pushes:0,
    blackjacks:0,
    busts:0,
    doubled:0,
    coinsWagered:0,
    coinsReturned:0,
    tpWon:0
  };

  state.draft = state.draft || {clears:0, board:null, history:[]};
  if(typeof state.draft.clears !== "number") state.draft.clears = 0;
  state.draft.history = state.draft.history || [];
  state.draft.pendingPacks = state.draft.pendingPacks || [];
  repairDraftBoardState();
}

normalizeState();
restorePackRuntimeFromState();
hydratePackRuntimeFromStateQueue();

function freshState(){
  return {
    coins:135,
    trainingPoints:0,
    streak:1,
    collectorXP:0,
    packUnlockOverride:false,
    daily:{bonus:false,sponsor:false,drill:false,shop:false},
    stamina:100,
    maxStamina:100,
    day:1,
    collection:{
      fb_qb_ross:1,
      bb_pg_carter:1,
      sc_st_holt:1,
      bs_2b_wells:1
    },
    lineup:["fb_qb_ross","bb_pg_carter","sc_st_holt","bs_2b_wells"],
    quests:{},
    cupSeason:null,
    cupHistory:[],
    cupTierTitles:{},
    upgrades:{},
    foil:{},
    stats:{packsOpened:0,matchesWon:0,matchesLost:0,cupGames:0,cupWins:0,cupLosses:0,cupTournaments:0,cupChampionships:0,cupRunnerUps:0,cupPrizeCards:0,totalCards:4,dailyClaims:0,sponsorClaims:0,doublesSold:0,upgradesMade:0},
    draft:{clears:0,board:null,history:[],pendingPacks:[]},
    log:["You opened a fresh binder and started with one card from each major sport."]
  };
}

function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return freshState();
    return Object.assign(freshState(), JSON.parse(raw));
  }catch(e){
    return freshState();
  }
}




















function ownedCardIds(){
  return Object.keys(state.collection || {}).filter(id => (state.collection[id] || 0) > 0 && card(id));
}

function uniqueOwnedCount(){
  return ownedCardIds().length;
}

function totalCardCount(){
  return CARDS.length;
}

function sportOwnedCount(sport){
  return CARDS.filter(c => c.sport === sport && (state.collection[c.id] || 0) > 0).length;
}

function sportTotalCount(sport){
  return CARDS.filter(c => c.sport === sport).length;
}

function rarityOrBetterOwned(rarities){
  return CARDS.some(c => rarities.includes(c.rarity) && (state.collection[c.id] || 0) > 0);
}



function syncPackRuntimeToState(){
  state.runtimePackOpening = packOpening || null;
  state.runtimePackQueue = Array.isArray(packQueue) ? packQueue : [];
  state.runtimeLastPackIds = Array.isArray(lastPack) ? lastPack.map(c => typeof c === "string" ? c : c.id).filter(Boolean) : [];
  state.runtimeCurrentView = currentView;
}

function restorePackRuntimeFromState(){
  if(state.runtimePackOpening){
    packOpening = state.runtimePackOpening;
    packQueue = Array.isArray(state.runtimePackQueue) ? state.runtimePackQueue : [];
    lastPack = (state.runtimeLastPackIds && state.runtimeLastPackIds.length ? state.runtimeLastPackIds : (packOpening.cards || []))
      .map(id => card(id))
      .filter(Boolean);
    currentView = "packs";
    return;
  }

  if(state.runtimeCurrentView && ["home","collection","packs","lineup","match","draft","earn","admin","season","quests","settings"].includes(state.runtimeCurrentView)){
    currentView = state.runtimeCurrentView;
  }
}

function clearPackRuntimeState(){
  state.runtimePackOpening = null;
  state.runtimePackQueue = [];
  state.runtimeLastPackIds = [];
}

function ensurePackRevealVisible(){
  setTimeout(() => {
    if(currentView !== "packs" || !packOpening) return;
    const app = document.getElementById("app");
    const hasPackStage = !!document.querySelector(".pack-stage");
    if(app && !hasPackStage){
      syncPackRuntimeToState();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      window.location.reload();
    }
  }, 250);
}

function handlePackBuy(event, key, quantity = 1){
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  openPack(key, quantity);
}



function hydratePackRuntimeFromStateQueue(){
  state.activePackQueue = state.activePackQueue || [];
  state.activePackOpening = state.activePackOpening || null;

  if(state.activePackOpening){
    packOpening = state.activePackOpening;
    packQueue = state.activePackQueue || [];
    lastPack = (packOpening.cards || []).map(id => card(id)).filter(Boolean);
    currentView = "packs";
    return true;
  }

  if(!packOpening && (state.activePackQueue || []).length){
    startNextPackFromStateQueue();
    currentView = "packs";
    return true;
  }

  return false;
}

function persistPackRuntime(){
  state.activePackOpening = packOpening || null;
  state.activePackQueue = Array.isArray(packQueue) ? packQueue : [];
}

function clearActivePackState(){
  state.activePackOpening = null;
  state.activePackQueue = [];
  state.runtimePackOpening = null;
  state.runtimePackQueue = [];
  state.runtimeLastPackIds = [];
}

function startNextPackFromStateQueue(){
  state.activePackQueue = state.activePackQueue || [];
  packQueue = state.activePackQueue;

  const next = packQueue.shift();
  if(!next){
    packOpening = null;
    state.activePackOpening = null;
    state.activePackQueue = [];
    return false;
  }

  lastPack = next.cards.map(id => card(id)).filter(Boolean);

  const heatIndexes = heatCardIndexesInPack(next.cards);
  const heatIndex = heatIndexes.length ? heatIndexes[0] : bestCardIndexInPack(next.cards);

  packOpening = {
    key:next.key,
    cards:next.cards,
    newFlags:next.newFlags || [],
    ripped:false,
    flipped:[],
    heatIndex,
    heatIndexes,
    bigPullReady:false,
    guaranteeApplied:next.guaranteeApplied || null
  };

  state.activePackOpening = packOpening;
  state.activePackQueue = packQueue;
  return true;
}

function saveAndRenderPackReveal(){
  persistPackRuntime();
  state.runtimeCurrentView = "packs";
  currentView = "packs";
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  render();

  setTimeout(() => {
    const hasStage = !!document.querySelector(".pack-stage");
    if(currentView === "packs" && packOpening && !hasStage){
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      window.location.reload();
    }
  }, 100);
}


function saveGame(){
  persistPackRuntime();
  if(typeof syncPackRuntimeToState === "function") syncPackRuntimeToState();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function resetGame(){
  if(confirm("Reset your sports card collection and start over?")){
    localStorage.removeItem(SAVE_KEY);
    state = freshState();
    currentView = "home";
    lastPack = [];
    packOpening = null;
    packQueue = [];
    clearPackRuntimeState();
    clearActivePackState();
    matchState = null;
    render();
    toast("Collection reset.");
  }
}

function card(id){ return CARDS.find(c => c.id === id); }
function ownedCards(){ return CARDS.filter(c => (state.collection[c.id] || 0) > 0); }
function rarityRank(r){ return {Common:1,Uncommon:2,Rare:3,Epic:4,Legendary:5}[r] || 0; }
function overall(c){ return Math.round((c.off + c.def + c.ath + c.iq) / 4); }
function sportStyle(c){ return `--sport:${SPORTS[c.sport].color}`; }


function imageFallback(img, fallback){
  if(img.dataset.fellback === "true") return;
  img.dataset.fellback = "true";
  img.src = fallback;
}

function openInspect(id){
  inspectingCardId = id;
  inspectFlipped = false;
  renderInspect();
}

function closeInspect(){
  inspectingCardId = null;
  inspectFlipped = false;
  renderInspect();
}

function flipInspect(){
  inspectFlipped = !inspectFlipped;
  renderInspect();
}

function tiltInspect(event){
  const shell = event.currentTarget;
  const rect = shell.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const rx = (0.5 - y) * 18;
  const ry = (x - 0.5) * 22;

  shell.style.setProperty("--rx", `${rx}deg`);
  shell.style.setProperty("--ry", `${ry}deg`);
  shell.style.setProperty("--mx", `${x * 100}%`);
  shell.style.setProperty("--my", `${y * 100}%`);
}

function resetInspectTilt(event){
  const shell = event.currentTarget;
  shell.style.setProperty("--rx", "0deg");
  shell.style.setProperty("--ry", "0deg");
  shell.style.setProperty("--mx", "50%");
  shell.style.setProperty("--my", "50%");
}


function cardVariant(c){
  const tier = foilTier(c.id);
  if(tier && tier !== "Base") return `${tier} Foil`;

  if(c.rarity === "Legendary") return "Legendary Insert";
  if(c.rarity === "Epic") return "Premium Insert";
  if(c.rarity === "Rare") return "Chrome / Rare";
  if(c.rarity === "Uncommon") return "Rookie / Parallel";
  return "Base";
}

function cardSerialText(c){
  const rank = rarityRank(c.rarity);
  const tier = foilTier(c.id);

  if(tier === "Holo") return "Holo /25";
  if(tier === "Gold") return "Gold /50";
  if(tier === "Silver") return "Silver /99";
  if(tier === "Bronze") return "Bronze /199";

  if(rank >= 5) return "Legendary /10";
  if(rank === 4) return "Epic /25";
  if(rank === 3) return "Rare /99";
  if(rank === 2) return "Uncommon /299";
  return "Base Set";
}

function cardUpgradeStatus(c){
  const level = cardLevel(c.id);
  const next = nextFoilTier(c.id);
  const dupes = duplicateCount(c.id);

  if(level >= 10 && !next) return "Maxed";
  if(dupes > 0) return "Duplicate ready";
  return "Needs duplicates";
}

function renderInspect(){
  const root = document.getElementById("inspect-root");
  if(!root) return;

  if(!inspectingCardId){
    root.innerHTML = "";
    return;
  }

  const c = card(inspectingCardId);
  const owned = state.collection[c.id] || 0;
  const isStatsView = inspectFlipped;

  root.innerHTML = `
    <div class="inspect-overlay" onclick="closeInspect()">
      <div class="inspect-panel" onclick="event.stopPropagation()">
        <div class="inspect-header">
          <div>
            <h2>${c.name}</h2>
            <p>${c.rarity} · ${c.sport} · ${c.team} · ${c.pos}</p>
          </div>
          <button onclick="closeInspect()" class="inspect-close">Close</button>
        </div>

        <div class="inspect-stage">
          <div class="inspect-card-shell ${isStatsView ? "stats-mode" : ""}"
               onpointermove="${isStatsView ? "" : "tiltInspect(event)"}"
               onpointerleave="${isStatsView ? "" : "resetInspectTilt(event)"}">

            ${!isStatsView ? `
              <div class="inspect-single-card inspect-front ${c.rarity}">
                <img src="${c.realisticArt}"
                     alt="${c.name} realistic card art slot"
                     onerror="imageFallback(this, '${c.cardArt}')"/>
                <div class="inspect-holo ${c.rarity}"></div>
              </div>
            ` : `
              <div class="inspect-stat-card ${c.rarity}" style="${sportStyle(c)}">
                <div class="stat-card-top">
                  <div>
                    <span class="stat-sport">${SPORTS[c.sport].emoji} ${c.sport}</span>
                    <h3>${c.name}</h3>
                    <p>${c.team} · ${c.pos} · ${c.archetype || "Balanced"} · Owned ×${owned}</p>
                  </div>
                  <div class="stat-rarity">${c.rarity}</div>
                </div>

                <div class="stat-ovr-block">
                  <span>OVR</span>
                  <strong>${overall(c)}</strong>
                </div>

                <div class="stat-grid-big">
                  <div>
                    <strong>${c.off}</strong>
                    <span>Offense</span>
                  </div>
                  <div>
                    <strong>${c.def}</strong>
                    <span>Defense</span>
                  </div>
                  <div>
                    <strong>${c.ath}</strong>
                    <span>Athleticism</span>
                  </div>
                  <div>
                    <strong>${c.iq}</strong>
                    <span>Game IQ</span>
                  </div>
                </div>

                <div class="cardback-identity">
                  <div>
                    <span>Archetype</span>
                    <strong>${c.archetype || "Balanced"}</strong>
                  </div>
                  <div>
                    <span>Variant</span>
                    <strong>${cardVariant(c)}</strong>
                  </div>
                  <div>
                    <span>Foil Tier</span>
                    <strong>${foilTier(c.id)}</strong>
                  </div>
                  <div>
                    <span>Card Level</span>
                    <strong>Lv ${cardLevel(c.id)}</strong>
                  </div>
                  <div>
                    <span>Duplicates</span>
                    <strong>${duplicateCount(c.id)}</strong>
                  </div>
                  <div>
                    <span>Serial</span>
                    <strong>${cardSerialText(c)}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>${cardUpgradeStatus(c)}</strong>
                  </div>
                </div>

                <div class="cardback-note">
                  <strong>Collector note</strong>
                  <p>${c.desc}</p>
                </div>
              </div>
            `}
          </div>
        </div>

        <div class="inspect-actions">
          <button onclick="flipInspect()" class="gold">${isStatsView ? "Back to card front" : "Flip to stats"}</button>
          ${!isStatsView ? `<button onclick="resetInspectTilt({currentTarget: document.querySelector('.inspect-card-shell')})">Reset angle</button>` : ""}
        </div>

        <div class="inspect-help">
          ${isStatsView
            ? "This is the card stat back: Offense, Defense, Athleticism, and Game IQ."
            : "Move your pointer over the card to tilt it and shift the holographic shine. Use “Flip to stats” to view the stat back."}
        </div>
      </div>
    </div>
  `;
}

function addLog(text){
  state.log.push(text);
  if(state.log.length > 50) state.log = state.log.slice(-50);
}

function toast(text){
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1700);
}



function collectorLevelThresholds(){
  return [0,75,180,330,525,775,1100,1500,1950,2450,3000,3650,4400,5250,6200,7300,8500,9900,11500,13300,15300];
}

function collectorLevel(){
  const thresholds = collectorLevelThresholds();
  let level = 1;
  for(let i = 0; i < thresholds.length; i++){
    if(state.collectorXP >= thresholds[i]) level = i + 1;
  }
  return level;
}

function collectorLevelInfo(){
  const thresholds = collectorLevelThresholds();
  const level = collectorLevel();
  const current = thresholds[level - 1] || 0;
  const next = thresholds[level] || (current + 2500);
  const into = Math.max(0, state.collectorXP - current);
  const needed = Math.max(1, next - current);
  return {level,current,next,into,needed,progress:Math.min(100, Math.round((into / needed) * 100))};
}

function addCollectorXP(amount, reason = ""){
  amount = Math.max(0, Math.round(amount || 0));
  if(!amount) return;
  const before = collectorLevel();
  state.collectorXP += amount;
  const after = collectorLevel();
  if(after > before){
    addLog(`Collector Level Up: Level ${after}${reason ? " from " + reason : ""}.`);
    toast(`Collector Level ${after}!`);
  }
}

function totalRarePlusOwned(){return ownedCards().filter(c => rarityRank(c.rarity) >= 3).length;}
function totalEpicPlusOwned(){return ownedCards().filter(c => rarityRank(c.rarity) >= 4).length;}
function totalPacksOpened(){return state.stats.packsOpened || 0;}


function upgradedCardsAtLevel(minLevel = 2){
  return ownedCards().filter(c => cardLevel(c.id) >= minLevel).length;
}

function foilCardsAtRank(minRank = 1){
  return ownedCards().filter(c => foilRank(foilTier(c.id)) >= minRank).length;
}

function packLadderName(packKey){
  if(packKey === "rookie") return "Rookie";
  if(packKey === "pro") return "Pro";
  if(packKey === "star") return "All-Star";
  if(packKey === "hof") return "Hall of Fame";
  return "Pack";
}

function packUnlockRequirements(packKey){
  if(packKey === "rookie"){
    return {title:"Unlocked", requirements:[{label:"Starter pack", met:true}]};
  }

  if(packKey === "pro"){
    return {title:"Pro Pack", requirements:[
      {label:"85 total packs opened", met:totalPacksOpened() >= 85},
      {label:"Collector Level 7", met:collectorLevel() >= 7},
      {label:"35 unique cards owned", met:ownedCards().length >= 35},
      {label:"10 Quick Match wins", met:(state.stats.matchesWon || 0) >= 10}
    ]};
  }

  if(packKey === "star"){
    return {title:"All-Star Pack", requirements:[
      {label:"175 total packs opened", met:totalPacksOpened() >= 175},
      {label:"Collector Level 12", met:collectorLevel() >= 12},
      {label:"55 unique cards owned", met:ownedCards().length >= 55},
      {label:"8 Rare+ cards owned", met:totalRarePlusOwned() >= 8},
      {label:"25 Quick Match wins", met:(state.stats.matchesWon || 0) >= 25},
      {label:"3 upgraded cards", met:upgradedCardsAtLevel(2) >= 3},
      {label:"1 card at Level 3+", met:upgradedCardsAtLevel(3) >= 1}
    ]};
  }

  if(packKey === "hof"){
    return {title:"Hall of Fame Pack", requirements:[
      {label:"350 total packs opened", met:totalPacksOpened() >= 350},
      {label:"Collector Level 18", met:collectorLevel() >= 18},
      {label:"75 unique cards owned", met:ownedCards().length >= 75},
      {label:"15 Rare+ cards owned", met:totalRarePlusOwned() >= 15},
      {label:"5 Epic+ cards owned", met:totalEpicPlusOwned() >= 5},
      {label:"60 Quick Match wins", met:(state.stats.matchesWon || 0) >= 60},
      {label:"5 cards at Level 3+", met:upgradedCardsAtLevel(3) >= 5},
      {label:"2 Bronze+ foil cards", met:foilCardsAtRank(1) >= 2},
      {label:"Lineup score 430+", met:lineupScore() >= 430}
    ]};
  }

  return {title:"Locked", requirements:[]};
}


function isPackUnlocked(packKey){
  if(state.packUnlockOverride) return true;
  return packUnlockRequirements(packKey).requirements.every(r => r.met);
}

function packUnlockHtml(packKey){
  if(isPackUnlocked(packKey)) return `<div class="pack-unlocked-note">Unlocked${state.packUnlockOverride ? " by Admin override" : ""}</div>`;
  const req = packUnlockRequirements(packKey);
  return `<div class="pack-lock-panel"><div class="pack-lock-title">🔒 ${req.title} locked</div>${req.requirements.map(r => `<div class="pack-lock-req ${r.met ? "met" : "missing"}"><span>${r.met ? "✓" : "•"}</span><strong>${r.label}</strong></div>`).join("")}</div>`;
}

function packXPReward(packKey, pulledIds){
  const bestRank = Math.max(...pulledIds.map(id => rarityRank(card(id).rarity)));
  const rarityBonus = {1:0,2:4,3:14,4:35,5:90}[bestRank] || 0;
  const pack = PACKS[packKey];
  const tierBonus = {rookie:0,pro:5,star:12,hof:25}[packKey] || 0;

  return 10 + pack.count + tierBonus + rarityBonus;
}

function packTPReward(packKey, pulledIds){
  const bestRank = Math.max(...pulledIds.map(id => rarityRank(card(id).rarity)));
  const base = {rookie:8,pro:14,star:22,hof:35}[packKey] || 8;
  const rarityBonus = {1:0,2:2,3:8,4:20,5:50}[bestRank] || 0;

  return base + rarityBonus;
}


function collectorProgressHtml(){
  const info = collectorLevelInfo();

  return `
    <div class="collector-progress-panel">
      <div class="collector-progress-top">
        <div>
          <h3>Collector Level ${info.level}</h3>
          <p>${state.collectorXP} total XP · ${info.into}/${info.needed} XP to next level</p>
        </div>
        <span>${Math.round(info.progress)}%</span>
      </div>
      <div class="collector-xp-bar"><b style="width:${info.progress}%"></b></div>
      <div class="collector-unlock-summary">
        <span>${isPackUnlocked("rookie") ? "✓" : "🔒"} Rookie</span>
        <span>${isPackUnlocked("pro") ? "✓" : "🔒"} Pro</span>
        <span>${isPackUnlocked("star") ? "✓" : "🔒"} All-Star</span>
        <span>${isPackUnlocked("hof") ? "✓" : "🔒"} Hall of Fame</span>
      </div>
    </div>
  `;
}


function packPityConfig(packKey){
  // Pity is based on DRY STREAKS, not lifetime packs opened.
  if(packKey === "rookie") return {rare:30, epic:250, legendary:null};
  if(packKey === "pro") return {rare:25, epic:100, legendary:null};
  if(packKey === "star") return {rare:15, epic:70, legendary:500};
  if(packKey === "hof") return {rare:8, epic:35, legendary:120};
  return {rare:null, epic:null, legendary:null};
}


function rarityLabelByRank(rank){
  if(rank >= 5) return "Legendary";
  if(rank === 4) return "Epic+";
  if(rank === 3) return "Rare+";
  if(rank === 2) return "Uncommon+";
  return "Common";
}

function packOdds(packKey){
  const pack = PACKS[packKey];
  const weights = RARITY_WEIGHTS[pack.weights];
  const total = Object.values(weights).reduce((a,b) => a + b, 0);
  return Object.entries(weights).map(([rarity, weight]) => {
    const raw = total ? (weight / total) * 100 : 0;
    let label = "0";
    if(raw > 0 && raw < 0.1) label = "<0.1";
    else if(raw > 0 && raw < 10) label = raw.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
    else label = Math.round(raw).toString();
    return {rarity, percent:raw, percentLabel:label, weight};
  });
}

function nextPityText(packKey, type){
  const pity = state.packPity?.[packKey] || {rareDry:0, epicDry:0, legendaryDry:0};
  const cfg = packPityConfig(packKey);

  if(!cfg[type]) return null;

  const dryKey = type === "rare" ? "rareDry" : type === "epic" ? "epicDry" : "legendaryDry";
  const label = type === "rare" ? "Rare+" : type === "epic" ? "Epic+" : "Legendary";
  const dry = pity[dryKey] || 0;
  const threshold = cfg[type];
  const remaining = Math.max(1, threshold - dry);

  return {
    label,
    dry,
    remaining,
    threshold,
    progress:Math.min(100, Math.round((dry / threshold) * 100)),
    due:dry + 1 >= threshold
  };
}

function pityGuaranteesForPack(packKey){
  const pity = state.packPity?.[packKey] || {rareDry:0, epicDry:0, legendaryDry:0};
  const cfg = packPityConfig(packKey);
  const due = [];

  if(cfg.rare && pity.rareDry + 1 >= cfg.rare) due.push({type:"rare", minRank:3, label:"Rare+"});
  if(cfg.epic && pity.epicDry + 1 >= cfg.epic) due.push({type:"epic", minRank:4, label:"Epic+"});
  if(cfg.legendary && pity.legendaryDry + 1 >= cfg.legendary) due.push({type:"legendary", minRank:5, label:"Legendary"});

  return due;
}

function randomCardByMinRank(packKey, minRank){
  const pack = PACKS[packKey];

  let pool = CARDS.filter(c => rarityRank(c.rarity) >= minRank);

  if(pack.sport){
    pool = pool.filter(c => c.sport === pack.sport);
  }

  if(!pool.length){
    pool = CARDS.filter(c => pack.sport ? c.sport === pack.sport : true);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function applyPackGuarantee(packKey, pulledIds, guarantees){
  if(!guarantees.length) return {cards:pulledIds, applied:null};

  const required = guarantees.reduce((best,g) => g.minRank > best.minRank ? g : best, guarantees[0]);
  const bestRank = Math.max(...pulledIds.map(id => rarityRank(card(id).rarity)));

  if(bestRank >= required.minRank){
    return {cards:pulledIds, applied:null};
  }

  const guaranteedCard = randomCardByMinRank(packKey, required.minRank);
  const replaceIndex = pulledIds
    .map((id,i) => ({id,i,rank:rarityRank(card(id).rarity)}))
    .sort((a,b) => a.rank - b.rank)[0].i;

  pulledIds[replaceIndex] = guaranteedCard.id;

  return {
    cards:pulledIds,
    applied:required.label
  };
}

function updatePackPityAfterOpen(packKey, pulledIds){
  const pity = state.packPity[packKey] || {rareDry:0, epicDry:0, legendaryDry:0};
  const stats = state.packStats[packKey] || {opened:0, rarePlus:0, epicPlus:0, legendary:0};
  const bestRank = Math.max(...pulledIds.map(id => rarityRank(card(id).rarity)));

  stats.opened++;
  if(bestRank >= 3) stats.rarePlus++;
  if(bestRank >= 4) stats.epicPlus++;
  if(bestRank >= 5) stats.legendary++;

  pity.rareDry = bestRank >= 3 ? 0 : pity.rareDry + 1;
  pity.epicDry = bestRank >= 4 ? 0 : pity.epicDry + 1;
  pity.legendaryDry = bestRank >= 5 ? 0 : pity.legendaryDry + 1;

  state.packPity[packKey] = pity;
  state.packStats[packKey] = stats;
}

function recordPackHistory(packKey, pulledIds, guaranteeApplied){
  const best = pulledIds
    .map(id => card(id))
    .sort((a,b) => rarityRank(b.rarity) - rarityRank(a.rarity) || overall(b) - overall(a))[0];

  state.packHistory = state.packHistory || [];
  state.packHistory.unshift({
    packKey,
    packName:PACKS[packKey].name,
    bestId:best.id,
    bestName:best.name,
    bestRarity:best.rarity,
    day:state.day,
    guaranteeApplied:guaranteeApplied || null
  });

  state.packHistory = state.packHistory.slice(0, 12);
}

function packOddsHtml(packKey){
  const odds = packOdds(packKey);
  return `<div class="pack-odds">${odds.map(o => {const width = o.percent > 0 ? Math.max(o.percent, 1.5) : 0; return `<div class="pack-odd-row ${o.rarity.toLowerCase()}"><span>${o.rarity}</span><div><b style="width:${width}%"></b></div><strong>${o.percentLabel}%</strong></div>`;}).join("")}</div>`;
}

function packPityHtml(packKey){
  const rare = nextPityText(packKey, "rare");
  const epic = nextPityText(packKey, "epic");
  const legendary = nextPityText(packKey, "legendary");
  const items = [rare, epic, legendary].filter(Boolean);

  return `
    <div class="pack-pity">
      ${items.map(item => `
        <div class="pity-meter ${item.due ? "due" : ""}">
          <div class="pity-meter-top">
            <span>${item.label} dry streak</span>
            <strong>${item.dry}/${item.threshold}</strong>
          </div>
          <div class="pity-bar"><b style="width:${item.progress}%"></b></div>
          <div class="pity-help">${item.due ? "Guaranteed next pack" : `Guaranteed after ${item.remaining} more dry pack${item.remaining === 1 ? "" : "s"}`}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function packHistoryHtml(){
  const history = state.packHistory || [];

  if(!history.length){
    return `<div class="message">No pack history yet. Open packs to start tracking your best pulls and pity hits.</div>`;
  }

  return `
    <div class="pack-history">
      ${history.map(h => {
        const c = card(h.bestId);
        return `
          <div class="pack-history-item ${h.bestRarity}">
            <span>${h.packName}</span>
            <strong>${h.bestRarity} ${h.bestName}</strong>
            <small>Day ${h.day}${h.guaranteeApplied ? " · " + h.guaranteeApplied + " pity hit" : ""}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}


function weightedRarity(weightsKey){
  const weights = RARITY_WEIGHTS[weightsKey];
  const total = Object.values(weights).reduce((a,b) => a + b, 0);
  let roll = Math.random() * total;

  for(const [rarity, weight] of Object.entries(weights)){
    roll -= weight;
    if(roll <= 0) return rarity;
  }
  return "Common";
}

function randomCard(packKey){
  const pack = PACKS[packKey];
  const rarity = weightedRarity(pack.weights);
  let pool = CARDS.filter(c => c.rarity === rarity);

  if(pack.sport){
    pool = pool.filter(c => c.sport === pack.sport);
  }

  if(pool.length === 0){
    pool = CARDS.filter(c => pack.sport ? c.sport === pack.sport : true);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}


function buyFivePacks(key){
  openPack(key, 5);
}


function buyThreePacks(key){
  handlePackBuy(null, key, 3);
}

function buyOnePack(key){
  openPack(key, 1);
}


function openPack(key, quantity = 1){
  const pack = PACKS[key];
  if(!pack) return;

  if(!isPackUnlocked(key)){
    toast(`${pack.name} is locked. Check the unlock requirements.`);
    return;
  }

  quantity = Math.max(1, Math.min(10, Number(quantity) || 1));
  const totalCost = pack.cost * quantity;

  if(state.coins < totalCost){
    toast("Not enough coins.");
    return;
  }

  hydratePackRuntimeFromStateQueue();

  if(packOpening && typeof allPackCardsFlipped === "function" && allPackCardsFlipped()){
    finishPackReveal(false);
  }

  if(packOpening || packQueue.length || (state.activePackQueue || []).length || state.activePackOpening){
    toast("Finish the current pack reveal first.");
    saveAndRenderPackReveal();
    return;
  }

  state.coins -= totalCost;

  const newQueue = [];

  for(let q = 0; q < quantity; q++){
    const pulled = [];
    const guarantees = pityGuaranteesForPack(key);

    for(let i = 0; i < pack.count; i++){
      pulled.push(randomCard(key).id);
    }

    const guaranteedResult = applyPackGuarantee(key, pulled, guarantees);
    const finalPulled = guaranteedResult.cards;

    const seenForNewFlags = {...state.collection};
    const newFlags = finalPulled.map(id => {
      const isNew = !seenForNewFlags[id];
      seenForNewFlags[id] = (seenForNewFlags[id] || 0) + 1;
      return isNew;
    });

    finalPulled.forEach(id => {
      state.collection[id] = (state.collection[id] || 0) + 1;
      state.stats.totalCards++;
    });

    updatePackPityAfterOpen(key, finalPulled);
    recordPackHistory(key, finalPulled, guaranteedResult.applied);

    state.trainingPoints += packTPReward(key, finalPulled);
    addCollectorXP(packXPReward(key, finalPulled), `${pack.name} opening`);

    newQueue.push({
      key,
      cards:finalPulled,
      newFlags,
      guaranteeApplied:guaranteedResult.applied
    });

    state.stats.packsOpened++;
  }

  state.activePackQueue = newQueue;
  state.activePackOpening = null;
  packQueue = state.activePackQueue;
  packOpening = null;

  startNextPackFromStateQueue();
  checkQuests();
  saveAndRenderPackReveal();

  toast(quantity > 1 ? `${quantity} ${pack.name}s ready. Rip the first pack.` : `${pack.name} ready. Rip it open.`);
}

function startNextPackFromQueue(){
  return startNextPackFromStateQueue();
}

function allPackCardsFlipped(){
  if(!packOpening) return false;
  const total = (packOpening.cards || []).length;
  const flipped = (packOpening.flipped || []).length;
  return total > 0 && flipped >= total;
}

function finishPackRevealIfComplete(renderAfter = false){
  if(!packOpening || !allPackCardsFlipped()) return false;
  return finishPackReveal(renderAfter);
}


function ripPack(){
  if(!packOpening) return;
  packOpening.ripped = true;
  const heat = packHeatTier(packOpening);
  render();
  toast("Pack ripped.");
}

function flipCard(index){
  if(!packOpening || !packOpening.ripped) return;

  const heatIndexes = packOpening.heatIndexes && packOpening.heatIndexes.length
    ? packOpening.heatIndexes
    : heatCardIndexesInPack(packOpening.cards);

  const hasHeat = heatIndexes.length > 0;
  const isHeatCard = heatIndexes.includes(index);
  const nonHeatIndexes = packOpening.cards.map((_, i) => i).filter(i => !heatIndexes.includes(i));
  const nonHeatAllFlipped = nonHeatIndexes.every(i => packOpening.flipped.includes(i));

  if(hasHeat && isHeatCard && !nonHeatAllFlipped){
    packOpening.flipped = nonHeatIndexes;
    packOpening.bigPullReady = true;
    render();
    toast("Normal cards revealed first.");
    return;
  }

  if(!packOpening.flipped.includes(index)){
    packOpening.flipped.push(index);
    const remainingHeat = heatIndexes.filter(i => !packOpening.flipped.includes(i));
    packOpening.bigPullReady = hasHeat && nonHeatAllFlipped && remainingHeat.length > 0;

    const c = card(packOpening.cards[index]);
    if(rarityRank(c.rarity) >= 3){
      toast(`${c.rarity} pull: ${c.name}`);
    }

    render();
  }
}

function revealAll(){
  if(!packOpening || !packOpening.ripped) return;

  const heatIndexes = packOpening.heatIndexes && packOpening.heatIndexes.length
    ? packOpening.heatIndexes
    : heatCardIndexesInPack(packOpening.cards);

  const hasHeat = heatIndexes.length > 0;
  const hiddenHeatIndexes = heatIndexes.filter(i => !packOpening.flipped.includes(i));
  const nonHeatIndexes = packOpening.cards.map((_, i) => i).filter(i => !heatIndexes.includes(i));
  const nonHeatAllFlipped = nonHeatIndexes.every(i => packOpening.flipped.includes(i));

  if(hasHeat && hiddenHeatIndexes.length && !nonHeatAllFlipped){
    packOpening.flipped = nonHeatIndexes;
    packOpening.bigPullReady = true;
    render();
    toast("Normal cards revealed first.");
    return;
  }

  if(hasHeat && hiddenHeatIndexes.length && nonHeatAllFlipped){
    packOpening.flipped = Array.from(new Set([...packOpening.flipped, ...hiddenHeatIndexes]));
    packOpening.bigPullReady = false;
    render();
    toast(hiddenHeatIndexes.length > 1 ? "Big pulls revealed." : "Big pull revealed.");
    return;
  }

  packOpening.flipped = packOpening.cards.map((_, i) => i);
  packOpening.bigPullReady = false;
  render();
  toast("All cards revealed.");
}

function finishPackReveal(renderAfter = true){
  hydratePackRuntimeFromStateQueue();

  if(!packOpening) return false;

  if(!allPackCardsFlipped()){
    toast("Flip all cards first.");
    if(renderAfter) render();
    return false;
  }

  lastOpenedPackKey = packOpening.key;
  addLog(`Finished revealing ${PACKS[packOpening.key].name}.`);

  if((packQueue || []).length || (state.activePackQueue || []).length){
    state.activePackQueue = packQueue || state.activePackQueue || [];
    startNextPackFromStateQueue();
  }else{
    packOpening = null;
    packQueue = [];
    clearActivePackState();
  }

  saveGame();
  if(renderAfter) render();
  return true;
}

function addToLineup(id){
  if(!state.collection[id]) return;

  if(state.lineup.includes(id)){
    toast("Already in lineup.");
    return;
  }

  if(state.lineup.length >= 5){
    toast("Lineup is full. Remove one card first.");
    return;
  }

  state.lineup.push(id);
  addLog(`${card(id).name} added to your lineup.`);
  checkQuests();
  saveGame();
  render();
}

function removeFromLineup(id){
  state.lineup = state.lineup.filter(x => x !== id);
  addLog(`${card(id).name} removed from your lineup.`);
  saveGame();
  render();
}

function nextDay(){
  state.day++;
  state.stamina = state.maxStamina;
  state.daily = {bonus:false,sponsor:false,drill:false,shop:false};
  state.coins += 30;
  addLog(`Day ${state.day}: Stamina refreshed. Daily shop bonus: +30 coins.`);
  saveGame();
  render();
  toast("New day. +30 coins.");
}

function sortBinder(){
  if(state.stamina < 1){
    toast("Not enough stamina.");
    return;
  }

  state.stamina -= 1;
  const gain = 12 + Math.floor(Math.random() * 18);
  state.coins += gain;
  addLog(`Sorted your binder and found ${gain} loose coins.`);
  saveGame();
  render();
  toast(`+${gain} coins`);
}

function tradeDoubles(){
  if(state.stamina < 2){
    toast("Not enough stamina.");
    return;
  }

  const doubles = Object.entries(state.collection).filter(([id, count]) => count > 1);

  if(doubles.length === 0){
    toast("No duplicate cards to trade yet.");
    return;
  }

  state.stamina -= 2;
  const [id] = doubles[Math.floor(Math.random() * doubles.length)];
  state.collection[id] -= 1;

  const gain = 28 + rarityRank(card(id).rarity) * 15 + Math.floor(Math.random() * 20);
  state.coins += gain;

  addLog(`Traded a duplicate ${card(id).name} for ${gain} coins.`);
  saveGame();
  render();
  toast(`Traded duplicate. +${gain}`);
}

function claimQuest(id){
  const q = QUESTS.find(x => x.id === id);
  if(!q) return;

  if(state.quests[id] === "claimed") return;

  if(!questDone(id)){
    toast("Goal not finished yet.");
    return;
  }

  const tp = q.tp || Math.max(20, Math.round(q.reward * 0.35));

  state.quests[id] = "claimed";
  state.coins += q.reward;
  state.trainingPoints += tp;
  addCollectorXP(40, "goal claimed");

  addLog(`Claimed goal: ${q.title}. +${q.reward} coins, +${tp} TP.`);
  saveGame();
  render();
  toast(`+${q.reward} coins, +${tp} TP`);
}


function questDone(id){
  if(id === "first_pack") return (state.stats?.packsOpened || 0) >= 1;

  if(id === "one_each"){
    return Object.keys(SPORTS).every(s => sportOwnedCount(s) >= 1);
  }

  if(id === "five_lineup") return (state.lineup || []).length >= 5;
  if(id === "first_win") return (state.stats?.matchesWon || 0) >= 1;
  if(id === "rare_pull") return rarityOrBetterOwned(["Rare","Epic","Legendary"]);
  if(id === "ten_unique") return uniqueOwnedCount() >= 10;
  if(id === "cup_game") return (state.stats?.cupGames || 0) >= 1 || (state.stats?.cupTournaments || 0) >= 1 || !!state.cup?.active || (state.cup?.history || []).length > 0;

  // Actual current QUESTS ids from cards.js:
  if(id === "fifty_unique") return uniqueOwnedCount() >= 50;
  if(id === "hundred_unique") return uniqueOwnedCount() >= 100;

  // Backward compatibility with the IDs used in earlier attempted fixes.
  if(id === "unique_50") return uniqueOwnedCount() >= 50;
  if(id === "unique_100") return uniqueOwnedCount() >= 100;

  return false;
}

function checkQuests(){
  QUESTS.forEach(q => {
    if(questDone(q.id) && !state.quests[q.id]){
      state.quests[q.id] = "ready";
      addLog(`Goal ready: ${q.title}.`);
    }
  });
}




function overtimePhase(){
  return {key:"overall", stats:["overall"], label:"Overtime Clutch", short:"OT", icon:"⏱️", type:"clutch"};
}

function enterOvertime(){
  matchState.overtime = true;
  matchState.round = (matchState.phases ? matchState.phases.length : 5) + 1;
  matchState.used = [];
  matchState.phases = [...(matchState.phases || []), overtimePhase()];
  matchState.history.push("Regulation ended tied. Sudden-death overtime begins. All lineup cards refresh.");
}

function addAnotherOvertimePhase(){
  matchState.used = [];
  matchState.phases.push(overtimePhase());
  matchState.round = matchState.phases.length;
  matchState.history.push("Overtime tied. Another sudden-death overtime begins. All lineup cards refresh.");
}

function phasePool(){
  return [
    {key:"off", stats:["off"], label:"Offense", short:"OFF", icon:"🔥", type:"single"},
    {key:"def", stats:["def"], label:"Defense", short:"DEF", icon:"🛡️", type:"single"},
    {key:"ath", stats:["ath"], label:"Athleticism", short:"ATH", icon:"⚡", type:"single"},
    {key:"iq", stats:["iq"], label:"Game IQ", short:"IQ", icon:"🧠", type:"single"},
    {key:"off_iq", stats:["off","iq"], label:"Offense + Game IQ", short:"OFF+IQ", icon:"🔥🧠", type:"combo"},
    {key:"def_ath", stats:["def","ath"], label:"Defense + Athleticism", short:"DEF+ATH", icon:"🛡️⚡", type:"combo"},
    {key:"off_ath", stats:["off","ath"], label:"Offense + Athleticism", short:"OFF+ATH", icon:"🔥⚡", type:"combo"},
    {key:"def_iq", stats:["def","iq"], label:"Defense + Game IQ", short:"DEF+IQ", icon:"🛡️🧠", type:"combo"},
    {key:"overall", stats:["overall"], label:"Overall / Clutch", short:"OVR", icon:"⭐", type:"clutch"}
  ];
}

function generateMatchPhases(){
  const pool = phasePool();
  const singles = pool.filter(p => p.type === "single");
  const combos = pool.filter(p => p.type === "combo");
  const clutch = pool.find(p => p.key === "overall");

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const phases = [];

  // Structure: two single-stat rounds, two combo rounds, one clutch/overall round.
  // This keeps specialists useful while making balanced cards matter.
  while(phases.filter(p => p.type === "single").length < 2){
    const p = pick(singles);
    if(!phases.some(x => x.key === p.key)) phases.push(p);
  }

  while(phases.filter(p => p.type === "combo").length < 2){
    const p = pick(combos);
    if(!phases.some(x => x.key === p.key)) phases.push(p);
  }

  phases.push(clutch);

  for(let i = phases.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [phases[i], phases[j]] = [phases[j], phases[i]];
  }

  return phases;
}

function phaseStatLabel(key){
  return {off:"OFF",def:"DEF",ath:"ATH",iq:"IQ",overall:"OVR"}[key] || key.toUpperCase();
}

function phaseScoreBreakdown(c, phase){
  if(!phase) phase = phasePool()[0];

  if(phase.key === "overall" || (phase.stats || []).includes("overall")){
    return {
      total:effectiveOverall(c),
      parts:[{key:"overall", label:"OVR", value:effectiveOverall(c)}]
    };
  }

  const stats = phase.stats || [phase.key];
  const parts = stats.map(key => ({
    key,
    label:phaseStatLabel(key),
    value:effectiveStat(c, key)
  }));

  return {
    total:parts.reduce((sum, part) => sum + part.value, 0),
    parts
  };
}

function phaseValue(c, phase){
  return phaseScoreBreakdown(c, phase).total;
}

function currentMatchPhase(){
  if(!matchState || !matchState.phases) return phasePool()[0];
  return matchState.phases[Math.max(0, Math.min(matchState.round - 1, matchState.phases.length - 1))];
}

function phaseScheduleHtml(){
  if(!matchState || !matchState.phases) return "";

  return `
    <div class="arena-phase-strip">
      ${matchState.phases.map((phase, index) => {
        const round = index + 1;
        const result = (matchState.roundResults || [])[index] || "";
        const status = round < matchState.round ? "complete" : round === matchState.round && !matchState.finished ? "current" : "upcoming";
        const resultText = result === "win" ? "W" : result === "loss" ? "L" : result === "tie" ? "T" : "";

        return `
          <div class="arena-phase-banner ${status} ${result}">
            <span class="arena-phase-round">R${round}</span>
            <strong>${phase.short}</strong>
            <small>${phase.type === "combo" ? "Combo" : phase.type === "clutch" ? "Clutch" : "Single"}</small>
            ${resultText ? `<em>${resultText}</em>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function phaseHintForCard(c){
  if(!matchState || matchState.finished) return "";
  const phase = currentMatchPhase();
  return phaseValue(c, phase);
}

function phaseBreakdownText(c, phase){
  const detail = phaseScoreBreakdown(c, phase);
  if(detail.parts.length === 1) return `${detail.parts[0].label} ${detail.parts[0].value}`;
  return detail.parts.map(p => `${p.label} ${p.value}`).join(" + ");
}

function bestAvailablePhaseScore(){
  if(!matchState || matchState.finished) return null;
  const phase = currentMatchPhase();
  const available = state.lineup
    .filter(id => !matchState.used.includes(id))
    .map(id => phaseValue(card(id), phase));

  return available.length ? Math.max(...available) : null;
}

function matchDockCardHtml(c){
  const disabled = !matchState || matchState.finished || matchState.used.includes(c.id);
  const phase = matchState && !matchState.finished ? currentMatchPhase() : null;
  const phaseScore = phase ? phaseValue(c, phase) : "—";
  const bestScore = bestAvailablePhaseScore();
  const isBest = !disabled && bestScore !== null && phaseScore === bestScore;
  const wasPlayed = matchState && matchState.lastBattle && matchState.lastBattle.playerCardId === c.id;
  const click = disabled ? "" : `onclick="playRound('${c.id}')"`;
  const owned = state.collection[c.id] || 0;

  return `
    <button class="arena-dock-card ${c.rarity} ${disabled ? "used" : ""} ${isBest ? "best" : ""} ${wasPlayed ? "last-played" : ""}" ${click} ${disabled ? "disabled" : ""} style="${sportStyle(c)}">
      <div class="arena-dock-thumb">
        <img src="${c.realisticArt}"
             alt="${c.name} card"
             onerror="imageFallback(this, '${c.cardArt}')"/>
        <span>Lv ${cardLevel(c.id)}</span>
      </div>
      <div class="arena-dock-name">${c.name}</div>
      <div class="arena-dock-meta">${c.rarity} · ×${owned}</div>
      <div class="arena-dock-stats">
        <div><span>OVR</span><strong>${effectiveOverall(c)}</strong></div>
        <div><span>OFF</span><strong>${displayStatValue(c,"off")}</strong></div>
        <div><span>DEF</span><strong>${displayStatValue(c,"def")}</strong></div>
        <div><span>ATH</span><strong>${displayStatValue(c,"ath")}</strong></div>
        <div><span>IQ</span><strong>${displayStatValue(c,"iq")}</strong></div>
        <div class="phase-total"><span>${phase ? phase.short : "PHASE"}</span><strong>${phaseScore}</strong></div>
      </div>
    </button>
  `;
}

function startNextMatch(cup = false){
  matchState = null;
  startMatch(cup);
}

function battleCardHtml(c, side, score, outcome, category){
  const outcomeClass = outcome === "win" ? "winner" : outcome === "loss" ? "loser" : outcome === "tie" ? "tie" : "neutral";
  const scoreText = typeof score === "number" ? score : "—";

  return `
    <div class="battle-card-display ${side} ${outcomeClass}">
      <div class="battle-side-label">${side === "player" ? "Your card" : "Opponent card"}</div>
      <div class="battle-card-image">
        <img src="${c.realisticArt}"
             alt="${c.name} battle card"
             onerror="imageFallback(this, '${c.cardArt}')"/>
        <div class="battle-card-glow ${rarityClassValue(c.rarity)}"></div>
      </div>
      <div class="battle-card-info">
        <strong>${c.name}</strong>
        <span>${c.sport} · ${c.pos} · ${c.rarity}</span>
      </div>
      <div class="battle-score-box">
        <span>${category || "Score"}</span>
        <strong>${scoreText}</strong>
      </div>
      <div class="battle-mini-stats">
        <span>OVR ${effectiveOverall(c)}</span>
        <span>OFF ${displayStatValue(c,"off")}</span>
        <span>DEF ${displayStatValue(c,"def")}</span>
        <span>ATH ${displayStatValue(c,"ath")}</span>
        <span>IQ ${displayStatValue(c,"iq")}</span>
      </div>
    </div>
  `;
}

function matchRecordText(){
  const wins = state.stats.matchesWon || 0;
  const losses = state.stats.matchesLost || 0;
  const total = wins + losses;
  const pct = total ? Math.round((wins / total) * 100) : 0;
  return `${wins}-${losses}${total ? " · " + pct + "% win rate" : ""}`;
}


function cardLevel(id){
  return state.upgrades[id] || 1;
}

function foilTier(id){
  return state.foil[id] || "Base";
}

function foilRank(tier){
  return {Base:0,Bronze:1,Silver:2,Gold:3,Holo:4}[tier] || 0;
}

function nextFoilTier(id){
  const current = foilTier(id);
  if(current === "Base") return "Bronze";
  if(current === "Bronze") return "Silver";
  if(current === "Silver") return "Gold";
  if(current === "Gold") return "Holo";
  return null;
}

function upgradeCost(c){
  const lvl = cardLevel(c.id);
  const rarity = c.rarity;

  const rarityMult = {
    Common:1,
    Uncommon:1.2,
    Rare:1.55,
    Epic:2.2,
    Legendary:3
  }[rarity] || 1.4;

  const baseTp = [0,70,150,285,480][lvl] || 650;
  const baseDupes = [0,1,2,3,4][lvl] || 5;

  let coins = 0;

  // Common/Rare early levels remain coin-free. Epic+ starts using coins immediately.
  if(rarity === "Epic"){
    coins = [0,80,150,260,430][lvl] || 600;
  }else if(rarity === "Legendary"){
    coins = [0,150,275,475,800][lvl] || 1000;
  }else if(lvl >= 3){
    coins = Math.round(([0,0,0,85,175][lvl] || 250) * rarityMult);
  }

  // Higher rarities cost fewer duplicates because they are harder to pull.
  const dupeDiscount = rarity === "Legendary" ? 2 : rarity === "Epic" ? 1 : 0;
  const dupes = Math.max(1, baseDupes - dupeDiscount);

  return {
    coins,
    tp:Math.round(baseTp * rarityMult),
    dupes,
    copies:dupes
  };
}

function foilCost(c){
  const tier = foilRank(foilTier(c.id));
  const rarity = c.rarity;

  const rarityMult = {
    Common:1,
    Uncommon:1.25,
    Rare:1.6,
    Epic:2.35,
    Legendary:3.25
  }[rarity] || 1.5;

  const base = [
    {coins:0,tp:180,dupes:3},
    {coins:80,tp:350,dupes:5},
    {coins:250,tp:700,dupes:8},
    {coins:650,tp:1200,dupes:12}
  ][tier] || {coins:900,tp:1600,dupes:15};

  let coins = base.coins;

  // Epic+ foil creation should require some coins even at Bronze.
  if(tier === 0 && rarity === "Epic") coins = 120;
  if(tier === 0 && rarity === "Legendary") coins = 250;

  const dupeDiscount = rarity === "Legendary" ? 3 : rarity === "Epic" ? 2 : rarity === "Rare" ? 1 : 0;

  const dupes = Math.max(1, base.dupes - dupeDiscount);

  return {
    coins:Math.round(coins * (tier === 0 ? 1 : rarityMult)),
    tp:Math.round(base.tp * rarityMult),
    dupes,
    copies:dupes
  };
}


function upgradeGainForRarity(rarity){
  return {
    Common:1.9,
    Uncommon:1.7,
    Rare:1.5,
    Epic:1.3,
    Legendary:1.15
  }[rarity] || 1.4;
}

function isCardSpecialistInStat(c, key){
  const values = [c.off, c.def, c.ath, c.iq];
  const max = Math.max(...values);
  const second = values.slice().sort((a,b) => b - a)[1];
  return c[key] === max && max - second >= 10;
}

function rawEffectiveStat(c, key){
  const level = cardLevel(c.id);
  const foilBonus = foilRank(foilTier(c.id));
  const levelBonus = Math.max(0, level - 1);

  const rarityGain = upgradeGainForRarity(c.rarity);
  const levelGain = Math.round(levelBonus * rarityGain);
  const specialistGain = isCardSpecialistInStat(c, key) ? Math.floor(levelBonus / 2) : 0;
  const foilGain = foilBonus * 2;

  return c[key] + levelGain + specialistGain + foilGain;
}

function effectiveStat(c, key){
  // Core Stability Test v1:
  // Base cards still live on a 25-99 scale, but upgrades/foils can push
  // effective stats beyond 99 so high-end cards do not waste upgrades.
  return Math.min(125, rawEffectiveStat(c, key));
}

function displayStatValue(c, key){
  return `${effectiveStat(c, key)}`;
}

function effectiveOverall(c){
  return Math.round((effectiveStat(c,"off") + effectiveStat(c,"def") + effectiveStat(c,"ath") + effectiveStat(c,"iq")) / 4);
}

function duplicateCount(id){
  return Math.max(0, (state.collection[id] || 0) - 1);
}

function canUpgrade(c){
  const cost = upgradeCost(c);
  return cardLevel(c.id) < 10 &&
    state.coins >= cost.coins &&
    state.trainingPoints >= cost.tp &&
    duplicateCount(c.id) >= cost.copies;
}

function canFoil(c){
  const next = nextFoilTier(c.id);
  if(!next) return false;
  const cost = foilCost(c);
  return state.coins >= cost.coins &&
    state.trainingPoints >= cost.tp &&
    duplicateCount(c.id) >= cost.copies;
}

function upgradeCard(id){
  const c = card(id);
  if(!c) return;

  const cost = upgradeCost(c);

  if(cardLevel(id) >= 10){
    toast("Card is already max level.");
    return;
  }

  if(state.coins < cost.coins || state.trainingPoints < cost.tp || duplicateCount(id) < cost.copies){
    toast("Not enough coins, training points, or duplicates.");
    return;
  }

  state.coins -= cost.coins;
  state.trainingPoints -= cost.tp;
  state.collection[id] -= cost.copies;
  state.upgrades[id] = cardLevel(id) + 1;
  state.stats.upgradesMade++;
  addCollectorXP(20 + cardLevel(id) * 10 + rarityRank(c.rarity) * 5, "card upgrade");

  addLog(`Upgraded ${c.name} to Level ${cardLevel(id)}. Cost: ${cost.coins} coins, ${cost.tp} TP, ${cost.copies} duplicate copy/copies.`);
  saveGame();
  render();
  toast(`${c.name} upgraded to Level ${cardLevel(id)}.`);
}

function upgradeFoil(id){
  const c = card(id);
  if(!c) return;

  const next = nextFoilTier(id);
  if(!next){
    toast("Card is already max foil.");
    return;
  }

  const cost = foilCost(c);

  if(state.coins < cost.coins || state.trainingPoints < cost.tp || duplicateCount(id) < cost.copies){
    toast("Not enough coins, training points, or duplicates.");
    return;
  }

  state.coins -= cost.coins;
  state.trainingPoints -= cost.tp;
  state.collection[id] -= cost.copies;
  state.foil[id] = next;
  state.stats.upgradesMade++;
  addCollectorXP(45 + foilRank(next) * 20 + rarityRank(c.rarity) * 8, "foil upgrade");

  addLog(`Upgraded ${c.name} to ${next} Foil. Cost: ${cost.coins} coins, ${cost.tp} TP, ${cost.copies} duplicate copies.`);
  saveGame();
  render();
  toast(`${next} Foil unlocked.`);
}

function quickSellDuplicate(id){
  const c = card(id);
  if(!c) return;

  if(duplicateCount(id) < 1){
    toast("No duplicate copy to sell.");
    return;
  }

  const rank = rarityRank(c.rarity);
  const coins = {1:18,2:28,3:48,4:85,5:150}[rank] || 18;
  const tp = {1:15,2:24,3:40,4:75,5:140}[rank] || 15;

  state.collection[id] -= 1;
  state.coins += coins;
  state.trainingPoints += tp;
  addCollectorXP(10 + rank * 4, "duplicate quick-sell");
  state.stats.doublesSold++;

  addLog(`Quick-sold duplicate ${c.name}: +${coins} coins, +${tp} TP.`);
  saveGame();
  render();
  toast(`+${coins} coins, +${tp} TP`);
}


function claimDailyBonus(){
  if(state.daily.bonus){
    toast("Daily bonus already claimed today.");
    return;
  }

  const coins = 75 + Math.min(5, state.streak - 1) * 15;
  const tp = 18 + Math.min(5, state.streak - 1) * 5;

  state.coins += coins;
  state.trainingPoints += tp;
  state.stats.dailyClaims++;
  state.daily.bonus = true;
  state.streak++;

  addLog(`Claimed earned daily check-in: +${coins} coins, +${tp} TP. Streak is now ${state.streak}.`);
  saveGame();
  render();
  toast(`Daily check-in: +${coins} coins, +${tp} TP`);
}

function claimSponsorBonus(){
  if(state.daily.sponsor){
    toast("Sponsor task already completed today.");
    return;
  }

  if(state.stamina < 2){
    toast("Not enough stamina.");
    return;
  }

  // Earned reward: user spends stamina and outcome depends on lineup score.
  state.stamina -= 2;

  const score = lineupScore();
  const bonus = Math.floor(score / 45);
  const coins = 65 + bonus + Math.floor(Math.random() * 31);
  const tp = 12 + Math.floor(score / 120) + Math.floor(Math.random() * 10);

  state.coins += coins;
  state.trainingPoints += tp;
  state.stats.sponsorClaims++;
  state.daily.sponsor = true;

  addLog(`Completed sponsor showcase using your lineup score (${score}): +${coins} coins, +${tp} TP.`);
  saveGame();
  render();
  toast(`Sponsor showcase: +${coins} coins, +${tp} TP`);
}

function runTrainingDrill(){
  if(state.daily.drill){
    toast("Training drill already completed today.");
    return;
  }

  if(state.stamina < 3){
    toast("Not enough stamina.");
    return;
  }

  // Earned reward: higher active lineup average gives better drill output.
  state.stamina -= 3;

  const active = state.lineup.map(id => card(id)).filter(Boolean);
  const avg = active.length ? Math.round(active.reduce((s,c) => s + effectiveOverall(c), 0) / active.length) : 0;
  const coins = 30 + Math.floor(avg / 6) + Math.floor(Math.random() * 21);
  const tp = 35 + Math.floor(avg / 3) + Math.floor(Math.random() * 18);

  state.coins += coins;
  state.trainingPoints += tp;
  state.daily.drill = true;

  addLog(`Completed lineup training drill (avg OVR ${avg}): +${coins} coins, +${tp} TP.`);
  saveGame();
  render();
  toast(`Training drill: +${coins} coins, +${tp} TP`);
}

function openShopBonus(){
  if(state.daily.shop){
    toast("Shop task already completed today.");
    return;
  }

  // Small task, small reward. Limited once per day.
  const coins = 25 + Math.floor(Math.random() * 21);
  state.coins += coins;
  state.daily.shop = true;

  addLog(`Completed shop visit task: +${coins} coins.`);
  saveGame();
  render();
  toast(`Shop visit: +${coins} coins`);
}
function lineupScore(){
  return state.lineup
    .map(id => effectiveOverall(card(id)))
    .reduce((a,b) => a + b, 0);
}

function startMatch(cup = false){
  if(state.lineup.length < 3){
    toast("You need at least 3 cards in your lineup.");
    currentView = "lineup";
    render();
    return;
  }

  // Core Stability Test v1:
  // Free Quick Match should not let players bank clears indefinitely.
  // If clears are waiting, send the player to the Draft Board first.
  if(!cup && state.draft && (state.draft.clears || 0) > 0){
    currentView = "draft";
    render();
    toast("Use your Draft clears before starting another Quick Match.");
    return;
  }

  // Quick Match is free. Stamina is reserved for economy-risk modes and Cup entries.
  if(cup && state.stamina < 1){
    toast("Not enough stamina.");
    return;
  }

  if(cup) state.stamina -= 1;

  const opp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
  matchState = {
    cup,
    opp,
    round:1,
    you:0,
    them:0,
    used:[],
    history:[],
    finished:false,
    lastBattle:null,
    result:null,
    roundResults:[],
    phases:generateMatchPhases(),
    overtime:false
  };

  if(cup) state.stats.cupGames++;

  checkQuests();
  saveGame();
  render();
}

function opponentCard(){
  const lvl = matchState.opp.level;
  let pool = CARDS.filter(c => rarityRank(c.rarity) <= Math.min(5, 1 + Math.ceil(lvl / 2)));

  if(lvl >= 4){
    pool = CARDS.filter(c => rarityRank(c.rarity) >= 2);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function playRound(id){
  if(!matchState || matchState.finished) return;

  if(matchState.used.includes(id)){
    toast("That card was already used.");
    return;
  }

  const pc = card(id);
  const oc = opponentCard();
  const cat = currentMatchPhase();
  const sportBonus = pc.sport === oc.sport ? 2 : 0;
  const pScore = phaseValue(pc, cat) + sportBonus + Math.floor(Math.random() * 10);
  const oScore = phaseValue(oc, cat) + matchState.opp.bonus + Math.floor(Math.random() * 10);

  matchState.used.push(id);

  let line = `${matchState.overtime ? "Overtime" : "Round " + matchState.round}: ${pc.name} (${pc.sport}) vs ${oc.name} (${oc.sport}) on ${cat.label}. ${pScore}-${oScore}. `;
  let playerWon = false;
  let tied = false;

  if(pScore > oScore){
    playerWon = true;
    matchState.you++;
    line += matchState.overtime ? "You win overtime." : "You win the round.";
  }else if(pScore < oScore){
    playerWon = false;
    matchState.them++;
    line += matchState.overtime ? "Opponent wins overtime." : "Opponent wins the round.";
  }else{
    tied = true;
    line += matchState.overtime ? "Overtime draw." : "Draw. No phase point awarded.";
  }

  matchState.lastBattle = {
    playerCardId: pc.id,
    opponentCardId: oc.id,
    category: cat.label,
    breakdown:phaseBreakdownText(pc, cat),
    playerScore: pScore,
    opponentScore: oScore,
    playerWon,
    tied
  };

  matchState.roundResults = matchState.roundResults || [];
  matchState.roundResults[matchState.round - 1] = tied ? "tie" : playerWon ? "win" : "loss";

  matchState.history.push(line);

  if(matchState.overtime){
    if(tied){
      addAnotherOvertimePhase();
    }else{
      finishMatch();
    }
    saveGame();
    render();
    return;
  }

  if(matchState.you >= 3 || matchState.them >= 3){
    finishMatch();
  }else if(matchState.round >= 5){
    if(matchState.you === matchState.them){
      enterOvertime();
    }else{
      finishMatch();
    }
  }else{
    matchState.round++;
  }

  saveGame();
  render();
}

function finishMatch(){
  const won = matchState.you > matchState.them;

  let reward = 0;
  let tpReward = 0;
  let xpReward = won ? 20 : 8;
  let draftClears = 0;

  if(matchState.cup){
    reward = won ? 70 + matchState.opp.level * 14 : 25 + matchState.you * 10;
    tpReward = won ? 120 + matchState.opp.level * 18 : 35 + matchState.you * 5;
    xpReward = won ? 35 : 12;

    state.coins += reward;
    state.trainingPoints += tpReward;
  }else{
    // Core Stability Test v1:
    // Quick Match is always playable. The real reward is controlled by Draft clears.
    draftClears = won ? 3 : 1;
    state.draft = state.draft || {clears:0, board:null, history:[]};
    state.draft.clears += draftClears;
  }

  addCollectorXP(xpReward, won ? "match win" : "match attempt");

  if(won){
    state.stats.matchesWon++;
    if(matchState.cup) state.stats.cupWins++;
  }else{
    state.stats.matchesLost++;
    if(matchState.cup) state.stats.cupLosses++;
  }

  matchState.result = won ? "win" : "loss";
  matchState.finished = true;
  matchState.rewards = {
    coins:reward,
    tp:tpReward,
    xp:xpReward,
    draftClears
  };

  if(matchState.cup){
    matchState.history.push(won ? `Cup match won. Reward: ${reward} coins and ${tpReward} TP.` : `Cup match lost. Consolation reward: ${reward} coins and ${tpReward} TP.`);
    addLog(`Collector Cup: ${won ? "won" : "lost"} against ${matchState.opp.name}. +${reward} coins, +${tpReward} TP.`);
  }else{
    matchState.history.push(won ? `Quick Match won. Draft reward: +${draftClears} clears.` : `Quick Match lost. Draft consolation: +${draftClears} clear.`);
    addLog(`Quick Match: ${won ? "won" : "lost"} against ${matchState.opp.name}. +${draftClears} Draft clear${draftClears === 1 ? "" : "s"}.`);
    currentView = "draft";
  }

  checkQuests();
}

function endMatch(){
  matchState = null;
  saveGame();
  render();
}

function go(view){
  currentView = view;
  render();
}

function setSportFilter(s){
  filterSport = s;
  binderPage = 0;
  render();
}

function setRarityFilter(r){
  filterRarity = r;
  binderPage = 0;
  render();
}


function filteredCardsForBinder(){
  let list = CARDS.slice().sort((a,b) => {
    return a.sport.localeCompare(b.sport) ||
      rarityRank(a.rarity) - rarityRank(b.rarity) ||
      a.name.localeCompare(b.name);
  });

  if(filterSport !== "All") list = list.filter(c => c.sport === filterSport);
  if(filterRarity !== "All") list = list.filter(c => c.rarity === filterRarity);

  return list;
}

function changeBinderPage(delta){
  const list = filteredCardsForBinder();
  const totalPages = Math.max(1, Math.ceil(list.length / 9));
  binderPage = Math.max(0, Math.min(totalPages - 1, binderPage + delta));
  render();
}


function heatCardIndexesInPack(cardIds){
  // Every Rare+ card gets visual treatment. This prevents packs with multiple big pulls
  // from only making one card feel special.
  return cardIds
    .map((id, i) => ({id, i, rank:rarityRank(card(id).rarity)}))
    .filter(entry => entry.rank >= 3)
    .map(entry => entry.i);
}

function bestCardIndexInPack(cardIds){
  let bestIndex = 0;
  cardIds.forEach((id, i) => {
    const current = card(id);
    const best = card(cardIds[bestIndex]);
    const currentScore = rarityRank(current.rarity) * 1000 + effectiveOverall(current);
    const bestScore = rarityRank(best.rarity) * 1000 + effectiveOverall(best);
    if(currentScore > bestScore) bestIndex = i;
  });
  return bestIndex;
}

function packHeatTier(pack){
  if(!pack || !pack.cards || !pack.cards.length) return "Common";
  const bestIndex = pack.heatIndex ?? bestCardIndexInPack(pack.cards);
  return card(pack.cards[bestIndex]).rarity;
}

function pullStatusLabel(pack, index){
  if(!pack || !pack.cards) return "";
  const isNew = pack.newFlags && pack.newFlags[index];
  return isNew ? "NEW" : "";
}

function rarityClassValue(rarity){
  return {
    Common:"common",
    Uncommon:"uncommon",
    Rare:"rare",
    Epic:"epic",
    Legendary:"legendary"
  }[rarity] || "common";
}

function bestCardInPack(cardIds){
  return cardIds
    .map(id => card(id))
    .sort((a,b) => rarityRank(b.rarity) - rarityRank(a.rarity) || effectiveOverall(b) - effectiveOverall(a))[0];
}

function statsHtml(){
  const unique = ownedCards().length;

  return `
    <span class="pill">🪙 ${state.coins} <small>coins</small></span>\n    <span class="pill">⭐ ${state.trainingPoints} <small>training points</small></span>
    <span class="pill">⚡ ${state.stamina}/${state.maxStamina} <small>stamina</small></span>
    <span class="pill">📅 Day ${state.day}</span>\n    <span class="pill">🏆 Lv ${collectorLevel()} <small>collector</small></span>
    <span class="pill">🃏 ${unique}/${CARDS.length} <small>unique</small></span>
    <span class="pill">📋 ${lineupScore()} <small>lineup score</small></span>\n    <span class="pill">⚔️ ${matchRecordText()} <small>quick match</small></span>\n    <span class="pill">🎯 ${state.draft?.clears || 0} <small>draft clears</small></span>
  `;
}

function cardHtml(c, options = {}){
  const owned = state.collection[c.id] || 0;
  const selected = options.selected ? "selected" : "";
  const mode = options.mode || "inspect";

  let action = "";
  let cardClick = `openInspect('${c.id}')`;
  let cardLabel = `Inspect ${c.name}`;

  if(mode === "collection"){
    cardClick = `openInspect('${c.id}')`;
    cardLabel = `Inspect ${c.name}`;
    action = state.lineup.includes(c.id)
      ? `<button onclick="event.stopPropagation(); removeFromLineup('${c.id}')" class="danger">Remove from lineup</button>`
      : `<button onclick="event.stopPropagation(); addToLineup('${c.id}')">Add to lineup</button>`;
  }

  if(mode === "lineup"){
    cardClick = `removeFromLineup('${c.id}')`;
    cardLabel = `Remove ${c.name} from lineup`;
    action = `<button onclick="event.stopPropagation(); removeFromLineup('${c.id}')" class="danger">Remove</button>`;
  }

  if(mode === "lineup-add"){
    cardClick = `addToLineup('${c.id}')`;
    cardLabel = `Add ${c.name} to lineup`;
    action = `<button onclick="event.stopPropagation(); addToLineup('${c.id}')">Add to lineup</button>`;
  }

  if(mode === "match"){
    const disabled = matchState.used.includes(c.id) || matchState.finished ? "disabled" : "";
    const phase = matchState && !matchState.finished ? currentMatchPhase() : null;
    const phaseScore = phase ? phaseHintForCard(c) : "";

    cardClick = disabled ? "" : `playRound('${c.id}')`;
    cardLabel = `Play ${c.name}`;
    action = `<button onclick="event.stopPropagation(); playRound('${c.id}')" ${disabled}>Play ${phase ? phase.short + " " + phaseScore : "card"}</button>`;
  }

  const disabledClass = mode === "match" && (matchState.used.includes(c.id) || matchState.finished) ? "disabled-click" : "";
  const clickAttr = cardClick ? `onclick="event.stopPropagation(); ${cardClick}"` : "";
  const showCardBadges = mode !== "lineup" && mode !== "lineup-add";

  return `
    <div data-card-id="${c.id}" class="card ${state.collectionFocusId === c.id ? "" : ""} real-card ${c.rarity} ${selected} ${disabledClass}" style="${sportStyle(c)}">
      <button class="inspect-hitbox card-primary-hitbox ${mode}" ${clickAttr} aria-label="${cardLabel}">
        <div class="full-card-art">
          <img src="${c.realisticArt}"
               alt="${c.name} card art"
               onerror="imageFallback(this, '${c.cardArt}')"/>
          <div class="mini-holo ${c.rarity}"></div>
        </div>
      </button>
      ${showCardBadges && owned > 1 ? `<div class="owned">×${owned}</div>` : ""}
      ${showCardBadges ? `<div class="card-level-badge">Lv ${cardLevel(c.id)} · ${foilTier(c.id)}</div>` : ""}
      <div class="card-actions">${action}</div>
    </div>
  `;
}

function lockedCardHtml(c){
  return `
    <div data-card-id="${c.id}" class="card ${state.collectionFocusId === c.id ? "" : ""} real-card ${c.rarity}" style="${sportStyle(c)};filter:grayscale(.75);opacity:.58">
      <div class="full-card-locked">?</div>
    </div>
  `;
}


function packCardHtml(c){
  return `
    <div data-card-id="${c.id}" class="card ${state.collectionFocusId === c.id ? "" : ""} real-card ${c.rarity}" style="${sportStyle(c)}">
      <div class="full-card-art">
        <img src="${c.realisticArt}"
             alt="${c.name} card art"
             onerror="imageFallback(this, '${c.cardArt}')"/>
        <div class="mini-holo ${c.rarity}"></div>
      </div>
    </div>
  `;
}




function buyPackFromReveal(key, quantity = 1){
  if(packOpening){
    if(allPackCardsFlipped()){
      finishPackReveal(false);
    }else{
      toast("Flip all cards first.");
      currentView = "packs";
      render();
      ensurePackRevealVisible();
      return;
    }
  }

  packQueue = [];
  currentView = "packs";
  openPack(key, quantity);
}

function finishAndOpenSamePack(){
  const key = packOpening ? packOpening.key : lastOpenedPackKey;
  buyPackFromReveal(key, 1);
}

function packRevealHubHtml(currentKey){
  return `
    <div class="pack-reveal-hub-force">
      <div class="pack-reveal-hub-force-header">
        <div>
          <h3>Open another pack</h3>
          <p>Choose the same pack or switch tiers without leaving this reveal screen.</p>
        </div>
        <button onclick="finishAndOpenSamePack()" class="gold" ${state.coins < PACKS[currentKey].cost ? "disabled" : ""}>Open another ${PACKS[currentKey].name}</button>
      </div>

      <div class="pack-reveal-picker-force">
        ${Object.entries(PACKS).map(([key,p]) => {
          const icon = ({rookie:"🌱",pro:"💼",star:"⭐",hof:"🏛️"}[key] || "🎁");
          return `
            <div class="mini-pack-option-force ${key === currentKey ? "current" : ""}">
              <div class="mini-pack-name-force">${icon} ${p.name}</div>
              <div class="mini-pack-meta-force">${p.count} cards · ${p.cost} coins</div>
              <div class="mini-pack-pity-force">${nextPityText(key, "rare") ? "Rare+ dry " + nextPityText(key, "rare").dry + "/" + nextPityText(key, "rare").threshold : ""}</div>
              <div class="mini-pack-buttons-force">
                <button onclick="buyPackFromReveal('${key}',1)" ${!isPackUnlocked(key) || state.coins < p.cost ? "disabled" : ""}>Buy 1</button>
                <button onclick="buyPackFromReveal('${key}',5)" ${!isPackUnlocked(key) || state.coins < p.cost * 5 ? "disabled" : ""}>Buy 5</button>
                <button onclick="buyPackFromReveal('${key}',10)" ${!isPackUnlocked(key) || state.coins < p.cost * 10 ? "disabled" : ""}>Buy 10</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function packOpeningHtml(){
  if(!packOpening) return "";

  const pack = PACKS[packOpening.key];
  const heatIndex = packOpening.heatIndex ?? bestCardIndexInPack(packOpening.cards);
  const heatIndexes = packOpening.heatIndexes && packOpening.heatIndexes.length
    ? packOpening.heatIndexes
    : heatCardIndexesInPack(packOpening.cards);

  const hasHeat = heatIndexes.length > 0;
  const allFlipped = packOpening.cards.length && packOpening.flipped.length === packOpening.cards.length;
  const nonHeatAllFlipped = packOpening.cards.every((_, i) => heatIndexes.includes(i) || packOpening.flipped.includes(i));
  const hiddenHeatIndexes = heatIndexes.filter(i => !packOpening.flipped.includes(i));
  const bigPullReady = hasHeat && nonHeatAllFlipped && hiddenHeatIndexes.length > 0;
  const best = bestCardInPack(packOpening.cards);
  const bestRarity = best ? best.rarity : "Common";
  const auraText = allFlipped
    ? `Best pull: ${best.rarity} ${best.name} · OVR ${overall(best)}`
    : bigPullReady
      ? (hiddenHeatIndexes.length > 1 ? "Final reveals ready" : "Final reveal ready")
      : "";

  if(!packOpening.ripped){
    return `
      <div class="pack-stage pack-v2-stage pack-heat-stage ${rarityClassValue(bestRarity)} ${hasHeat ? "has-heat" : "no-heat"}">
        <div class="pack-v2-backdrop"></div>
        <div class="pack-rip-heat ${rarityClassValue(bestRarity)} ${hasHeat ? "active" : ""}"></div>
        <h3>Rip your ${pack.name}</h3>
        <p class="tiny">Rip the pack to reveal your cards.</p>

        <div class="foil-pack-wrap">
          <div class="foil-pack v2-pack heat-pack pack-portrait ${packOpening.key} ${rarityClassValue(bestRarity)} ${hasHeat ? "has-heat" : ""}">
            <div class="pack-glint"></div>
            <div class="pack-art-frame">
              <div class="pack-art-kicker">Major Sports</div>
              <div class="pack-art-icons">🏈 🏀 ⚽ ⚾</div>
              <div class="pack-art-title">${pack.name.replace(" Pack","")}</div>
              <div class="pack-art-subtitle">Card Pack</div>
              <div class="pack-art-count">${pack.count} Cards</div>
            </div>
            ${hasHeat ? `<div class="pack-fire ${rarityClassValue(bestRarity)}"></div>` : ""}
          </div>
          <button onclick="ripPack()" class="dark rip-button">Hold / click to rip pack</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="pack-stage pack-v2-stage pack-heat-stage ${rarityClassValue(bestRarity)} ${hasHeat ? "has-heat" : "no-heat"}">
      <div class="pack-v2-backdrop"></div>
      <div class="section-title" style="margin-bottom:8px">
        <div>
          <h3>${pack.name} Reveal</h3>
          <p class="tiny">${packQueue.length ? "Queued packs left: " + packQueue.length : ""}</p>
        </div>

        <div class="row">
          <button onclick="revealAll()" class="gold" ${allFlipped ? "disabled" : ""}>${bigPullReady ? (hiddenHeatIndexes.length > 1 ? "Reveal Big Pulls" : "Reveal Big Pull") : hasHeat ? "Flip normal cards" : "Flip all"}</button>
          ${allFlipped ? `<button onclick="finishPackReveal()" class="green">${packQueue.length ? "Open next pack" : "Continue"}</button>` : ""}
        </div>
      </div>

      ${packOpening.guaranteeApplied ? `<div class="pack-guarantee-note">Pity guarantee active: ${packOpening.guaranteeApplied}</div>` : ""}

      <div class="rip-line v2-rip ${rarityClassValue(bestRarity)}"></div>

      ${auraText ? `
        <div class="pack-best-aura ${allFlipped ? "visible" : bigPullReady ? "ready" : ""} ${rarityClassValue(bestRarity)}">
          ${auraText}
        </div>
      ` : ""}

      <div class="reveal-grid v2-reveal-grid heat-reveal-grid">
        ${packOpening.cards.map((id, i) => {
          const c = card(id);
          const flipped = packOpening.flipped.includes(i);
          const rarePlus = rarityRank(c.rarity) >= 3;
          const isHeatCard = heatIndexes.includes(i);
          const status = pullStatusLabel(packOpening, i);
          const statusClass = status.toLowerCase();

          return `
            <button class="reveal-card v2-reveal-card heat-reveal-card ${isHeatCard && !flipped ? "heat-hidden " + rarityClassValue(c.rarity) : ""} ${isHeatCard && bigPullReady ? "big-ready" : ""} ${flipped ? "flipped " + c.rarity + " " + rarityClassValue(c.rarity) : ""}"
                    style="--deal:${i};"
                    onclick="flipCard(${i})"
                    aria-label="Flip card ${i+1}">
              <div class="reveal-inner">
                <div class="reveal-face">
                  <div class="card-back ${isHeatCard ? "heat-card-back " + rarityClassValue(c.rarity) : ""}">
                    <div class="deal-number">${i + 1}</div>
                  </div>
                </div>

                <div class="reveal-face reveal-front">
                  ${packCardHtml(c)}
                  ${flipped && status === "NEW" ? `<div class="pull-status ${statusClass}">${status}</div>` : ""}
                  ${flipped && rarePlus ? `<div class="pull-banner ${rarityClassValue(c.rarity)}">${c.rarity}${status === "NEW" ? " NEW CARD" : " PULL"}</div>` : ""}
                  ${flipped && isHeatCard ? `<div class="big-pull-burst ${rarityClassValue(c.rarity)}"></div>` : ""}
                </div>
              </div>
            </button>
          `;
        }).join("")}
      </div>

      ${bigPullReady ? `<div class="big-pull-callout ${rarityClassValue(bestRarity)}">${hiddenHeatIndexes.length > 1 ? "Multiple big pulls are still face down." : "One big pull is still face down."}</div>` : ""}

      ${allFlipped ? `
        <div class="best-pull ${rarityClassValue(bestRarity)}">
          Best pull: <strong>${best.rarity} ${best.name}</strong> · ${best.sport} · OVR ${overall(best)}${pullStatusLabel(packOpening, heatIndex) ? " · NEW" : ""}
        </div>

        <div class="pack-after-actions">
          <button onclick="finishPackReveal()" class="green">${packQueue.length ? "Open next pack" : "Continue"}</button>
          ${!packQueue.length ? `<button onclick="finishAndOpenSamePack()" class="gold" ${state.coins < pack.cost ? "disabled" : ""}>Open another ${pack.name}</button>` : ""}
        </div>

        ${!packQueue.length ? packRevealHubHtml(packOpening.key) : ""}
      ` : ""}
    </div>
  `;
}

function render(){
  checkQuests();

  document.getElementById("stats").innerHTML = statsHtml();

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });

  const app = document.getElementById("app");

  document.body.classList.toggle("match-arena-active", currentView === "match" && !!matchState);

  if(currentView === "home") app.innerHTML = viewHome();
  if(currentView === "collection") app.innerHTML = viewCollection();
  if(currentView === "packs") app.innerHTML = viewPacks();
  if(currentView === "lineup") app.innerHTML = viewLineup();
  if(currentView === "match") app.innerHTML = viewMatch();
  if(currentView === "draft") app.innerHTML = viewDraft();
  if(currentView === "earn") app.innerHTML = viewEarnCoins();
  if(currentView === "admin") app.innerHTML = viewAdmin();
  if(currentView === "season") app.innerHTML = viewCup();
  if(currentView === "quests") app.innerHTML = viewQuests();
  if(currentView === "settings") app.innerHTML = viewSettings();

  saveGame();
  renderInspect();
}


function randomItem(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function pickTwoOwnedCards(){
  const owned = ownedCards();
  if(owned.length < 2) return null;
  const left = randomItem(owned);
  let right = randomItem(owned);
  let guard = 0;
  while(right.id === left.id && guard < 30){
    right = randomItem(owned);
    guard++;
  }
  return {left, right};
}

function startStatBattleLadder(){
  if(state.stamina < 1){ toast("Not enough stamina."); return; }
  if(ownedCards().length < 2){ toast("You need at least 2 cards."); return; }

  state.stamina -= 1;
  statBattleGame = {round:1,maxRound:7,correct:0,bankCoins:0,bankTP:0,active:true,finished:false,history:[],current:null};
  nextStatBattleQuestion();
  addLog("Started Stat Battle Ladder.");
  saveGame();
  render();
}

function nextStatBattleQuestion(){
  const pair = pickTwoOwnedCards();
  const phase = randomItem(phasePool());
  statBattleGame.current = {leftId:pair.left.id,rightId:pair.right.id,phase};
}

function answerStatBattle(choice){
  if(!statBattleGame || !statBattleGame.active || !statBattleGame.current) return;
  const cur = statBattleGame.current;
  const left = card(cur.leftId);
  const right = card(cur.rightId);
  const leftScore = phaseValue(left, cur.phase);
  const rightScore = phaseValue(right, cur.phase);

  let correctChoice = "tie";
  if(leftScore > rightScore) correctChoice = "left";
  if(rightScore > leftScore) correctChoice = "right";

  const correct = choice === correctChoice;

  if(correct){
    statBattleGame.correct++;
    const roundCoins = 22 + statBattleGame.round * 9;
    const roundTP = 5 + statBattleGame.round * 3;
    statBattleGame.bankCoins += roundCoins;
    statBattleGame.bankTP += roundTP;
    statBattleGame.history.push(`Round ${statBattleGame.round}: Correct. ${left.name} ${leftScore} vs ${right.name} ${rightScore}. Bank +${roundCoins} coins, +${roundTP} TP.`);

    if(statBattleGame.round >= statBattleGame.maxRound){
      statBattleGame.active = false;
      statBattleGame.finished = true;
      statBattleGame.history.push("Ladder cleared. Cash out your full bank.");
    }else{
      statBattleGame.round++;
      nextStatBattleQuestion();
    }
  }else{
    statBattleGame.bankCoins = Math.floor(statBattleGame.bankCoins * 0.4);
    statBattleGame.bankTP = Math.floor(statBattleGame.bankTP * 0.4);
    statBattleGame.active = false;
    statBattleGame.finished = true;
    statBattleGame.history.push(`Round ${statBattleGame.round}: Wrong. ${left.name} ${leftScore} vs ${right.name} ${rightScore}. Correct: ${correctChoice.toUpperCase()}. Bank reduced.`);
  }

  saveGame();
  render();
}

function cashOutStatBattle(){
  if(!statBattleGame) return;
  const coins = statBattleGame.bankCoins;
  const tp = statBattleGame.bankTP;
  state.coins += coins;
  state.trainingPoints += tp;
  addLog(`Cashed out Stat Battle Ladder: +${coins} coins, +${tp} TP.`);
  statBattleGame = null;
  saveGame();
  render();
  toast(`Cashed out: +${coins} coins, +${tp} TP`);
}

function duplicateCards(){
  return ownedCards().filter(c => duplicateCount(c.id) > 0);
}

function createTradeOffer(type, stakeCard){
  const base = 22 + rarityRank(stakeCard.rarity) * 28;

  if(type === "safe"){
    return {type:"Safe Buyer", odds:"100% modest payout", risk:"safe", coins:Math.round(base * 1.15), tp:6 + rarityRank(stakeCard.rarity) * 2, label:"Guaranteed sale"};
  }

  if(type === "mystery"){
    const roll = Math.random();
    if(roll < .55) return {type:"Mystery Broker", odds:"55% fair / 35% strong / 10% jackpot", risk:"medium", coins:Math.round(base * 1.25), tp:9 + rarityRank(stakeCard.rarity) * 3, label:"Fair trade"};
    if(roll < .90) return {type:"Mystery Broker", odds:"55% fair / 35% strong / 10% jackpot", risk:"medium", coins:Math.round(base * 2.1), tp:15 + rarityRank(stakeCard.rarity) * 5, label:"Strong trade"};
    return {type:"Mystery Broker", odds:"55% fair / 35% strong / 10% jackpot", risk:"medium", coins:Math.round(base * 4.2), tp:30 + rarityRank(stakeCard.rarity) * 8, label:"Jackpot trade"};
  }

  const roll = Math.random();
  if(roll < .45) return {type:"High Roller", odds:"45% bust / 35% fair / 15% big / 5% jackpot", risk:"high", coins:Math.round(base * .25), tp:2, label:"Bad deal"};
  if(roll < .80) return {type:"High Roller", odds:"45% bust / 35% fair / 15% big / 5% jackpot", risk:"high", coins:Math.round(base * 1.6), tp:10 + rarityRank(stakeCard.rarity) * 4, label:"Fair hit"};
  if(roll < .95) return {type:"High Roller", odds:"45% bust / 35% fair / 15% big / 5% jackpot", risk:"high", coins:Math.round(base * 3.4), tp:22 + rarityRank(stakeCard.rarity) * 7, label:"Big hit"};
  return {type:"High Roller", odds:"45% bust / 35% fair / 15% big / 5% jackpot", risk:"high", coins:Math.round(base * 7), tp:55 + rarityRank(stakeCard.rarity) * 10, label:"Market jackpot"};
}

function startTradeMarket(){
  if(state.stamina < 2){ toast("Not enough stamina."); return; }
  const dupes = duplicateCards();
  if(!dupes.length){ toast("You need at least one duplicate card."); return; }

  state.stamina -= 2;
  const stake = dupes.slice().sort((a,b) => rarityRank(a.rarity) - rarityRank(b.rarity) || effectiveOverall(a) - effectiveOverall(b))[0];

  tradeMarketGame = {
    stakeId:stake.id,
    chosen:null,
    revealed:false,
    offers:[createTradeOffer("safe", stake),createTradeOffer("mystery", stake),createTradeOffer("high", stake)]
  };

  addLog(`Started Trade Market with duplicate ${stake.name} at stake.`);
  saveGame();
  render();
}

function chooseTradeOffer(index){
  if(!tradeMarketGame || tradeMarketGame.revealed) return;
  const stake = card(tradeMarketGame.stakeId);
  const offer = tradeMarketGame.offers[index];

  if(duplicateCount(stake.id) < 1){
    toast("Duplicate no longer available.");
    tradeMarketGame = null;
    render();
    return;
  }

  state.collection[stake.id] -= 1;
  state.coins += offer.coins;
  state.trainingPoints += offer.tp;
  addCollectorXP(18, "trade market");
  state.stats.doublesSold++;

  tradeMarketGame.chosen = index;
  tradeMarketGame.revealed = true;

  addLog(`Trade Market: traded duplicate ${stake.name}. ${offer.label}: +${offer.coins} coins, +${offer.tp} TP.`);
  saveGame();
  render();
  toast(`${offer.label}: +${offer.coins} coins, +${offer.tp} TP`);
}


function tradeMarketAgain(){
  if(!tradeMarketGame || !tradeMarketGame.revealed){
    closeTradeMarket();
    startTradeMarket();
    return;
  }

  tradeMarketGame = null;
  startTradeMarket();
}

function closeTradeMarket(){
  tradeMarketGame = null;
  saveGame();
  render();
}


function blackjackRanks(){
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
}

function blackjackRankValue(rank){
  if(rank === "A") return 11;
  if(["10","J","Q","K"].includes(rank)) return 10;
  return Number(rank);
}

function blackjackSuitSports(){
  return ["Football","Basketball","Soccer","Baseball"];
}

function cardValueSeed(id){
  let n = 0;
  for(let i = 0; i < id.length; i++) n += id.charCodeAt(i) * (i + 3);
  return n;
}

function visualCardForBlackjack(rank, sport){
  const sportCards = CARDS.filter(c => c.sport === sport);
  const value = blackjackRankValue(rank);

  let pool = sportCards;

  if(rank === "A"){
    pool = sportCards.filter(c => c.rarity === "Legendary" || c.rarity === "Epic");
  }else if(value === 10){
    pool = sportCards.filter(c => ["Rare","Epic","Legendary"].includes(c.rarity));
  }else if(value >= 7){
    pool = sportCards.filter(c => ["Uncommon","Rare","Epic"].includes(c.rarity));
  }else{
    pool = sportCards.filter(c => ["Common","Uncommon"].includes(c.rarity));
  }

  if(!pool.length) pool = sportCards;
  if(!pool.length) pool = CARDS;

  const seed = cardValueSeed(`${rank}-${sport}-${pool.length}`);
  return pool[seed % pool.length];
}

function blackjackDeck(){
  // Virtual Deck v3:
  // Blackjack now uses a balanced 52-card value deck.
  // Football/Basketball/Soccer/Baseball act like suits.
  // The displayed sports-card art can preview any catalog card, owned or unowned.
  const deck = [];

  blackjackSuitSports().forEach(sport => {
    blackjackRanks().forEach(rank => {
      const visual = visualCardForBlackjack(rank, sport);
      deck.push({
        rank,
        sport,
        value:blackjackRankValue(rank),
        visualId:visual.id
      });
    });
  });

  for(let i = deck.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function blackjackHandValue(cards){
  let total = 0;
  let soft = 0;

  cards.forEach(entry => {
    if(entry.rank === "A"){
      total += 11;
      soft++;
    }else{
      total += entry.value;
    }
  });

  while(total > 21 && soft > 0){
    total -= 10;
    soft--;
  }

  return {
    total,
    soft,
    bust: total > 21,
    blackjack: cards.length === 2 && total === 21
  };
}

function drawBlackjackCard(){
  if(!blackjackGame.deck.length){
    blackjackGame.deck = blackjackDeck();
  }
  return blackjackGame.deck.pop();
}

function startBlackjack(stake){
  stake = Number(stake);

  if(![25,75,150,300].includes(stake)){
    toast("Invalid table stake.");
    return;
  }

  if(state.coins < stake){
    toast("Not enough coins.");
    return;
  }

  if(state.stamina < 1){
    toast("Not enough stamina.");
    return;
  }

  if(ownedCards().length < 2){
    toast("You need at least 2 cards.");
    return;
  }

  state.coins -= stake;
  state.stamina -= 1;
  state.stats.blackjack.coinsWagered += stake;

  blackjackGame = {
    stake,
    currentStake:stake,
    deck:blackjackDeck(),
    player:[],
    dealer:[],
    phase:"player",
    doubled:false,
    result:null,
    payout:0,
    log:[],
    statsRecorded:false
  };

  blackjackGame.player.push(drawBlackjackCard());
  blackjackGame.dealer.push(drawBlackjackCard());
  blackjackGame.player.push(drawBlackjackCard());
  blackjackGame.dealer.push(drawBlackjackCard());

  blackjackGame.log.push(`Started hand at ${stake} coins.`);

  const playerValue = blackjackHandValue(blackjackGame.player);
  const dealerValue = blackjackHandValue(blackjackGame.dealer);

  if(playerValue.blackjack || dealerValue.blackjack){
    settleBlackjack();
  }

  saveGame();
  render();
}

function blackjackHit(){
  if(!blackjackGame || blackjackGame.phase !== "player") return;

  blackjackGame.player.push(drawBlackjackCard());
  blackjackGame.log.push("Hit: drew 1 card.");

  const value = blackjackHandValue(blackjackGame.player);

  if(value.bust){
    settleBlackjack();
  }

  saveGame();
  render();
}

function blackjackStand(){
  if(!blackjackGame || blackjackGame.phase !== "player") return;

  blackjackGame.phase = "dealer";
  blackjackGame.log.push("Stand. Dealer plays.");
  dealerPlayBlackjack();
  settleBlackjack();

  saveGame();
  render();
}

function blackjackDoubleDown(){
  if(!blackjackGame || blackjackGame.phase !== "player") return;

  if(blackjackGame.player.length !== 2){
    toast("Double Down is only available on your first 2 cards.");
    return;
  }

  if(blackjackGame.doubled){
    toast("Already doubled.");
    return;
  }

  if(state.coins < blackjackGame.stake){
    toast("Not enough coins to double down.");
    return;
  }

  state.coins -= blackjackGame.stake;
  state.stats.blackjack.coinsWagered += blackjackGame.stake;
  state.stats.blackjack.doubled++;
  blackjackGame.currentStake += blackjackGame.stake;
  blackjackGame.doubled = true;
  blackjackGame.player.push(drawBlackjackCard());
  blackjackGame.log.push(`Double Down: stake increased to ${blackjackGame.currentStake}. Drew exactly 1 card.`);

  const value = blackjackHandValue(blackjackGame.player);

  if(!value.bust){
    blackjackGame.phase = "dealer";
    dealerPlayBlackjack();
  }

  settleBlackjack();
  saveGame();
  render();
}

function dealerPlayBlackjack(){
  while(blackjackHandValue(blackjackGame.dealer).total < 17){
    blackjackGame.dealer.push(drawBlackjackCard());
    blackjackGame.log.push("Dealer hits.");
  }
  blackjackGame.log.push("Dealer stands.");
}

function settleBlackjack(){
  if(!blackjackGame || blackjackGame.result) return;

  const p = blackjackHandValue(blackjackGame.player);
  const d = blackjackHandValue(blackjackGame.dealer);

  blackjackGame.phase = "done";

  let result = "loss";
  let payout = 0;
  let tp = 0;

  if(p.bust){
    result = "bust";
    payout = 0;
  }else if(d.bust){
    result = "win";
    payout = blackjackGame.currentStake * 2;
    tp = Math.floor(blackjackGame.currentStake / 25) * 2;
  }else if(p.blackjack && !d.blackjack){
    result = "blackjack";
    payout = Math.floor(blackjackGame.currentStake * 2.5);
    tp = Math.floor(blackjackGame.currentStake / 25) * 4;
  }else if(d.blackjack && !p.blackjack){
    result = "loss";
    payout = 0;
  }else if(p.total > d.total){
    result = "win";
    payout = blackjackGame.currentStake * 2;
    tp = Math.floor(blackjackGame.currentStake / 25) * 2;
  }else if(p.total < d.total){
    result = "loss";
    payout = 0;
  }else{
    result = "push";
    payout = blackjackGame.currentStake;
    tp = 1;
  }

  blackjackGame.result = result;
  blackjackGame.payout = payout;
  blackjackGame.tp = tp;

  state.coins += payout;
  state.trainingPoints += tp;

  if(!blackjackGame.statsRecorded){
    state.stats.blackjack.hands++;
    state.stats.blackjack.coinsReturned += payout;
    state.stats.blackjack.tpWon += tp;

    if(result === "win") state.stats.blackjack.wins++;
    if(result === "blackjack"){
      state.stats.blackjack.wins++;
      state.stats.blackjack.blackjacks++;
    }
    if(result === "loss") state.stats.blackjack.losses++;
    if(result === "bust"){
      state.stats.blackjack.losses++;
      state.stats.blackjack.busts++;
    }
    if(result === "push") state.stats.blackjack.pushes++;

    blackjackGame.statsRecorded = true;
  }

  blackjackGame.log.push(`Result: ${result.toUpperCase()}. Payout: ${payout} coins, ${tp} TP.`);
  addLog(`Card Blackjack ${result}: stake ${blackjackGame.currentStake}, payout ${payout} coins, ${tp} TP.`);
}

function closeBlackjack(){
  blackjackGame = null;
  saveGame();
  render();
}

function blackjackHandHtml(title, cards, hideFirst = false){
  const visibleCards = hideFirst ? cards.map((entry,i) => i === 0 ? null : entry) : cards;
  const value = hideFirst ? null : blackjackHandValue(cards);

  return `
    <div class="blackjack-hand">
      <div class="blackjack-hand-title">
        <h4>${title}</h4>
        <span>${value ? value.total + (value.soft ? " soft" : "") : "?"}</span>
      </div>
      <div class="blackjack-cards">
        ${visibleCards.map(entry => entry ? blackjackMiniCardHtml(entry) : `<div class="blackjack-hidden-card">?</div>`).join("")}
      </div>
    </div>
  `;
}

function blackjackMiniCardHtml(entry){
  const c = card(entry.visualId);
  const owned = state.collection[c.id] || 0;
  const preview = owned ? "" : "preview";

  return `
    <div class="blackjack-mini-card ${c.rarity} ${preview}">
      <img src="${c.realisticArt}" onerror="imageFallback(this, '${c.cardArt}')" alt="${c.name}"/>
      <div class="blackjack-value">${entry.rank}</div>
      <div class="blackjack-suit">${SPORTS[entry.sport].emoji}</div>
      <div class="blackjack-name">${c.name}${owned ? "" : " · Preview"}</div>
    </div>
  `;
}


function blackjackStatsHtml(){
  const s = state.stats.blackjack || {
    hands:0,wins:0,losses:0,pushes:0,blackjacks:0,busts:0,doubled:0,coinsWagered:0,coinsReturned:0,tpWon:0
  };

  const net = s.coinsReturned - s.coinsWagered;
  const decided = s.wins + s.losses;
  const winRate = decided ? Math.round((s.wins / decided) * 100) : 0;

  return `
    <div class="blackjack-stats-panel">
      <div class="blackjack-stats-title">
        <h3>Blackjack Stats</h3>
        <p>Tracks all Card Blackjack hands in this save.</p>
      </div>

      <div class="blackjack-stat-grid">
        <div><span>Hands</span><strong>${s.hands}</strong></div>
        <div><span>Wins</span><strong>${s.wins}</strong></div>
        <div><span>Losses</span><strong>${s.losses}</strong></div>
        <div><span>Pushes</span><strong>${s.pushes}</strong></div>
        <div><span>Win Rate</span><strong>${winRate}%</strong></div>
        <div><span>Blackjacks</span><strong>${s.blackjacks}</strong></div>
        <div><span>Busts</span><strong>${s.busts}</strong></div>
        <div><span>Doubles</span><strong>${s.doubled}</strong></div>
        <div><span>Wagered</span><strong>${s.coinsWagered}</strong></div>
        <div><span>Returned</span><strong>${s.coinsReturned}</strong></div>
        <div><span>Net Coins</span><strong class="${net >= 0 ? "positive" : "negative"}">${net >= 0 ? "+" : ""}${net}</strong></div>
        <div><span>TP Won</span><strong>${s.tpWon}</strong></div>
      </div>
    </div>
  `;
}



function blackjackPanelHtml(){
  const canPlay = ownedCards().length >= 2;
  const game = blackjackGame;
  const revealDealer = game && game.phase === "done";

  return `
    <div class="mini-game-panel blackjack-panel">
      <div class="mini-game-header">
        <h3>🃏 Card Blackjack</h3>
        <p>Uses a balanced virtual 52-card deck. Sports-card art previews any card in the catalog, owned or unowned.</p>
      </div>

      <div class="blackjack-rules">
        <div><strong>2–9</strong><span>face value</span></div>
        <div><strong>10/J/Q/K</strong><span>10</span></div>
        <div><strong>Ace</strong><span>1 / 11</span></div>
        <div><strong>Suits</strong><span>4 sports</span></div>
        <div><strong>Preview</strong><span>all cards</span></div>
      </div>

      ${!game ? `
        <div class="mini-rules">
          <strong>Cost:</strong> 1 stamina + table stake<br>
          <strong>Win:</strong> 2x stake · <strong>Blackjack:</strong> 2.5x · <strong>Push:</strong> stake returned<br>
          <strong>Double Down:</strong> pay one extra stake, draw exactly one card, then stand.
        </div>

        <div class="blackjack-stakes">
          ${[25,75,150,300].map(stake => `<button onclick="startBlackjack(${stake})" ${state.coins < stake || state.stamina < 1 || !canPlay ? "disabled" : ""}>${stake} coin table</button>`).join("")}
        </div>
      ` : `
        <div class="blackjack-table">
          <div class="blackjack-status">
            <div><span>Stake</span><strong>${game.currentStake}</strong></div>
            <div><span>Result</span><strong>${game.result || "Playing"}</strong></div>
            <div><span>Payout</span><strong>${game.payout || 0}</strong></div>
          </div>

          ${blackjackHandHtml("Dealer", game.dealer, !revealDealer)}
          ${blackjackHandHtml("Your hand", game.player, false)}

          ${game.phase === "player" ? `
            <div class="blackjack-actions">
              <button onclick="blackjackHit()">Hit</button>
              <button onclick="blackjackStand()">Stand</button>
              <button onclick="blackjackDoubleDown()" class="gold" ${game.player.length !== 2 || game.doubled || state.coins < game.stake ? "disabled" : ""}>Double Down</button>
            </div>
          ` : `
            <div class="blackjack-result-box ${game.result}">
              <strong>${game.result.toUpperCase()}</strong>
              <span>Paid ${game.payout} coins and ${game.tp || 0} TP.</span>
            </div>
            <div class="blackjack-actions">
              <button onclick="closeBlackjack()">Leave table</button>
              <button onclick="closeBlackjack(); startBlackjack(${game.stake})" class="green" ${state.coins < game.stake || state.stamina < 1 ? "disabled" : ""}>Play again</button>
            </div>
          `}

          <div class="mini-log">
            ${game.log.slice().reverse().map(x => `<div>${x}</div>`).join("")}
          </div>
        </div>
      `}
    </div>
  `;
}


function adminAddCoins(amount){
  state.coins += amount;
  saveGame();
  render();
  toast(`Admin: +${amount} coins`);
}

function adminAddTP(amount){
  state.trainingPoints += amount;
  saveGame();
  render();
  toast(`Admin: +${amount} TP`);
}

function adminMaxStamina(){
  state.maxStamina = Math.max(state.maxStamina || 100, 100);
  state.stamina = state.maxStamina;
  saveGame();
  render();
  toast("Admin: stamina maxed");
}

function adminUnlockAllCards(){
  CARDS.forEach(c => {
    state.collection[c.id] = Math.max(state.collection[c.id] || 0, 3);
  });
  state.stats.totalCards = Object.values(state.collection).reduce((a,b) => a + b, 0);
  saveGame();
  render();
  toast("Admin: all cards unlocked with 3 copies");
}

function adminResetDaily(){
  state.daily = {bonus:false,sponsor:false,drill:false,shop:false};
  saveGame();
  render();
  toast("Admin: daily flags reset");
}

function adminBoostEverything(){
  state.coins = 999999;
  state.trainingPoints = 999999;
  state.maxStamina = 999;
  state.stamina = 999;
  state.collectorXP = Math.max(state.collectorXP || 0, 20000);
  state.packUnlockOverride = true;
  adminUnlockAllCards();
}


function adminTogglePackUnlocks(){
  state.packUnlockOverride = !state.packUnlockOverride;
  saveGame();
  render();
  toast(state.packUnlockOverride ? "Admin: all packs unlocked" : "Admin: pack gates restored");
}

function adminAddCollectorXP(amount){
  addCollectorXP(amount, "admin");
  saveGame();
  render();
  toast(`Admin: +${amount} Collector XP`);
}


function adminClearCupRun(){
  state.cupSeason = null;
  saveGame();
  render();
  toast("Admin: Cup run cleared");
}


function adminAddDupesToAll(amount = 5){
  CARDS.forEach(c => {
    state.collection[c.id] = (state.collection[c.id] || 0) + amount;
  });
  saveGame();
  render();
  toast(`Admin: +${amount} copies of every card.`);
}

function adminAddDupesToLineup(amount = 5){
  if(!state.lineup.length){
    toast("No active lineup cards.");
    return;
  }

  state.lineup.forEach(id => {
    state.collection[id] = (state.collection[id] || 0) + amount;
  });

  saveGame();
  render();
  toast(`Admin: +${amount} copies of active lineup cards.`);
}

function adminAddDupesByRarity(rarity, amount = 5){
  CARDS.filter(c => c.rarity === rarity).forEach(c => {
    state.collection[c.id] = (state.collection[c.id] || 0) + amount;
  });
  saveGame();
  render();
  toast(`Admin: +${amount} copies of all ${rarity} cards.`);
}



function adminAddDraftClears(amount = 5){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  state.draft.clears = (state.draft.clears || 0) + amount;
  saveGame();
  render();
  toast(`Admin: +${amount} Draft clears.`);
}

function adminResetDraftBoard(){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  createDraftBoard();
  state.draft.lastReward = null;
  state.draft.reveal = null;
  saveGame();
  render();
  toast("Admin: Draft board reset.");
}



function adminStabilityTestSetup(){
  clearActivePackState();
  packOpening = null;
  packQueue = [];
  lastPack = [];
  state.coins = Math.max(state.coins, 2500);
  state.trainingPoints = Math.max(state.trainingPoints, 1000);
  state.maxStamina = 100;
  state.stamina = 100;
  state.packUnlockOverride = true;
  state.draft = state.draft || {clears:0, board:null, history:[], pendingPacks:[]};
  state.draft.clears = Math.max(state.draft.clears || 0, 10);
  adminResetDraftBoard();
  toast("Admin: stability test setup ready.");
}

function adminClearActivePackState(){
  clearActivePackState();
  packOpening = null;
  packQueue = [];
  lastPack = [];
  saveGame();
  render();
  toast("Admin: active pack reveal cleared.");
}


function viewAdmin(){
  return `
    <div class="section-title">
      <div>
        <h2>Admin Testing</h2>
        <p>Testing controls for development builds. These are intentionally not balanced gameplay actions.</p>
      </div>
      <span class="pill">🧪 Test Mode</span>
    </div>

    <div class="admin-grid">
      <button onclick="adminStabilityTestSetup()" class="gold">Stability test setup</button>
      <button onclick="adminClearActivePackState()">Clear active pack state</button>
      <button onclick="adminAddCoins(1000)">+1,000 coins</button>
      <button onclick="adminAddCoins(10000)">+10,000 coins</button>
      <button onclick="adminAddTP(500)">+500 TP</button>
      <button onclick="adminAddTP(5000)">+5,000 TP</button>
      <button onclick="adminMaxStamina()">Max stamina</button>
      <button onclick="adminResetDaily()">Reset daily actions</button>
      <button onclick="adminUnlockAllCards()">Unlock all cards ×3</button>
      <button onclick="adminBoostEverything()" class="gold">Unlimited test setup</button>
      <button onclick="adminTogglePackUnlocks()">${state.packUnlockOverride ? "Restore pack gates" : "Unlock all packs"}</button>
      <button onclick="adminAddCollectorXP(1000)">+1,000 Collector XP</button>
      <button onclick="adminAddDraftClears(3)">+3 Draft clears</button>
      <button onclick="adminAddDraftClears(10)">+10 Draft clears</button>
      <button onclick="adminResetDraftBoard()">Reset Draft board</button>
      <button onclick="adminAddDupesToLineup(5)">+5 dupes to active lineup</button>
      <button onclick="adminAddDupesToAll(5)">+5 dupes to every card</button>
      <button onclick="adminAddDupesToAll(10)">+10 dupes to every card</button>
      <button onclick="adminAddDupesByRarity('Epic',5)">+5 dupes to all Epics</button>
      <button onclick="adminAddDupesByRarity('Legendary',5)">+5 dupes to all Legendaries</button>
      <button onclick="adminClearCupRun()">Clear active Cup</button>
    </div>

    <div class="message">
      Current test values: ${state.coins} coins · ${state.trainingPoints} TP · ${state.stamina}/${state.maxStamina} stamina · Collector Lv ${collectorLevel()} · ${state.collectorXP} XP · ${ownedCards().length}/${CARDS.length} unique cards.
    </div>
  `;
}


function viewEarnCoins(){
  const dupes = duplicateCards();

  return `
    <div class="section-title">
      <div>
        <h2>Earn Coins</h2>
      </div>
    </div>

    <div class="earn-casino-layout">
      ${blackjackPanelHtml()}
      ${blackjackStatsHtml()}

      <div class="mini-game-panel trade-market-panel">
        <div class="mini-game-header">
          <h3>💼 Trade Market</h3>
          <p>Stake one duplicate card and choose a buyer. Safe, mystery, or high roller.</p>
        </div>

        ${!tradeMarketGame ? `
          <div class="mini-rules">
            <strong>Cost:</strong> 2 stamina + 1 duplicate card<br>
            <strong>Duplicates available:</strong> ${dupes.length}<br>
            <strong>Odds:</strong> shown before you choose
          </div>
          <button onclick="startTradeMarket()" class="gold" ${state.stamina < 2 || dupes.length < 1 ? "disabled" : ""}>Enter trade market</button>
        ` : `
          <div class="trade-stake">
            <span>Card at stake</span>
            <strong>${card(tradeMarketGame.stakeId).name}</strong>
            <small>${card(tradeMarketGame.stakeId).rarity} duplicate will be consumed when you choose.</small>
          </div>

          <div class="trade-offers">
            ${tradeMarketGame.offers.map((offer, i) => `
              <button onclick="chooseTradeOffer(${i})" class="trade-offer ${offer.risk} ${tradeMarketGame.chosen === i ? "chosen" : ""}" ${tradeMarketGame.revealed ? "disabled" : ""}>
                <span>${offer.type}</span>
                <small>${offer.odds}</small>
                ${tradeMarketGame.revealed ? `<strong>${offer.label}<br>+${offer.coins} coins · +${offer.tp} TP</strong>` : `<strong>Choose offer</strong>`}
              </button>
            `).join("")}
          </div>

          ${tradeMarketGame.revealed ? `
            <div class="trade-market-actions">
              <button onclick="closeTradeMarket()">Close market</button>
              <button onclick="tradeMarketAgain()" class="green" ${state.stamina < 2 || duplicateCards().length < 1 ? "disabled" : ""}>Trade again</button>
            </div>
          ` : `
            <button onclick="closeTradeMarket()">Back out</button>
          `}
        `}
      </div>
    </div>
  `;
}


function viewHome(){
  const pct = Math.round((state.stamina / state.maxStamina) * 100);

  const sportsSummary = Object.entries(SPORTS).map(([sport, info]) => {
    const count = ownedCards().filter(c => c.sport === sport).length;

    return `
      <div class="sport-summary" style="background:${info.color}">
        <h3>${info.emoji} ${sport}</h3>
        <p>${count}/${sportTotalCount(sport)} unique cards owned</p>
      </div>
    `;
  }).join("");

  const recent = state.log.slice(-8).reverse().map(x => `<div class="log-entry">${x}</div>`).join("");

  return `
    <div class="section-title">
      <div>
        <h2>Clubhouse</h2><div class="build-label">Core Stability Test v1</div>
        <p>Earn coins, open sport packs, complete goals, and build a 5-card lineup.</p>
      </div>

      <button onclick="nextDay()" class="dark">Start next day</button>
    </div>

    <div class="sports-row">${sportsSummary}</div>

    ${collectorProgressHtml()}

    <div class="two-col">
      <div class="box">
        <h3>Today’s stamina</h3>
        <div class="meter"><div style="width:${pct}%"></div></div>
        <p class="tiny">${state.stamina}/${state.maxStamina} stamina available</p>
      </div>

      <div class="box">
        <h3>Suggested next move</h3>
        <div class="row">
          <button onclick="go('packs')" class="gold">Open packs</button>
          <button onclick="go('lineup')">Edit lineup</button>
          <button onclick="go('match')" class="green">Play match</button>
          <button onclick="go('draft')" class="gold">Go to Draft Board</button>
        </div>
      </div>
    </div>

    <div class="economy-panel">
      <div class="section-title compact">
        <div>
          <h3>Earn More</h3>
          <p>More coin and training-point sources for upgrades and pack chasing.</p>
        </div>
      </div>
      <div class="earn-grid">
        <button onclick="claimDailyBonus()" ${state.daily.bonus ? "disabled" : ""}>🎁 Daily check-in<br><small>once/day coins + TP</small></button>
        <button onclick="claimSponsorBonus()" ${state.stamina < 2 || state.daily.sponsor ? "disabled" : ""}>📺 Sponsor showcase -2<br><small>scales with lineup</small></button>
        <button onclick="runTrainingDrill()" ${state.stamina < 3 || state.daily.drill ? "disabled" : ""}>🏋️ Training drill -3<br><small>earned TP + coins</small></button>
        <button onclick="openShopBonus()" ${state.daily.shop ? "disabled" : ""}>🛒 Shop visit<br><small>once/day small coins</small></button>
      </div>
    </div>

    <h3>Recent activity</h3>
    <div class="log">${recent}</div>
  `;
}


function suggestion(){
  if(!isPackUnlocked("pro")) return "Open Rookie Packs, build duplicates, and use TP upgrades while working toward the Pro Pack gate.";
  if(isPackUnlocked("pro") && !isPackUnlocked("star")) return "Use Pro Packs to build Rare depth, then upgrade key cards toward All-Star access.";
  if(isPackUnlocked("star") && !isPackUnlocked("hof")) return "All-Star is open. Build upgraded cards and chase Epic+ progress toward Hall of Fame.";
  if(state.coins >= PACKS.hof.cost) return "Hall of Fame Pack is unlocked. Chase the premium pulls.";
  if(state.lineup.length < 5) return "Fill your 5-card lineup.";
  return "Open packs, quick-sell extras for TP, and upgrade your best duplicate-supported cards.";
}


function viewCollection(){
  const sports = ["All", ...Object.keys(SPORTS)];
  const rarities = ["All","Common","Uncommon","Rare","Epic","Legendary"];

  const list = filteredCardsForBinder();
  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  binderPage = Math.max(0, Math.min(totalPages - 1, binderPage));

  const start = binderPage * perPage;
  const pageCards = list.slice(start, start + perPage);
  const slots = [...pageCards];

  while(slots.length < perPage){
    slots.push(null);
  }

  const ownedCount = ownedCards().length;

  return `
    <div class="section-title">
      <div>
        <h2>Collection Binder</h2>
        <p>Cards are stored in binder pockets. Locked pockets show cards you have not found yet.</p>
      </div>
      <span class="pill">🃏 ${ownedCount}/${CARDS.length} owned</span>
    </div>

    <div class="filters">
      ${sports.map(s => `<button onclick="setSportFilter('${s}')" class="${filterSport === s ? "active" : ""}">${s === "All" ? "All sports" : SPORTS[s].emoji + " " + s}</button>`).join("")}
    </div>

    <div class="filters">
      ${rarities.map(r => `<button onclick="setRarityFilter('${r}')" class="${filterRarity === r ? "active" : ""}">${r}</button>`).join("")}
    </div>

    <div class="binder-toolbar">
      <button onclick="changeBinderPage(-1)" ${binderPage <= 0 ? "disabled" : ""}>← Previous page</button>
      <div class="binder-page-label">Binder Page ${binderPage + 1} / ${totalPages}</div>
      <button onclick="changeBinderPage(1)" ${binderPage >= totalPages - 1 ? "disabled" : ""}>Next page →</button>
    </div>

    <div class="binder-spread">
      <div class="binder-left-label">COLLECTION BINDER</div>
      <div class="binder-ring"></div>
      <div class="binder-grid">
        ${slots.map(c => {
          if(!c){
            return `<div class="binder-pocket empty-pocket"><div class="empty-slot">EMPTY</div></div>`;
          }

          const owned = state.collection[c.id] || 0;
          const inLineup = state.lineup.includes(c.id);

          if(!owned){
            return `
              <div class="binder-pocket locked-pocket ${rarityClassValue(c.rarity)}">
                <div class="binder-locked" style="${sportStyle(c)}">
                  <div class="locked-question">?</div>
                  <div class="locked-meta">${SPORTS[c.sport].emoji} ${c.sport}</div>
                  <div class="locked-rarity">${c.rarity}</div>
                </div>
              </div>
            `;
          }

          return `
            <div class="binder-pocket owned-pocket ${rarityClassValue(c.rarity)}">
              <div class="binder-card-wrap">
                ${cardHtml(c, {mode:"collection", selected:inLineup})}
              </div>
              <div class="binder-card-footer">
                <span>×${owned}</span>
                <span>${inLineup ? "In lineup" : "Owned"}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div class="message">
      Click a card to inspect it. Use the page controls to flip through binder pages.
    </div>
  `;
}


function viewPacks(){
  const packBusy = !!packOpening || !!(packQueue && packQueue.length) || !!state.activePackOpening || !!((state.activePackQueue || []).length);

  const packCards = Object.entries(PACKS).map(([key,p]) => {
    const icons = {rookie:"🌱",pro:"💼",star:"⭐",hof:"🏛️"};
    const icon = icons[key] || "🎁";
    const stats = state.packStats?.[key] || {opened:0, rarePlus:0, epicPlus:0, legendary:0};
    const unlocked = isPackUnlocked(key);

    return `
      <div class="pack pack-odds-card ${unlocked ? "unlocked" : "locked"}">
        <div class="pack-title-row">
          <h3>${icon} ${p.name}</h3>
          <span>${stats.opened} opened</span>
        </div>

        <p>${p.desc}</p>
        <p><strong>${p.count} cards</strong> · <strong>${p.cost} coins</strong></p>

        ${packUnlockHtml(key)}

        <details class="pack-details" ${unlocked ? "open" : ""}>
          <summary>Odds and pity</summary>
          ${packOddsHtml(key)}
          ${packPityHtml(key)}
        </details>

        <div class="pack-mini-stats">
          <span>Rare+ ${stats.rarePlus}</span>
          <span>Epic+ ${stats.epicPlus}</span>
          <span>Legendary ${stats.legendary}</span>
        </div>

        <div class="pack-buy-row">
          <button onclick="handlePackBuy(event, '${key}', 1)" ${!unlocked || state.coins < p.cost || packBusy ? "disabled" : ""}>Buy 1</button>
          <button onclick="handlePackBuy(event, '${key}', 5)" ${!unlocked || state.coins < p.cost * 5 || packBusy ? "disabled" : ""}>Buy 5</button>
          <button onclick="handlePackBuy(event, '${key}', 10)" ${!unlocked || state.coins < p.cost * 10 || packBusy ? "disabled" : ""}>Buy 10</button>
        </div>
      </div>
    `;
  }).join("");

  const results = lastPack.length && !packOpening
    ? `<h3>Latest pack</h3><div class="grid">${lastPack.map(c => cardHtml(c)).join("")}</div>`
    : "";

  return `
    <div class="section-title">
      <div>
        <h2>Packs</h2><div class="build-label">Core Stability Test v1</div>
      </div>
    </div>

    ${collectorProgressHtml()}
    ${packOpeningHtml()}

    <div class="grid">${packCards}</div>

    <div class="pack-history-section">
      <h3>Pack History</h3>
      ${packHistoryHtml()}
    </div>

    ${results ? `<div style="margin-top:16px">${results}</div>` : ""}
  `;
}


function setLineupSort(value){
  lineupSort = value;
  render();
}

function setLineupSportFilter(value){
  lineupSportFilter = value;
  render();
}

function setLineupRarityFilter(value){
  lineupRarityFilter = value;
  render();
}

function setLineupPositionFilter(value){
  lineupPositionFilter = value;
  render();
}

function setLineupOwnedView(value){
  lineupOwnedView = value;
  render();
}

function getLineupPositions(){
  return ["All", ...Array.from(new Set(ownedCards().map(c => c.pos))).sort()];
}

function sortCardsForLineup(cards){
  const sorted = cards.slice();

  sorted.sort((a,b) => {
    if(lineupSort === "overall") return effectiveOverall(b) - effectiveOverall(a) || a.name.localeCompare(b.name);
    if(lineupSort === "off") return effectiveStat(b,'off') - effectiveStat(a,'off') || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "def") return effectiveStat(b,'def') - effectiveStat(a,'def') || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "ath") return effectiveStat(b,'ath') - effectiveStat(a,'ath') || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "iq") return effectiveStat(b,'iq') - effectiveStat(a,'iq') || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "rarity") return rarityRank(b.rarity) - rarityRank(a.rarity) || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "sport") return a.sport.localeCompare(b.sport) || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "owned") return (state.collection[b.id] || 0) - (state.collection[a.id] || 0) || effectiveOverall(b) - effectiveOverall(a);
    if(lineupSort === "name") return a.name.localeCompare(b.name);
    return effectiveOverall(b) - effectiveOverall(a);
  });

  return sorted;
}

function filterCardsForLineup(cards, section){
  let list = cards.slice();

  if(lineupSportFilter !== "All") list = list.filter(c => c.sport === lineupSportFilter);
  if(lineupRarityFilter !== "All") list = list.filter(c => c.rarity === lineupRarityFilter);
  if(lineupPositionFilter !== "All") list = list.filter(c => c.pos === lineupPositionFilter);

  if(lineupOwnedView === "Lineup") list = list.filter(c => state.lineup.includes(c.id));
  if(lineupOwnedView === "Available") list = list.filter(c => !state.lineup.includes(c.id));
  if(lineupOwnedView === "Duplicates") list = list.filter(c => (state.collection[c.id] || 0) > 1);

  return sortCardsForLineup(list);
}

function lineupStatCardHtml(c, options = {}){
  const owned = state.collection[c.id] || 0;
  const dupes = duplicateCount(c.id);
  const inLineup = state.lineup.includes(c.id);
  const eff = {
    off: effectiveStat(c,"off"),
    def: effectiveStat(c,"def"),
    ath: effectiveStat(c,"ath"),
    iq: effectiveStat(c,"iq"),
    overall: effectiveOverall(c)
  };

  const strongest = [
    ["OFF", eff.off],
    ["DEF", eff.def],
    ["ATH", eff.ath],
    ["IQ", eff.iq]
  ].sort((a,b) => b[1] - a[1])[0];

  const upCost = upgradeCost(c);
  const fCost = foilCost(c);
  const nextFoil = nextFoilTier(c.id);

  return `
    <div class="lineup-card-shell ${inLineup ? "in-lineup" : ""}">
      ${cardHtml(c, options)}
      <div class="lineup-stat-panel">
        <div class="lineup-stat-top compact-meta">
          <span>Lv ${cardLevel(c.id)} · ${foilTier(c.id)}</span>
          <span>${SPORTS[c.sport].emoji} ${c.sport}</span>
          <span>${c.rarity}</span>
          <span>Dupes x${dupes}</span>
        </div>

        <div class="lineup-ovr-row">
          <div>
            <span>OVR</span>
            <strong>${eff.overall}</strong>
          </div>
          <div>
            <span>Best</span>
            <strong>${strongest[0]} ${strongest[1]}</strong>
          </div>
        </div>

        <div class="lineup-stat-grid">
          <div><strong>${eff.off}</strong><span>Offense</span></div>
          <div><strong>${eff.def}</strong><span>Defense</span></div>
          <div><strong>${eff.ath}</strong><span>Athleticism</span></div>
          <div><strong>${eff.iq}</strong><span>Game IQ</span></div>
        </div>

        <div class="upgrade-actions">
          <button onclick="upgradeCard('${c.id}')" ${canUpgrade(c) ? "" : "disabled"}>Upgrade Lv ${cardLevel(c.id)} → ${Math.min(10, cardLevel(c.id) + 1)}</button>
          <div class="upgrade-cost">Cost: ${upCost.coins} coins · ${upCost.tp} TP · ${upCost.dupes ?? upCost.copies} dupes</div>

          <button onclick="upgradeFoil('${c.id}')" ${canFoil(c) ? "" : "disabled"}>${nextFoil ? "Make " + nextFoil + " Foil" : "Max Foil"}</button>
          <div class="upgrade-cost">${nextFoil ? `Cost: ${fCost.coins} coins · ${fCost.tp} TP · ${fCost.dupes ?? fCost.copies} dupes` : "Foil maxed"}</div>

          <button onclick="quickSellDuplicate('${c.id}')" ${dupes > 0 ? "" : "disabled"}>Quick-sell duplicate</button>
        </div>
      </div>
    </div>
  `;
}

function lineupSummaryStats(cards){
  if(!cards.length){
    return {avg:0, off:0, def:0, ath:0, iq:0};
  }

  const avg = Math.round(cards.reduce((sum,c) => sum + effectiveOverall(c), 0) / cards.length);
  const off = Math.round(cards.reduce((sum,c) => sum + effectiveStat(c,'off'), 0) / cards.length);
  const def = Math.round(cards.reduce((sum,c) => sum + effectiveStat(c,'def'), 0) / cards.length);
  const ath = Math.round(cards.reduce((sum,c) => sum + effectiveStat(c,'ath'), 0) / cards.length);
  const iq = Math.round(cards.reduce((sum,c) => sum + effectiveStat(c,'iq'), 0) / cards.length);

  return {avg, off, def, ath, iq};
}

function viewLineup(){
  const sports = ["All", ...Object.keys(SPORTS)];
  const rarities = ["All","Common","Uncommon","Rare","Epic","Legendary"];
  const positions = getLineupPositions();
  const ownedViews = ["All","Lineup","Available","Duplicates"];

  const activeLineupCards = state.lineup.map(id => card(id)).filter(Boolean);
  const filteredOwnedCards = filterCardsForLineup(ownedCards(), "all");
  const filteredLineupCards = filterCardsForLineup(activeLineupCards, "lineup");
  const filteredAvailableCards = filterCardsForLineup(ownedCards().filter(c => !state.lineup.includes(c.id)), "available");

  const summary = lineupSummaryStats(activeLineupCards);

  const lineupCardsHtml = filteredLineupCards
    .map(c => lineupStatCardHtml(c, {mode:"lineup", selected:true}))
    .join("");

  const availableCardsHtml = filteredAvailableCards
    .map(c => lineupStatCardHtml(c, {mode:"lineup-add", selected:false}))
    .join("");

  return `
    <div class="section-title">
      <div>
        <h2>My Lineup</h2>
      </div>
    </div>

    <div class="lineup-dashboard">
      <div class="lineup-summary-card">
        <span>Cards</span>
        <strong>${state.lineup.length}/5</strong>
      </div>
      <div class="lineup-summary-card">
        <span>Avg OVR</span>
        <strong>${summary.avg}</strong>
      </div>
      <div class="lineup-summary-card">
        <span>Avg OFF</span>
        <strong>${summary.off}</strong>
      </div>
      <div class="lineup-summary-card">
        <span>Avg DEF</span>
        <strong>${summary.def}</strong>
      </div>
      <div class="lineup-summary-card">
        <span>Avg ATH</span>
        <strong>${summary.ath}</strong>
      </div>
      <div class="lineup-summary-card">
        <span>Avg IQ</span>
        <strong>${summary.iq}</strong>
      </div>
    </div>

    <div class="lineup-controls">
      <div class="control-group">
        <label>Sort by</label>
        <select onchange="setLineupSort(this.value)">
          <option value="overall" ${lineupSort === "overall" ? "selected" : ""}>Overall</option>
          <option value="off" ${lineupSort === "off" ? "selected" : ""}>Offense</option>
          <option value="def" ${lineupSort === "def" ? "selected" : ""}>Defense</option>
          <option value="ath" ${lineupSort === "ath" ? "selected" : ""}>Athleticism</option>
          <option value="iq" ${lineupSort === "iq" ? "selected" : ""}>Game IQ</option>
          <option value="rarity" ${lineupSort === "rarity" ? "selected" : ""}>Rarity</option>
          <option value="sport" ${lineupSort === "sport" ? "selected" : ""}>Sport</option>
          <option value="owned" ${lineupSort === "owned" ? "selected" : ""}>Owned Count</option>
          <option value="name" ${lineupSort === "name" ? "selected" : ""}>Name</option>
        </select>
      </div>

      <div class="control-group">
        <label>View</label>
        <select onchange="setLineupOwnedView(this.value)">
          ${ownedViews.map(v => `<option value="${v}" ${lineupOwnedView === v ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>

      <div class="control-group">
        <label>Sport</label>
        <select onchange="setLineupSportFilter(this.value)">
          ${sports.map(s => `<option value="${s}" ${lineupSportFilter === s ? "selected" : ""}>${s === "All" ? "All sports" : SPORTS[s].emoji + " " + s}</option>`).join("")}
        </select>
      </div>

      <div class="control-group">
        <label>Rarity</label>
        <select onchange="setLineupRarityFilter(this.value)">
          ${rarities.map(r => `<option value="${r}" ${lineupRarityFilter === r ? "selected" : ""}>${r}</option>`).join("")}
        </select>
      </div>

      <div class="control-group">
        <label>Position</label>
        <select onchange="setLineupPositionFilter(this.value)">
          ${positions.map(p => `<option value="${p}" ${lineupPositionFilter === p ? "selected" : ""}>${p}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="lineup-filter-note">
      Showing ${filteredOwnedCards.length} owned cards after filters.
    </div>

    <h3>Active lineup ${state.lineup.length}/5</h3>
    <div class="lineup-manager-grid active-lineup-grid">
      ${lineupCardsHtml || `<div class="message">No active lineup cards match the current filters.</div>`}
    </div>

    <h3 style="margin-top:24px">Available cards</h3>
    <div class="lineup-manager-grid available-lineup-grid">
      ${availableCardsHtml || `<div class="message">No available cards match the current filters.</div>`}
    </div>
  `;
}


function matchRewardsHtml(){
  if(!matchState || !matchState.finished) return "";
  const fallbackWin = matchState.result === "win";
  const r = matchState.rewards || {
    coins:fallbackWin ? 0 : 0,
    tp:fallbackWin ? 0 : 0,
    xp:fallbackWin ? 20 : 8,
    draftClears:fallbackWin ? 3 : 1
  };

  const parts = [];

  if(r.draftClears){
    parts.push(`+${r.draftClears} Draft clear${r.draftClears === 1 ? "" : "s"}`);
  }

  if(r.coins) parts.push(`+${r.coins} coins`);
  if(r.tp) parts.push(`+${r.tp} TP`);
  if(r.xp) parts.push(`+${r.xp} XP`);

  return `
    <div class="arena-rewards-panel">
      <span>Rewards</span>
      <strong>${parts.join(" · ")}</strong>
    </div>
  `;
}


function draftRandomId(){
  return `draft_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function draftWeightedPick(entries){
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for(const item of entries){
    roll -= item.weight;
    if(roll <= 0) return item.value;
  }

  return entries[0].value;
}

function draftPackWeights(){
  const hof = isPackUnlocked("hof");
  const star = isPackUnlocked("star");
  const pro = isPackUnlocked("pro");

  if(hof){
    return [
      {value:"rookie", weight:42},
      {value:"pro", weight:25},
      {value:"star", weight:21},
      {value:"hof", weight:12}
    ];
  }

  if(star){
    return [
      {value:"rookie", weight:48},
      {value:"pro", weight:27},
      {value:"star", weight:20},
      {value:"hof", weight:5}
    ];
  }

  if(pro){
    return [
      {value:"rookie", weight:55},
      {value:"pro", weight:32},
      {value:"star", weight:10},
      {value:"hof", weight:3}
    ];
  }

  return [
    {value:"rookie", weight:65},
    {value:"pro", weight:23},
    {value:"star", weight:9},
    {value:"hof", weight:3}
  ];
}

function draftRarePlusCard(){
  const rarity = draftWeightedPick([
    {value:"Rare", weight:82},
    {value:"Epic", weight:15},
    {value:"Legendary", weight:3}
  ]);

  let pool = CARDS.filter(c => c.rarity === rarity);
  if(!pool.length) pool = CARDS.filter(c => rarityRank(c.rarity) >= 3);

  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffleDraftTiles(tiles){
  for(let i = tiles.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles;
}


function chooseDraftJackpotType(){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  state.draft.jackpotTypeHistory = state.draft.jackpotTypeHistory || [];

  const history = state.draft.jackpotTypeHistory.slice(-2);

  // Still targets 50/50 over time, but prevents repeated short-run streaks
  // like Rare+ four boards in a row during testing.
  if(history.length >= 2 && history.every(type => type === "rareplus")) return "pack";
  if(history.length >= 2 && history.every(type => type === "pack")) return "rareplus";

  return Math.random() < 0.5 ? "pack" : "rareplus";
}

function recordDraftJackpotType(type){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  state.draft.jackpotTypeHistory = state.draft.jackpotTypeHistory || [];
  state.draft.jackpotTypeHistory.push(type);
  state.draft.jackpotTypeHistory = state.draft.jackpotTypeHistory.slice(-8);
}


function repairDraftBoardState(){
  if(!state.draft) return;
  state.draft.pendingPacks = state.draft.pendingPacks || [];

  const board = state.draft.board;
  if(!board || !Array.isArray(board.tiles)) return;

  const revealedPack = board.tiles.find(t => t.revealed && t.type === "pack");
  const revealedRarePlus = board.tiles.find(t => t.revealed && t.type === "rareplus");

  // Defensive repair for older boards/builds: pack and rare+ tiles are jackpot tiles.
  // If one is already revealed but the board did not reset, reset it now so it cannot get stuck.
  if(revealedPack || revealedRarePlus){
    state.draft.lastReward = state.draft.lastReward || {
      result: revealedPack ? `${PACKS[revealedPack.packKey]?.name || "Pack"} already claimed` : "Rare+ card already claimed",
      jackpot:true,
      type: revealedPack ? "pack" : "rareplus",
      autoReset:true
    };
    createDraftBoard();
  }
}


function createDraftBoard(){
  state.draft = state.draft || {clears:0, board:null, history:[]};

  const jackpotType = chooseDraftJackpotType();
  const tiles = [];

  if(jackpotType === "pack"){
    const packKey = draftWeightedPick(draftPackWeights());
    tiles.push({
      type:"pack",
      jackpot:true,
      label:PACKS[packKey].name,
      packKey,
      revealed:false
    });
  }else{
    const c = draftRarePlusCard();
    tiles.push({
      type:"rareplus",
      jackpot:true,
      label:`${c.rarity} ${c.name}`,
      cardId:c.id,
      revealed:false
    });
  }

  for(let i = 0; i < 4; i++){
    const amount = 25 + Math.floor(Math.random() * 46);
    tiles.push({type:"coins", label:`${amount} coins`, amount, revealed:false});
  }

  for(let i = 0; i < 4; i++){
    const amount = 25 + Math.floor(Math.random() * 61);
    tiles.push({type:"tp", label:`${amount} TP`, amount, revealed:false});
  }

  for(let i = 0; i < 2; i++){
    const amount = 1 + Math.floor(Math.random() * 2);
    tiles.push({type:"stamina", label:`${amount} stamina`, amount, revealed:false});
  }

  tiles.push({type:"bonus_clear", label:"+1 clear", amount:1, revealed:false});

  while(tiles.length < 25){
    tiles.push({type:"blank", label:"Blank", revealed:false});
  }

  shuffleDraftTiles(tiles).forEach((tile, index) => tile.id = `tile_${index}`);

  state.draft.board = {
    id:draftRandomId(),
    createdDay:state.day,
    jackpotType,
    jackpotFound:false,
    revealedCount:0,
    tiles
  };

  recordDraftJackpotType(jackpotType);
}

function ensureDraftBoard(){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  if(typeof state.draft.clears !== "number") state.draft.clears = 0;
  state.draft.history = state.draft.history || [];
  if(!state.draft.board) createDraftBoard();
}

function resetDraftBoard(){
  createDraftBoard();
  state.draft.lastReward = null;
  saveGame();
  render();
  toast("New Draft board created.");
}

function draftTileIcon(tile){
  if(!tile.revealed) return "?";
  if(tile.type === "pack") return "🎁";
  if(tile.type === "rareplus") return "🃏";
  if(tile.type === "coins") return "🪙";
  if(tile.type === "tp") return "⭐";
  if(tile.type === "stamina") return "⚡";
  if(tile.type === "bonus_clear") return "🎯";
  return "—";
}


function addPendingDraftPack(packKey){
  state.draft = state.draft || {clears:0, board:null, history:[], pendingPacks:[]};
  state.draft.pendingPacks = state.draft.pendingPacks || [];
  state.draft.pendingPacks.push({
    id:`pending_pack_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    packKey,
    day:state.day
  });
}

function openDraftPackNow(packKey){
  const pack = PACKS[packKey];
  const pulled = [];
  const guarantees = pityGuaranteesForPack(packKey);

  for(let i = 0; i < pack.count; i++){
    pulled.push(randomCard(packKey).id);
  }

  const guaranteedResult = applyPackGuarantee(packKey, pulled, guarantees);
  const finalPulled = guaranteedResult.cards;

  const seenForNewFlags = {...state.collection};
  const newFlags = finalPulled.map(id => {
    const isNew = !seenForNewFlags[id];
    seenForNewFlags[id] = (seenForNewFlags[id] || 0) + 1;
    return isNew;
  });

  finalPulled.forEach(id => {
    state.collection[id] = (state.collection[id] || 0) + 1;
    state.stats.totalCards++;
  });

  updatePackPityAfterOpen(packKey, finalPulled);
  recordPackHistory(packKey, finalPulled, guaranteedResult.applied);
  state.trainingPoints += packTPReward(packKey, finalPulled);
  addCollectorXP(packXPReward(packKey, finalPulled), `${pack.name} Draft reward`);
  state.stats.packsOpened++;

  state.activePackQueue = [{
    key:packKey,
    cards:finalPulled,
    newFlags,
    guaranteeApplied:guaranteedResult.applied
  }];
  state.activePackOpening = null;
  packQueue = state.activePackQueue;
  packOpening = null;
  startNextPackFromStateQueue();
  currentView = "packs";
  saveAndRenderPackReveal();
}

function claimDraftPendingPack(index){
  state.draft = state.draft || {clears:0, board:null, history:[], pendingPacks:[]};
  state.draft.pendingPacks = state.draft.pendingPacks || [];
  const pending = state.draft.pendingPacks[index];

  if(!pending){
    toast("No pending Draft pack there.");
    return;
  }

  if(packOpening && allPackCardsFlipped()){
    finishPackReveal(false);
  }

  if(packOpening || packQueue.length){
    toast("Finish flipping the current pack first.");
    currentView = "packs";
    render();
    return;
  }

  state.draft.pendingPacks.splice(index, 1);
  openDraftPackNow(pending.packKey);
  saveGame();
  render();
}


function grantDraftPack(packKey){
  const pack = PACKS[packKey];

  if(packOpening && typeof allPackCardsFlipped === "function" && allPackCardsFlipped()){
    finishPackReveal(false);
  }

  // If a previous pack reveal is mid-reveal, save this jackpot explicitly.
  if(packOpening || packQueue.length){
    addPendingDraftPack(packKey);
    return `${pack.name} saved`;
  }

  openDraftPackNow(packKey);
  currentView = "packs";
  return `${pack.name} opened`;
}

function grantDraftReward(tile){
  if(tile.type === "blank"){
    return "Blank";
  }

  if(tile.type === "coins"){
    state.coins += tile.amount;
    return `+${tile.amount} coins`;
  }

  if(tile.type === "tp"){
    state.trainingPoints += tile.amount;
    return `+${tile.amount} TP`;
  }

  if(tile.type === "stamina"){
    state.stamina = Math.min(state.maxStamina, state.stamina + tile.amount);
    return `+${tile.amount} stamina`;
  }

  if(tile.type === "bonus_clear"){
    state.draft.clears += tile.amount;
    return `+${tile.amount} Draft clear`;
  }

  if(tile.type === "rareplus"){
    const c = card(tile.cardId);
    const isNew = !state.collection[c.id];
    state.collection[c.id] = (state.collection[c.id] || 0) + 1;
    state.stats.totalCards++;
    addCollectorXP(rarityRank(c.rarity) * 25, "Draft jackpot");
    startDraftCardReveal(c.id, isNew);
    return `${isNew ? "New " : "Duplicate "}${c.rarity} ${c.name}`;
  }

  if(tile.type === "pack"){
    return grantDraftPack(tile.packKey);
  }

  return "Reward";
}


function resetDraftBoardAfterJackpot(result, type){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  state.draft.lastReward = {
    result,
    jackpot:true,
    type,
    autoReset:true
  };
  createDraftBoard();
}


function revealDraftTile(index){
  ensureDraftBoard();

  const board = state.draft.board;
  const tile = board.tiles[index];

  if(!tile) return;
  if(tile.revealed){
    toast("That space is already cleared.");
    return;
  }

  if((state.draft.clears || 0) < 1){
    toast("No Draft clears available. Play Quick Match to earn clears.");
    return;
  }

  state.draft.clears -= 1;
  tile.revealed = true;
  board.revealedCount = board.tiles.filter(t => t.revealed).length;

  // Defensive rule: in Draft Mode, Pack and Rare+ rewards are always jackpot rewards.
  // This prevents older/stale board states from showing a pack reward without resetting.
  const forcedJackpot = !!tile.jackpot || tile.type === "pack" || tile.type === "rareplus";
  tile.jackpot = forcedJackpot;

  const result = grantDraftReward(tile);
  const viewAfterGrant = currentView;

  state.draft.history = state.draft.history || [];
  state.draft.history.unshift({
    day:state.day,
    result,
    type:tile.type,
    jackpot:forcedJackpot
  });
  state.draft.history = state.draft.history.slice(0, 10);

  addLog(`Draft Board: ${result}${forcedJackpot ? " jackpot" : ""}.`);

  if(forcedJackpot){
    board.jackpotFound = true;
    resetDraftBoardAfterJackpot(result, tile.type);
    // If a pack opened immediately, stay on Packs after the board reset.
    if(viewAfterGrant === "packs") currentView = "packs";
  }else{
    state.draft.lastReward = {
      result,
      jackpot:false,
      type:tile.type
    };
  }

  checkQuests();
  saveGame();
  render();
  toast(forcedJackpot ? `${result} jackpot. New board ready.` : result);
}

function draftRewardName(tile){
  if(!tile.revealed) return "Hidden";
  return tile.label || "Blank";
}

function draftTileHtml(tile, index){
  const cls = tile.revealed ? `revealed ${tile.type}` : "hidden";
  const jackpot = tile.revealed && (tile.jackpot || tile.type === "pack" || tile.type === "rareplus") ? "jackpot" : "";

  return `
    <button class="draft-tile ${cls} ${jackpot}" onclick="revealDraftTile(${index})" ${tile.revealed ? "disabled" : ""}>
      <span>${draftTileIcon(tile)}</span>
      <strong>${draftRewardName(tile)}</strong>
    </button>
  `;
}


function startDraftCardReveal(cardId, wasNew){
  state.draft = state.draft || {clears:0, board:null, history:[]};
  state.draft.reveal = {
    cardId,
    wasNew:!!wasNew,
    flipped:false
  };
}















function flipDraftCardReveal(){
  if(!state.draft?.reveal) return;
  state.draft.reveal.flipped = true;
  saveGame();
  render();
}

function closeDraftRevealToBoard(){
  if(!state.draft?.reveal) return;
  state.draft.reveal = null;
  currentView = "draft";
  saveGame();
  render();
}

function draftCardRevealOverlayHtml(){
  const reveal = state.draft?.reveal;
  if(!reveal) return "";

  const c = card(reveal.cardId);
  if(!c) return "";
  const flipped = reveal.flipped ? "flipped" : "";
  const panelRarity = rarityClassValue(c.rarity);

  return `
    <div class="draft-reveal-overlay">
      <div class="draft-reveal-panel ${panelRarity}">
        <div class="draft-reveal-header">
          <span>${reveal.wasNew ? "New card jackpot" : "Duplicate card jackpot"}</span>
          <button type="button" onclick="closeDraftRevealToBoard()">Back to Draft</button>
        </div>

        <div class="draft-reveal-stage ${flipped}">
          <div class="draft-reveal-card-shell ${flipped}" onclick="${reveal.flipped ? `` : `flipDraftCardReveal()`}">
            <div class="draft-reveal-card draft-card-back">
              <div class="big-card-back">
                <div class="back-orbit">🏈 🏀 ⚽ ⚾</div>
                <strong>MAJOR SPORTS</strong>
                <span>CARD COLLECTOR</span>
              </div>
            </div>
            <div class="draft-reveal-card draft-card-front">
              <img src="${c.realisticArt}" alt="${c.name}" onerror="imageFallback(this, '${c.cardArt}')"/>
            </div>
          </div>
        </div>

        <div class="draft-reveal-copy">
          ${reveal.flipped ? `
            <h3>${c.name}</h3>
            <p>${c.rarity} · ${c.sport} · ${c.pos} · ${c.team}</p>
            <div class="draft-reveal-actions">
              <button type="button" onclick="closeDraftRevealToBoard()" class="gold">Back to Draft Board</button>
            </div>
          ` : `
            <h3>Rare+ Jackpot</h3>
            <p>Tap the card to flip and reveal your reward.</p>
          `}
        </div>
      </div>
    </div>
  `;
}


function draftPendingPacksHtml(){
  const pending = state.draft?.pendingPacks || [];
  if(!pending.length) return "";

  return `
    <div class="draft-pending-packs">
      <h3>Pending Draft Packs</h3>
      <p>Claim saved Draft pack jackpots here.</p>
      <div class="draft-pending-list">
        ${pending.map((p, index) => `
          <div class="draft-pending-pack">
            <span>${PACKS[p.packKey]?.name || "Pack"} · Day ${p.day}</span>
            <button onclick="claimDraftPendingPack(${index})">Open pack</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}



function viewDraft(){
  ensureDraftBoard();

  const board = state.draft.board;
  const clears = state.draft.clears || 0;
  const allCleared = board.revealedCount >= board.tiles.length;
  const history = (state.draft.history || []).map(h => `
    <div class="draft-history-item ${h.jackpot ? "jackpot" : ""}">
      <span>Day ${h.day}</span>
      <strong>${h.result}</strong>
    </div>
  `).join("");

  const lastReward = state.draft.lastReward;
  const lastRewardHtml = lastReward ? `
    <div class="draft-last-reward ${lastReward.jackpot ? "jackpot" : ""}">
      <span>${lastReward.jackpot ? "Jackpot found" : "Last clear"}</span>
      <strong>${lastReward.result}</strong>
      ${lastReward.autoReset ? `<small>The board reset automatically so the rest of that board cannot be cleared.</small>` : ""}
    </div>
  ` : "";

  return `
    <div class="section-title">
      <div>
        <h2>Draft Board</h2>
      </div>
    </div>

    ${lastRewardHtml}

    <div class="draft-overview">
      <div class="draft-info-card">
        <h3>How it works</h3>
        <p>Quick Match costs 0 stamina. A win gives 3 clears. A loss gives 1 clear.</p>
        <p>Use all available clears before starting another Quick Match.</p>
        <p>When the jackpot is revealed, the board resets immediately. There is no manual reset.</p>
        <div class="row">
          <button onclick="go('match')" class="green" ${clears > 0 ? "disabled" : ""}>${clears > 0 ? "Use clears first" : "Play Quick Match"}</button>
        </div>
      </div>

      <div class="draft-info-card">
        <h3>Current board</h3>
        <p><strong>Status:</strong> ${board.jackpotFound ? "Jackpot found" : allCleared ? "Board cleared" : "Jackpot hidden"}</p>
        <p><strong>Spaces cleared:</strong> ${board.revealedCount}/25</p>
        <p><strong>Available clears:</strong> ${clears}</p>
      </div>
    </div>

    ${draftPendingPacksHtml()}

    <div class="draft-board">
      ${board.tiles.map((tile, index) => draftTileHtml(tile, index)).join("")}
    </div>

    <div class="pack-history-section">
      <h3>Draft History</h3>
      ${history || `<div class="message">No Draft spaces cleared yet.</div>`}
    </div>

    ${draftCardRevealOverlayHtml()}
  `;
}


function viewMatch(){
  if(matchState){
    const phase = !matchState.finished ? currentMatchPhase() : null;
    const dock = state.lineup
      .map(id => matchDockCardHtml(card(id)))
      .join("");

    const log = matchState.history.slice().reverse().map(x => `<div class="log-entry">${x}</div>`).join("");
    const last = matchState.lastBattle;
    const playerCard = last ? card(last.playerCardId) : null;
    const opponentCard = last ? card(last.opponentCardId) : null;
    const finishedClass = matchState.finished ? (matchState.result === "win" ? "match-win" : "match-loss") : "";

    return `
      <div class="quick-arena ${finishedClass}">
        <div class="arena-topbar">
          <button onclick="endMatch()" class="${matchState.finished ? "gold" : "danger"}">${matchState.finished ? "Leave" : "Forfeit"}</button>
          <div class="arena-title">
            <span>${matchState.cup ? "Collector Cup Game" : "Quick Match Arena"}</span>
            <strong>${matchState.finished ? (matchState.result === "win" ? "Victory" : "Defeat") : "Round " + matchState.round}</strong>
          </div>
          ${matchState.finished ? `<button onclick="startNextMatch(${matchState.cup ? "true" : "false"})" class="green" ${matchState.cup && state.stamina < 1 ? "disabled" : ""}>Play again</button>` : `<span class="arena-record">${matchState.you}-${matchState.them}</span>`}
        </div>

        ${phaseScheduleHtml()}

        <div class="arena-phase-callout">
          ${!matchState.finished ? `
            <div>
              <span>Current phase</span>
              <strong>${phase.icon} ${phase.label}</strong>
              <small>${phase.type === "combo" ? "Combo round: phase score is the two listed stats added together." : phase.type === "clutch" ? "Clutch round: uses effective overall." : "Single-stat round: specialists can steal these phases."}</small>
            </div>
            <div class="arena-phase-formula">
              ${phase.stats.map(s => `<b>${phaseStatLabel(s)}</b>`).join("<em>+</em>")}
            </div>
          ` : `
            <div>
              <span>Match complete</span>
              <strong>${matchState.result === "win" ? "Victory" : "Defeat"}</strong>
              ${matchRewardsHtml()}
            </div>
          `}
        </div>

        <div class="match-score-strip arena-score-strip ${finishedClass}">
          <div>
            <span>Your rounds</span>
            <strong>${matchState.you}</strong>
          </div>
          <div class="match-round-center">
            <span>${matchState.finished ? (matchState.result === "win" ? "MATCH WON" : "MATCH LOST") : (phase ? phase.short : "ROUND")}</span>
            <strong>VS</strong>
          </div>
          <div>
            <span>${matchState.opp.name}</span>
            <strong>${matchState.them}</strong>
          </div>
        </div>

        ${matchState.finished ? `<div class="arena-complete-rewards-under-score">${matchRewardsHtml()}</div>` : ""}

        <div class="battle-stage arena-battle-stage ${last ? "has-battle" : "waiting-battle"} ${finishedClass}">
          <div class="court-lines"></div>

          ${last ? `
            ${battleCardHtml(playerCard, "player", last.playerScore, last.tied ? "tie" : last.playerWon ? "win" : "loss", last.category)}
            <div class="battle-vs-core">
              <div class="category-pill">${last.category}</div>
              <div class="vs-burst">${last.tied ? "DRAW" : "VS"}</div>
              <div class="round-result">${last.tied ? "Phase draw — no point" : last.playerWon ? "You won the round" : "Opponent won the round"}</div>
              ${last.breakdown ? `<div class="battle-breakdown">Your calc: ${last.breakdown}</div>` : ""}
            </div>
            ${battleCardHtml(opponentCard, "opponent", last.opponentScore, last.tied ? "tie" : last.playerWon ? "loss" : "win", last.category)}
          ` : `
            <div class="battle-empty-state">
              <div class="floating-card-back one"></div>
              <div class="floating-card-back two"></div>
              <h3>Choose from your lineup dock</h3>
              <p>Bottom cards show OVR, all four stats, and the current phase score.</p>
            </div>
          `}
        </div>

        <div class="arena-bottom-dock-wrap">
          <div class="arena-dock-header">
            <span>Your lineup</span>
            <strong>${phase ? "Current: " + phase.short : "Match complete"}</strong>
          </div>
          <div class="arena-bottom-dock">
            ${dock}
          </div>
        </div>

        <details class="arena-log">
          <summary>Match log</summary>
          <div class="log">${log || `<div class="log-entry">The other collector shuffles their lineup.</div>`}</div>
        </details>
      </div>
    `;
  }

  return `
    <div class="section-title">
      <div>
        <h2>Quick Match</h2>
      </div>
    </div>

    <div class="match-start-panel arena-start-panel">
      <div class="match-start-copy">
        <h3>Start Quick Match Arena</h3>
        <p>Your lineup has ${state.lineup.length}/5 cards. You need at least 3.</p>
        <p>Best-of-five card battle. Costs 0 stamina and earns Draft clears.</p>
        <p>Phase schedule includes single-stat rounds, two-stat combo rounds, and an overall clutch round.</p>
        <button onclick="startMatch(false)" class="green" ${state.lineup.length < 3 ? "disabled" : ""}>Start free quick match</button>
      </div>
      <div class="match-start-preview">
        <div class="floating-card-back one"></div>
        <div class="floating-card-back two"></div>
        <div class="preview-vs">VS</div>
      </div>
    </div>
  `;
}


function cupTierConfig(tierKey){
  const configs = {
    rookie:{
      key:"rookie",
      name:"Rookie Cup",
      icon:"🌱",
      packKey:"rookie",
      stamina:2,
      prizeMinRank:2,
      difficulty:{
        floors:[290,320,345],
        caps:[390,415,440],
        offsets:[[-22,5],[-6,20],[12,38]]
      },
      rewards:{
        quarter:{coins:45,tp:120,xp:65,cards:0},
        semi:{coins:95,tp:240,xp:115,cards:1},
        runner:{coins:150,tp:360,xp:185,cards:1},
        champion:{coins:260,tp:600,xp:325,cards:2}
      }
    },
    pro:{
      key:"pro",
      name:"Pro Cup",
      icon:"💼",
      packKey:"pro",
      stamina:3,
      prizeMinRank:3,
      difficulty:{
        floors:[370,410,455],
        caps:[535,570,610],
        offsets:[[-18,8],[-4,25],[16,48]]
      },
      rewards:{
        quarter:{coins:130,tp:300,xp:150,cards:0},
        semi:{coins:260,tp:650,xp:260,cards:1},
        runner:{coins:390,tp:950,xp:400,cards:2},
        champion:{coins:600,tp:1400,xp:650,cards:3}
      }
    },
    star:{
      key:"star",
      name:"All-Star Cup",
      icon:"⭐",
      packKey:"star",
      stamina:4,
      prizeMinRank:3,
      difficulty:{
        floors:[430,480,535],
        caps:[650,700,750],
        offsets:[[-16,12],[0,32],[24,60]]
      },
      rewards:{
        quarter:{coins:225,tp:550,xp:275,cards:0},
        semi:{coins:425,tp:1050,xp:500,cards:1},
        runner:{coins:650,tp:1600,xp:750,cards:2},
        champion:{coins:1000,tp:2300,xp:1100,cards:4}
      }
    },
    hof:{
      key:"hof",
      name:"Hall of Fame Cup",
      icon:"🏛️",
      packKey:"hof",
      stamina:5,
      prizeMinRank:4,
      difficulty:{
        floors:[500,570,640],
        caps:[760,830,900],
        offsets:[[-12,18],[8,42],[34,75]]
      },
      rewards:{
        quarter:{coins:375,tp:900,xp:450,cards:0},
        semi:{coins:700,tp:1700,xp:850,cards:1},
        runner:{coins:1050,tp:2600,xp:1250,cards:2},
        champion:{coins:1650,tp:3800,xp:1800,cards:5}
      }
    }
  };

  return configs[tierKey] || configs.rookie;
}

function cupTierRequirements(tierKey){
  const cfg = cupTierConfig(tierKey);

  if(tierKey === "rookie"){
    return [
      {label:"5-card lineup", met:state.lineup.length >= 5},
      {label:`${cfg.stamina} stamina`, met:state.stamina >= cfg.stamina}
    ];
  }

  if(tierKey === "pro"){
    return [
      {label:"Pro Pack unlocked", met:isPackUnlocked("pro")},
      {label:"5-card lineup", met:state.lineup.length >= 5},
      {label:"Lineup score 320+", met:lineupScore() >= 320},
      {label:"2 cards Level 2+", met:upgradedCardsAtLevel(2) >= 2},
      {label:`${cfg.stamina} stamina`, met:state.stamina >= cfg.stamina}
    ];
  }

  if(tierKey === "star"){
    return [
      {label:"All-Star Pack unlocked", met:isPackUnlocked("star")},
      {label:"5-card lineup", met:state.lineup.length >= 5},
      {label:"Lineup score 390+", met:lineupScore() >= 390},
      {label:"5 cards Level 2+", met:upgradedCardsAtLevel(2) >= 5},
      {label:"2 cards Level 3+", met:upgradedCardsAtLevel(3) >= 2},
      {label:`${cfg.stamina} stamina`, met:state.stamina >= cfg.stamina}
    ];
  }

  return [
    {label:"Hall of Fame Pack unlocked", met:isPackUnlocked("hof")},
    {label:"5-card lineup", met:state.lineup.length >= 5},
    {label:"Lineup score 450+", met:lineupScore() >= 450},
    {label:"5 cards Level 3+", met:upgradedCardsAtLevel(3) >= 5},
    {label:"2 Bronze+ foil cards", met:foilCardsAtRank(1) >= 2},
    {label:`${cfg.stamina} stamina`, met:state.stamina >= cfg.stamina}
  ];
}

function isCupTierUnlocked(tierKey){
  return cupTierRequirements(tierKey).every(r => r.met);
}

function cupLineupSnapshot(){
  return state.lineup.slice(0, 5).map(id => {
    const c = card(id);
    return {
      id:c.id,
      name:c.name,
      sport:c.sport,
      pos:c.pos,
      rarity:c.rarity,
      level:cardLevel(c.id),
      foil:foilTier(c.id),
      off:effectiveStat(c,"off"),
      def:effectiveStat(c,"def"),
      ath:effectiveStat(c,"ath"),
      iq:effectiveStat(c,"iq"),
      ovr:effectiveOverall(c),
      art:c.realisticArt,
      fallback:c.cardArt
    };
  });
}

function cupSnapshotScore(snapshot){
  return snapshot.reduce((sum,c) => sum + c.ovr, 0);
}

function cupLineupPower(snapshot){
  const base = cupSnapshotScore(snapshot);
  const uniqueSports = new Set(snapshot.map(c => c.sport)).size;
  const levelBonus = snapshot.reduce((sum,c) => sum + Math.max(0, c.level - 1) * 4, 0);
  const foilBonus = snapshot.reduce((sum,c) => sum + foilRank(c.foil) * 7, 0);
  const rarityBonus = snapshot.reduce((sum,c) => sum + rarityRank(c.rarity) * 2, 0);
  const balanceBonus = uniqueSports >= 4 ? 20 : uniqueSports * 4;
  return base + levelBonus + foilBonus + rarityBonus + balanceBonus;
}

function clampNumber(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildCupOpponentPowers(tierKey, snapshot){
  const cfg = cupTierConfig(tierKey);
  const userPower = cupLineupPower(snapshot);
  const diff = cfg.difficulty;
  return diff.offsets.map((range, i) => {
    const raw = userPower + randomBetween(range[0], range[1]);
    return clampNumber(raw, diff.floors[i], diff.caps[i]);
  });
}

function estimatedCupRoundChance(yourPower, oppPower){
  const diff = yourPower - oppPower;
  return clampNumber(Math.round(50 + diff * 1.35), 18, 82);
}

function cupOpponentPreviewHtml(cup){
  if(!cup || !cup.opponentPowers) return "";
  const yourPower = cupLineupPower(cup.snapshot);

  return `
    <div class="cup-opponent-preview">
      <h4>Projected opponents</h4>
      <div class="cup-opponent-grid">
        ${cup.opponentPowers.map((p,i) => `
          <div>
            <span>${cupRoundLabel(i)}</span>
            <strong>${cupOpponentName(cup.tierKey, i)}</strong>
            <small>Opp power ${p} · Est. win ${estimatedCupRoundChance(yourPower, p)}%</small>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function cupTierRepeatTitles(tierKey){
  return (state.cupTierTitles && state.cupTierTitles[tierKey]) || 0;
}

function cupAdjustedReward(cfg, finishKey){
  const base = cfg.rewards[finishKey];
  const reward = {...base};
  const priorTitles = cupTierRepeatTitles(cfg.key);

  if(finishKey === "champion" && priorTitles > 0){
    const scale = cfg.key === "rookie" ? 0.45 : cfg.key === "pro" ? 0.65 : cfg.key === "star" ? 0.75 : 0.85;
    reward.coins = Math.max(25, Math.round(base.coins * scale));
    reward.tp = Math.max(75, Math.round(base.tp * scale));
    reward.xp = Math.max(50, Math.round(base.xp * scale));
    reward.cards = cfg.key === "rookie" ? 1 : Math.max(1, base.cards - 1);
    reward.repeatAdjusted = true;
    reward.originalCoins = base.coins;
    reward.originalTp = base.tp;
    reward.originalCards = base.cards;
  }

  return reward;
}


function cupOpponentName(tierKey, roundIndex){
  const names = {
    rookie:["Neighborhood Five", "Binder Shop Squad", "Rookie Road Kings"],
    pro:["Weekend Grinders", "Trade Night Elite", "Pro Binder Club"],
    star:["Regional All-Stars", "Chrome Case Crew", "National Pack Kings"],
    hof:["Legend Room", "Hall Vault Five", "Immortal Collectors"]
  };
  return (names[tierKey] || names.rookie)[roundIndex] || "Cup Opponent";
}

function cupRoundLabel(roundIndex){
  return ["Quarterfinal", "Semifinal", "Final"][roundIndex] || `Round ${roundIndex + 1}`;
}

function simulateCupRound(cup, roundIndex){
  const roundName = cupRoundLabel(roundIndex);
  const oppPower = (cup.opponentPowers && cup.opponentPowers[roundIndex]) || buildCupOpponentPowers(cup.tierKey, cup.snapshot)[roundIndex];
  const yourPower = cupLineupPower(cup.snapshot);

  const yourRoll = yourPower + randomBetween(-24, 24);
  const oppRoll = oppPower + randomBetween(-22, 28);

  let yourScore = Math.max(62, Math.round(52 + yourRoll / 7 + Math.random() * 8));
  let oppScore = Math.max(62, Math.round(52 + oppRoll / 7 + Math.random() * 8));

  if(yourScore === oppScore){
    if(yourRoll >= oppRoll) yourScore += 1;
    else oppScore += 1;
  }

  const won = yourScore > oppScore;

  return {
    round:roundName,
    opponent:cupOpponentName(cup.tierKey, roundIndex),
    yourPower,
    oppPower,
    yourScore,
    oppScore,
    margin:yourScore - oppScore,
    estimatedWin:estimatedCupRoundChance(yourPower, oppPower),
    won
  };
}

function cupFinishKey(wins){
  if(wins >= 3) return "champion";
  if(wins === 2) return "runner";
  if(wins === 1) return "semi";
  return "quarter";
}

function cupFinishLabel(key){
  return {champion:"Champion", runner:"Runner-up", semi:"Semifinalist", quarter:"Quarterfinalist"}[key] || "Finished";
}

function awardCupPrizeCards(cfg, reward, finishKey){
  const ids = [];
  const count = reward.cards || 0;
  if(count <= 0) return ids;

  for(let i = 0; i < count; i++){
    ids.push(randomCard(cfg.packKey).id);
  }

  if(finishKey === "champion" && ids.length){
    const bestRank = Math.max(...ids.map(id => rarityRank(card(id).rarity)));
    if(bestRank < cfg.prizeMinRank){
      const replacement = randomCardByMinRank(cfg.packKey, cfg.prizeMinRank);
      const replaceIndex = ids.map((id,i) => ({i,rank:rarityRank(card(id).rarity)})).sort((a,b) => a.rank - b.rank)[0].i;
      ids[replaceIndex] = replacement.id;
    }
  }

  ids.forEach(id => {
    state.collection[id] = (state.collection[id] || 0) + 1;
    state.stats.totalCards++;
  });

  state.stats.cupPrizeCards += ids.length;
  return ids;
}

function startCollectorCup(tierKey){
  if(state.cupSeason && !state.cupSeason.completed){
    toast("Finish the active Cup run first.");
    return;
  }

  const cfg = cupTierConfig(tierKey);

  if(!isCupTierUnlocked(tierKey)){
    toast(`${cfg.name} requirements not met.`);
    return;
  }

  if(state.lineup.length < 5){
    toast("Collector Cup requires a full 5-card lineup.");
    return;
  }

  state.stamina -= cfg.stamina;

  state.cupSeason = {
    tierKey,
    tierName:cfg.name,
    icon:cfg.icon,
    day:state.day,
    snapshot:cupLineupSnapshot(),
    rounds:[],
    opponentPowers:null,
    completed:false,
    finishKey:null,
    finishLabel:null,
    rewards:null,
    prizeIds:[]
  };

  state.cupSeason.opponentPowers = buildCupOpponentPowers(tierKey, state.cupSeason.snapshot);

  state.stats.cupTournaments++;
  state.stats.cupGames++;
  addCollectorXP(80, `${cfg.name} entry`);
  addLog(`Entered ${cfg.name}. Lineup snapshot locked at ${cupSnapshotScore(state.cupSeason.snapshot)} lineup score.`);
  checkQuests();
  saveGame();
  render();
  toast(`${cfg.name} lineup submitted.`);
}

function simulateCollectorCup(){
  const cup = state.cupSeason;
  if(!cup || cup.completed) return;

  const cfg = cupTierConfig(cup.tierKey);
  cup.rounds = [];
  let wins = 0;
  let losses = 0;

  for(let i = 0; i < 3; i++){
    const result = simulateCupRound(cup, i);
    cup.rounds.push(result);
    if(result.won){
      wins++;
    }else{
      losses++;
      break;
    }
  }

  const finishKey = cupFinishKey(wins);
  const reward = cupAdjustedReward(cfg, finishKey);
  const prizeIds = awardCupPrizeCards(cfg, reward, finishKey);

  state.coins += reward.coins;
  state.trainingPoints += reward.tp;
  addCollectorXP(reward.xp, `${cfg.name} ${cupFinishLabel(finishKey)}`);

  state.stats.cupWins += wins;
  state.stats.cupLosses += losses;
  if(finishKey === "champion"){
    state.stats.cupChampionships++;
    state.cupTierTitles = state.cupTierTitles || {};
    state.cupTierTitles[cup.tierKey] = (state.cupTierTitles[cup.tierKey] || 0) + 1;
  }
  if(finishKey === "runner") state.stats.cupRunnerUps++;

  cup.completed = true;
  cup.finishKey = finishKey;
  cup.finishLabel = cupFinishLabel(finishKey);
  cup.rewards = reward;
  cup.prizeIds = prizeIds;

  state.cupHistory = state.cupHistory || [];
  state.cupHistory.unshift({
    day:state.day,
    tierName:cup.tierName,
    finishLabel:cup.finishLabel,
    score:cupSnapshotScore(cup.snapshot),
    power:cupLineupPower(cup.snapshot),
    wins,
    losses,
    coins:reward.coins,
    tp:reward.tp,
    prizeIds:prizeIds,
    rounds:cup.rounds.slice(),
    repeatAdjusted:!!reward.repeatAdjusted
  });
  state.cupHistory = state.cupHistory.slice(0, 8);

  addLog(`${cup.tierName}: ${cup.finishLabel}. +${reward.coins} coins, +${reward.tp} TP${prizeIds.length ? ", +" + prizeIds.length + " prize cards" : ""}.`);
  checkQuests();
  saveGame();
  render();
  toast(`${cup.finishLabel}: +${reward.coins} coins, +${reward.tp} TP`);
}

function clearCollectorCup(){
  state.cupSeason = null;
  saveGame();
  render();
}

function cupRequirementHtml(tierKey){
  return cupTierRequirements(tierKey).map(r => `<div class="pack-lock-req ${r.met ? "met" : "missing"}"><span>${r.met ? "✓" : "•"}</span><strong>${r.label}</strong></div>`).join("");
}

function cupSnapshotHtml(snapshot){
  if(!snapshot || !snapshot.length) return "";
  return `<div class="cup-snapshot-grid">${snapshot.map(c => `
    <div class="cup-snapshot-card ${c.rarity}">
      <img src="${c.art}" onerror="imageFallback(this, '${c.fallback}')" alt="${c.name}"/>
      <div><strong>${c.name}</strong><span>${c.rarity} · Lv ${c.level} · ${c.foil}</span><small>OVR ${c.ovr} · ${SPORTS[c.sport].emoji} ${c.sport}</small></div>
    </div>
  `).join("")}</div>`;
}

function cupBracketHtml(cup){
  if(!cup || !cup.rounds || !cup.rounds.length){
    return `<div class="message">No games simulated yet. Submit your lineup, then run the Cup sim.</div>`;
  }

  return `<div class="cup-bracket">${cup.rounds.map(r => `
    <div class="cup-round ${r.won ? "won" : "lost"}">
      <span>${r.round}</span>
      <strong>${r.won ? "Win" : "Loss"} ${r.yourScore}-${r.oppScore}</strong>
      <small>vs ${r.opponent}</small>
      <em>Your power ${r.yourPower} · Opp power ${r.oppPower} · Margin ${r.margin >= 0 ? "+" : ""}${r.margin} · Est. ${r.estimatedWin}%</em>
    </div>
  `).join("")}</div>`;
}

function cupPrizeCardsHtml(ids){
  if(!ids || !ids.length) return "";
  return `<div class="cup-prize-cards"><h4>Prize cards</h4><div class="cup-prize-grid">${ids.map(id => {
    const c = card(id);
    return `<div class="cup-prize-card ${c.rarity}"><img src="${c.realisticArt}" onerror="imageFallback(this, '${c.cardArt}')" alt="${c.name}"/><strong>${c.name}</strong><span>${c.rarity}</span></div>`;
  }).join("")}</div></div>`;
}

function cupHistoryHtml(){
  const history = state.cupHistory || [];
  if(!history.length) return `<div class="message">No completed Cup runs yet.</div>`;

  return `<div class="cup-history-list">${history.map(h => {
    const finalRound = h.rounds && h.rounds.length ? h.rounds[h.rounds.length - 1] : null;
    return `
      <div class="cup-history-item">
        <span>${h.tierName} · Day ${h.day}${h.repeatAdjusted ? " · repeat reward" : ""}</span>
        <strong>${h.finishLabel} · ${h.wins}-${h.losses}</strong>
        <small>Lineup score ${h.score} · Power ${h.power} · +${h.coins} coins · +${h.tp} TP · ${h.prizeIds.length} prize cards</small>
        ${finalRound ? `<small>Last round: ${finalRound.yourScore}-${finalRound.oppScore} vs ${finalRound.opponent} · Opp power ${finalRound.oppPower} · Margin ${finalRound.margin >= 0 ? "+" : ""}${finalRound.margin}</small>` : ""}
      </div>
    `;
  }).join("")}</div>`;
}


function viewCup(){
  const active = state.cupSeason;
  const tierKeys = ["rookie","pro","star","hof"];
  const tierCards = tierKeys.map(key => {
    const cfg = cupTierConfig(key);
    const unlocked = isCupTierUnlocked(key);
    const championReward = cfg.rewards.champion;
    const priorTitles = cupTierRepeatTitles(key);
    return `
      <div class="cup-tier-card ${unlocked ? "unlocked" : "locked"}">
        <div class="cup-tier-head">
          <h3>${cfg.icon} ${cfg.name}</h3>
          <span>${cfg.stamina} stamina${priorTitles ? " · " + priorTitles + " title" + (priorTitles === 1 ? "" : "s") : ""}</span>
        </div>
        <div class="cup-reward-preview">
          <strong>Champion reward</strong>
          <span>+${championReward.coins} coins · +${championReward.tp} TP · ${championReward.cards} prize cards</span>
        </div>
        ${unlocked ? `<div class="pack-unlocked-note">Unlocked</div>` : `<div class="pack-lock-panel"><div class="pack-lock-title">🔒 Requirements</div>${cupRequirementHtml(key)}</div>`}
        <button onclick="startCollectorCup('${key}')" class="gold" ${!unlocked || (active && !active.completed) ? "disabled" : ""}>Submit lineup</button>
      </div>
    `;
  }).join("");

  return `
    <div class="section-title">
      <div>
        <h2>Collector Cup</h2><div class="build-label">Core Stability Test v1</div>
      </div>
      <span class="pill">🏆 ${state.stats.cupChampionships || 0} <small>titles</small></span>
    </div>

    ${active ? `
      <div class="cup-active-panel ${active.completed ? "completed" : "live"}">
        <div class="cup-active-header">
          <div>
            <h3>${active.icon} ${active.tierName}</h3>
            <p>Submitted Day ${active.day} · Snapshot score ${cupSnapshotScore(active.snapshot)} · Power ${cupLineupPower(active.snapshot)}</p>
          </div>
          <div class="row">
            ${!active.completed ? `<button onclick="simulateCollectorCup()" class="green">Simulate tournament</button>` : `<button onclick="clearCollectorCup()">Start another Cup</button>`}
          </div>
        </div>
        ${cupSnapshotHtml(active.snapshot)}
        ${!active.completed ? cupOpponentPreviewHtml(active) : ""}
        ${cupBracketHtml(active)}
        ${active.completed ? `<div class="cup-result-box"><h3>${active.finishLabel}</h3><p>Reward: +${active.rewards.coins} coins · +${active.rewards.tp} TP · +${active.prizeIds.length} prize cards</p>${active.repeatAdjusted ? `<small>Repeat title reward reduced for this tier.</small>` : ""}</div>${cupPrizeCardsHtml(active.prizeIds)}` : ""}
      </div>
    ` : ""}

    <div class="grid cup-tier-grid">${tierCards}</div>

    <div class="pack-history-section">
      <h3>Cup History</h3>
      ${cupHistoryHtml()}
    </div>
  `;
}


function viewQuests(){
  const qhtml = QUESTS.map(q => {
    const done = questDone(q.id);
    const claimed = state.quests[q.id] === "claimed";

    return `
      <div class="quest">
        <h3>${claimed ? "✅" : done ? "🎁" : "📌"} ${q.title}</h3>
        <p>${q.text}</p>
        <p><strong>Reward:</strong> ${q.reward} coins</p>
        <button onclick="claimQuest('${q.id}')" ${!done || claimed ? "disabled" : ""}>${claimed ? "Claimed" : done ? "Claim reward" : "Not complete"}</button>
      </div>
    `;
  }).join("");

  return `
    <div class="section-title">
      <div>
        <h2>Goals</h2>
        <p>Small objectives that pay out coins for more packs.</p>
      </div>
    </div>

    <div class="grid">${qhtml}</div>
  `;
}

function viewSettings(){
  return `
    <div class="section-title">
      <div>
        <h2>Save / Reset</h2>
        <p>The game autosaves in this browser using localStorage.</p>
      </div>
    </div>

    <div class="two-col">
      <div class="box">
        <h3>Manual save</h3>
        <p>Autosave runs after actions, but you can force a save.</p>
        <button onclick="saveGame();toast('Game saved.')">Save now</button>
      </div>

      <div class="box">
        <h3>Reset collection</h3>
        <p>This clears the local save and starts over.</p>
        <button onclick="resetGame()" class="danger">Reset game</button>
      </div>
    </div>

    <div class="message">
      <strong>Current save:</strong> Day ${state.day} · ${state.coins} coins · ${ownedCards().length}/${CARDS.length} unique · ${state.stats.matchesWon} match wins · Cup rounds ${state.stats.cupWins}-${state.stats.cupLosses} · ${state.stats.cupChampionships || 0} Cup titles.
    </div>
  `;
}

document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentView = btn.dataset.view;
    render();
  });
});




render();
