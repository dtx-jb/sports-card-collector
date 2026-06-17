# Major Sports Card Collector

A browser-playable sports card collecting prototype.

## How to play

Open `index.html` in a browser.

## Project structure

```text
SportsCardCollectorWeb/
  index.html
  css/
    styles.css
  js/
    cards.js
    game.js
  assets/
    players/
      generated fictional athlete SVG art
    packs/
      foil-pack.svg
    ui/
      card-back.svg
```

## What changed from the single-file version

- HTML, CSS, JavaScript, card data, and image assets are separated.
- Player art is now external SVG assets in `assets/players/`.
- Pack/card-back art is externalized.
- The game is easier to edit and expand.

## Important notes

- All athletes and teams are fictional.
- No real player likenesses are used.
- Save data uses browser `localStorage`.
- This is still a static web project, so it can run offline after download.


## New realistic card direction

The project now includes `assets/cards/`, where each athlete has a full-card SVG asset. The designs are inspired by modern card products:

- base cards
- chrome-style cards
- pulse/neon inserts
- signature cards
- patch cards
- graffiti/hype inserts
- legendary gold/foil inserts

To make the cards even more realistic later, replace the SVGs in `assets/cards/` with PNG/JPG art generated externally or designed in an image editor. Keep the same filenames and the game will continue to work.

## Fix notes

- Fixed a JavaScript syntax error that caused the app panel to render blank and disabled menu interaction.
- Dark mode is now the default theme.

## Realistic human art

The current generated SVGs are not photo-real. To get realistic humans, replace or add images in:

```text
assets/realistic/
```

Use the filenames listed in `assets/realistic/PROMPTS.json`, for example:

```text
assets/realistic/fb_edge_vega.jpg
```

The game will automatically try the realistic JPG first. If it is missing, it falls back to the generated SVG card.

## Inspect mode

Click/tap any owned card to inspect it. In inspect mode:

- move your pointer over the card to tilt it
- the holographic shine follows the pointer
- flip the card to view the stat back

## Inspect flip fix

The inspect view no longer uses a mirrored 3D backside for stats. It now switches to a readable stat-back view with:

- Offense
- Defense
- Athleticism
- Game IQ
- OVR
- rarity, team, position, and description

## Card image sizing fix

Realistic card images should be generated as a single portrait card image, not as a 2x2 sheet.

Recommended size:

```text
900 × 1260 px
```

The four visual test images have been normalized into that ratio so they no longer crop out of frame.

## Safe-margin card art fix

The four test cards were recropped with more safe margin and the CSS now forces realistic card art to display with `object-fit: contain`. This prevents cutting off:

- card corners
- rookie badges
- player names
- team names
- logos

## Pack Opening v2 + Binder View v1

Added:

- binder-style collection page with pockets, locked slots, and page controls
- enhanced pack-opening scene
- animated foil pack presentation
- dealt face-down card reveal
- rarity-based reveal glow
- Rare/Epic/Legendary pull banners
- best-pull callout after all cards are revealed

## Binder force-fix

The previous ZIP did not visibly replace the old collection screen. This build force-replaces the Collection view with a red binder spread, binder pockets, page controls, locked pockets, and owned-card pockets.

## Quick Match v2

Added:

- persistent quick match win/loss tracking
- record display in the top stats bar and Quick Match screen
- Play Again button after a finished match
- visual battle stage showing your selected card versus the opponent card
- score comparison for the chosen category
- winner/loser visual effects

## Lineup Manager v2

Added to My Lineup:

- sort by Overall
- sort by Offense
- sort by Defense
- sort by Athleticism
- sort by Game IQ
- sort by Rarity
- sort by Sport
- sort by Owned Count
- filter by sport
- filter by rarity
- filter by position
- view only lineup, available cards, or duplicates
- visible stat panel for every card
- lineup summary averages

## Duplicate / Upgrade System v1

Added:

- Training Points currency
- card levels
- duplicate-copy upgrade costs
- foil tiers: Base, Bronze, Silver, Gold, Holo
- quick-sell duplicate cards
- effective stats used in lineup score and quick matches
- daily bonus
- sponsor task
- training drill
- free shop bonus
- more coin and TP sources to support pack opening and upgrades

## Economy Rebalance + Multi-Pack Flow

Changed:

- Earn More actions are now limited and stamina-based instead of unlimited free clicks.
- Daily check-in is once per day.
- Sponsor showcase costs stamina and scales with lineup score.
- Training drill costs more stamina and rewards more Training Points.
- Shop visit is small and once per day.
- Pack screen now supports Buy 1 / Buy 3 / Buy 5.
- After revealing a pack, you can open the next queued pack or buy/open the same pack again.

## Quick Match Phase Strategy

Changed Quick Match from hidden random categories to a visible 5-round phase schedule.

- Players can see upcoming phases before choosing cards.
- Current phase is highlighted.
- Card play buttons show that card's score for the current phase.
- Match scoring uses the visible phase, not a hidden random category.
- This makes lineup building and card choice more strategic.

## Pack Reveal Hub

Added pack-opening controls directly to the reveal screen after all cards are flipped:

- Open the same pack again
- Pick any pack tier from the reveal screen
- Buy 1 / Buy 3 / Buy 5 from the reveal screen
- No need to leave the reveal view and return to the pack list

## Clean Save Build

This version uses a new browser save key:

```text
majorSportsCardCollector_pack_reveal_hub_clean_v3
```

That prevents older localStorage saves from hiding or conflicting with the newest pack-reveal flow. The Clubhouse and Packs screen show a visible build label: `Pack Reveal Hub Clean Build v3`.

## Force Pack Reveal Hub v4

Replaced the pack reveal template directly. After all cards are flipped, the reveal screen now displays:

- Open another same pack
- A visible pack picker
- Buy 1 / Buy 3 / Buy 5 for every pack tier

This build also uses a new save key: `majorSportsCardCollector_pack_hub_force_v4`.

## Match Tie Fix + Overtime v5

- Exact equal scores are now draws, not user wins.
- Drawn phases award no point.
- Drawn phases still consume the selected card.
- If regulation ends tied, the match enters sudden-death overtime.
- Overtime uses Overall and refreshes all lineup cards.
- If overtime ties, another overtime round starts.

## Mini Games v1

Added Earn Coins tab with two stamina-gated in-game mini games:

- Stat Battle Ladder: pick the better card for the shown stat phase, cash out anytime, wrong answers reduce the bank.
- Trade Market: stake one duplicate card and pick between Safe Buyer, Mystery Broker, and High Roller offers with visible odds.

These use only in-game coins/Training Points and have no real-money mechanics.

## Lineup UI Cleanup v2

Updated My Lineup layout:
- Active lineup cards stay compact and do not stretch when only one card is selected.
- Active lineup stays in one row of five cards.
- Available cards use compact fixed sizing.
- Active lineup stat panels are denser so five cards fit better.

## Inspect Card Back v2

Updated the card inspection stat-back:

- Removed the redundant stat bars that were getting cut off.
- Added Variant, Foil Tier, Card Level, Duplicate count, Serial/Set info, and Upgrade Status.
- Kept the stat tiles at the top for quick Offense/Defense/Athleticism/Game IQ reading.
- Added a collector note section at the bottom.

## Card Click Behavior v3

Changed card-click defaults by screen:

- My Lineup active card click = remove from lineup.
- My Lineup available card click = add to lineup.
- Quick Match card click = play that card.
- Collection card click = inspect card.
- Pack reveal: first click flips card; clicking an already revealed card opens inspect.
- The small action buttons remain as backup controls.

## Blackjack + Admin v1

Added:
- Card Blackjack using owned cards as the deck.
- Rarity-based blackjack values.
- Legendary cards behave like Aces, 1 or 11.
- Hit, Stand, and Double Down.
- No Split yet.
- Stake tables: 25, 75, 150, and 300 coins.
- Admin testing tab for coins, TP, stamina, daily reset, and unlock-all.

## Admin Nav Fix v2

Fixed the Admin tab not appearing in the sidebar.

- Admin button is now inserted directly into the sidebar.
- Added a fallback Admin testing tools button on the Clubhouse screen.
- Admin view includes coins, TP, stamina, daily reset, unlock-all, and unlimited test setup.

## Blackjack Balance v2

Rebalanced blackjack card values.

Problem:
- Old values made Common cards 2-6 and Uncommon cards 7-8.
- Early collections are mostly Common/Uncommon.
- That created a low-value-heavy deck where the dealer could draw 6-7 cards without busting too often.

New values:
- Common: 4-10
- Uncommon: 5-10
- Rare: 7-10
- Epic: 10
- Legendary: 1/11

Values now use card OVR plus a deterministic card seed, so the deck has more bust pressure and blackjack behaves closer to expected.

## Virtual Blackjack v3

Changed blackjack so the user's collection no longer controls the blackjack math.

- Blackjack now uses a balanced virtual 52-card deck.
- Football, Basketball, Soccer, and Baseball act like suits.
- Ranks are 2-10, J, Q, K, A.
- 10/J/Q/K count as 10.
- A counts as 1 or 11.
- Displayed sports-card art can preview any catalog card, owned or unowned.
- Unowned preview cards are labeled in the blackjack hand.
- This makes blackjack odds more normal and uses the casino game to tease cards the player may want to pull later.

## Earn Coins Cleanup v4

Updated Earn Coins:

- Removed Stat Battle Ladder from the Earn Coins screen.
- Trade Market now has a Trade Again button after resolving a trade.
- Added Blackjack Stats:
  - hands
  - wins
  - losses
  - pushes
  - win rate
  - blackjacks
  - busts
  - double downs
  - coins wagered
  - coins returned
  - net coins
  - TP won

## Pack Odds + Pity v1

Added to Packs:

- Visible rarity odds for every pack.
- Per-pack pity meters.
- Guaranteed Rare+ after dry streaks.
- Guaranteed Epic+ after longer dry streaks.
- Guaranteed Legendary for All-Star Pack after a long dry streak.
- Pack-specific pull stats.
- Pack history with best pull and pity-hit labels.
- Pity guarantee note during pack reveal.

Pity thresholds:
- Rookie Pack: Rare+ every 8 packs.
- Pro Pack: Rare+ every 5, Epic+ every 14.
- All-Star Pack: Rare+ every 3, Epic+ every 8, Legendary every 30.
- Sport Packs: Rare+ every 5, Epic+ every 15.

## Pack Pity Tuning v2

Clarified and retuned pity.

Important rule:
- Pity is a dry-streak counter, not a lifetime-opened counter.
- If you pull the target rarity naturally, that pity meter resets.

Updated thresholds:
- Rookie Pack: Rare+ after 15 dry packs.
- Pro Pack: Rare+ after 10 dry packs, Epic+ after 35 dry packs.
- All-Star Pack: Rare+ after 8 dry packs, Epic+ after 25 dry packs, Legendary after 75 dry packs.
- Sport Packs: Rare+ after 12 dry packs, Epic+ after 40 dry packs.

UI changes:
- Pity meters now show dry streak as x/y.
- Helper text explains how many more dry packs are needed.
- Pack page includes an explainer that natural hits reset the relevant pity meter.

## Pack Progression Gates v1

Added Collector XP, Collector Level, locked pack tiers, higher premium-pack requirements, tiny jackpot odds in every pack, and an Admin pack-gate override.

Pack prices: Rookie 45, Sport 120, Pro 150, All-Star 450.

Unlocks:
- Rookie: unlocked immediately.
- Sport Packs: Collector Level 4, 25 total packs opened, 12 unique cards.
- Pro Pack: Collector Level 7, 75 total packs opened, 22 unique cards, 4 Rare+ cards, 10 Quick Match wins, lineup score 320+.
- All-Star Pack: Collector Level 12, 175 total packs opened, 30 unique cards, 10 Rare+ cards, 4 Epic+ cards, 30 Quick Match wins, 1 Collector Cup win, lineup score 410+.

Dream odds:
- Rookie: Rare 3.75%, Epic 0.24%, Legendary 0.01%.
- Sport: Rare 9.5%, Epic 1.4%, Legendary 0.1%.
- Pro: Rare 20%, Epic 4.5%, Legendary 0.5%.
- All-Star: Rare 32%, Epic 15%, Legendary 3%.

## Pack Ladder + Upgrade Economy v1

Changed the pack ladder:
- Removed individual sport packs until the card pool is larger.
- Pack path is now Rookie Pack > Pro Pack > All-Star Pack > Hall of Fame Pack.
- Pro Pack now uses the previous sport-pack style odds but without sport targeting.
- All-Star Pack now uses the previous Pro Pack odds.
- Hall of Fame Pack uses the previous All-Star Pack odds.

Pack prices:
- Rookie: 45 coins, 3 cards.
- Pro: 90 coins, 4 cards.
- All-Star: 190 coins, 4 cards.
- Hall of Fame: 475 coins, 5 cards.

Unlock gates:
- Pro Pack: 85 packs opened, Collector Level 7, 22 unique cards, 10 Quick Match wins.
- All-Star Pack: 175 packs opened, Collector Level 12, 30 unique cards, 8 Rare+ cards, 25 Quick Match wins, 3 upgraded cards, 1 card at Level 3+.
- Hall of Fame Pack: 350 packs opened, Collector Level 18, 31 unique cards, 15 Rare+ cards, 5 Epic+ cards, 60 Quick Match wins, 5 cards at Level 3+, 2 Bronze+ foils, lineup score 430+.

Upgrade economy:
- Card level and foil costs now depend strongly on base rarity.
- Early card levels cost TP + duplicates only.
- Bronze foil costs TP + duplicates only.
- Coin costs are introduced at higher levels/foil tiers and scale by rarity.
- Added TP rewards to pack opening, Quick Match, quests, duplicate quick-sell, Trade Market, daily actions, and Cup results.


## Collector Cup Season Sim v1

Reworked Collector Cup so it no longer plays like Quick Match.

Core changes:
- Collector Cup now uses a snapshot-locked lineup submission.
- Cards remain usable in Quick Match and normal lineup management.
- Later upgrades do not affect an active Cup run.
- Cup is simulated as a 3-round tournament: Quarterfinal, Semifinal, Final.
- Results are based on lineup score, rarity depth, card levels, foils, sport balance, and controlled randomness.
- Added Cup tiers: Rookie Cup, Pro Cup, All-Star Cup, Hall of Fame Cup.
- Rewards are much larger than Quick Match and include coins, TP, Collector XP, and prize cards.
- Added Cup history and admin clear-cup control.

## Cup Difficulty + Rewards v2

Collector Cup tuning:

- Replaced fixed CPU powers with dynamic opponent scaling.
- Opponents are generated from the submitted snapshot lineup at entry.
- Quarterfinal is slightly easier, semifinal is closer, final is usually above the user's power.
- Each tier still has floor and cap values so weak lineups cannot cheese higher Cups.
- Active Cup screen now shows projected opponent powers and estimated win chances before sim.
- Cup history now shows power, last-round opponent power, and score margin.
- Repeat Cup title rewards are reduced to prevent Rookie Cup farming.
- First title in a tier still gives the stronger reward.


## Pack Heat Reveal v1

Added pack-opening heat feedback:

- Pack-level heat while the foil pack is still sealed.
- Stronger pack glow/shake/fire when the pack contains Rare+ heat.
- Best card in the pack shakes while face down.
- Flip All now reveals non-hit cards first when there is a Rare+ hit.
- The final hidden heat card is revealed with Reveal Big Pull.
- New cards get a NEW flare only the first time the user owns that card.
- Duplicates get a DUPLICATE flare instead of NEW.
- Rare, Epic, and Legendary pulls have stronger glow/burst effects.
- The best-pull summary now shows whether the main hit was NEW or DUPLICATE.

## Pack Reveal Polish v2

Polished the pack reveal based on playtest feedback:

- Removed word-based HEAT labels from packs and cards.
- Multiple Rare+ cards now all get face-down visual effects instead of only the single best card.
- Flip All now reveals normal cards first, then reveals all remaining big pulls.
- Removed duplicate tags from revealed cards.
- NEW flare appears only for first-time pulls.
- Pack art is now portrait-oriented to match the card orientation.
- Added CSS-based portrait pack designs for Rookie, Pro, All-Star, and Hall of Fame packs.

## Card Pool + Mobile UI v1

Added a larger test card pool and phone-focused layout updates.

Card pool:
- Previous pool: 32 cards.
- New pool: 120 cards.
- Added 88 new basic-art cards.
- Each sport now has 30 total cards.
- New players use lightweight SVG/basic card art, not realistic art.

Updated progression gates for larger collection:
- Pro Pack now requires 35 unique cards.
- All-Star Pack now requires 55 unique cards.
- Hall of Fame Pack now requires 75 unique cards.

Mobile/iPhone UI:
- Added iPhone-safe viewport/meta tags.
- Bottom sticky mobile nav.
- Horizontally scrollable stat bar.
- Smaller mobile card grids.
- Better touch target sizing.
- Pack reveal and lineup screens adjusted for narrow screens.
- Added safe-area padding for iPhone home indicator.
