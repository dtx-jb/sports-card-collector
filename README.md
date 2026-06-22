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

## Card Stat Rebalance v1

Rebalanced card stats while preserving specialist cards.

Design rules:
- Commons should be playable early, not dead pulls.
- Lower-rarity specialists can still win single-stat Quick Match phases.
- Higher rarity now has a better overall floor and better all-around value.
- Most cards are balanced, but some are Specialists, Two-Way cards, or Boom/Bust specialists.
- Lower-rarity cards now receive stronger upgrade gains so invested Commons/Uncommons can remain useful longer.
- Higher-rarity cards are still stronger at base and better across multiple phases.

Before rebalance:
- Common: 48 cards, OVR 49.5–75.8, avg 61.3
- Uncommon: 32 cards, OVR 59.8–81.0, avg 68.5
- Rare: 24 cards, OVR 65.2–88.0, avg 76.3
- Epic: 8 cards, OVR 70.2–92.5, avg 83.3
- Legendary: 8 cards, OVR 79.8–98.2, avg 90.2

After rebalance:
- Common: 48 cards, OVR 58.8–70.5, avg 64.7
- Uncommon: 32 cards, OVR 66.2–75.5, avg 69.8
- Rare: 24 cards, OVR 73.0–83.8, avg 77.8
- Epic: 8 cards, OVR 83.0–91.0, avg 86.7
- Legendary: 8 cards, OVR 87.8–96.5, avg 93.1

Upgrade scaling:
- Common cards gain the most per level.
- Uncommon and Rare cards get strong upgrade value.
- Epic and Legendary cards gain less per level because their base stats are already high.
- Foil bonuses are stronger and apply to all stats.

## Upgrade/Admin/Card Art v2

Card art:
- Removed static OVR and stat numbers from generated SVG card artwork.
- Card art now shows identity/rarity/archetype only.
- Live upgraded stats remain in the UI stat panels, where they update correctly as cards level up.

Upgrade economy:
- Epic and Legendary cards now require coins even at early card levels.
- Epic and Legendary foil creation also requires coins at Bronze.
- Epic+ cards require fewer duplicates than lower rarities because they are harder to pull.
- Common/Rare early upgrades remain mostly TP + duplicate driven.

Admin testing:
- Added +5 dupes to active lineup.
- Added +5 dupes to every card.
- Added +10 dupes to every card.
- Added +5 dupes to all Epics.
- Added +5 dupes to all Legendaries.

## Upgrade Dupes Display Fix v3

Bug fix:
- Upgrade and foil cost labels now display the correct duplicate requirement.
- Fixed the UI showing "undefined dupes" after the upgrade economy rework.

## Upgrade Cost Logic Fix v4

Bug fix:
- Upgrade logic now works again after the duplicate-cost field rename.
- upgradeCost() and foilCost() now return both `dupes` and `copies`.
- Existing upgrade checks, button enable/disable logic, and cost displays now use the correct duplicate requirements.

## Overcap Scoring v5

Fixed upgrade value at high stats.

Problem:
- Stats capped at 99.
- Cards with 99 in a stat stopped gaining value from upgrades/foils.
- High-end specialists could become bad upgrade investments.

Change:
- Base card stats still use the normal 25-99 range.
- Upgrades and foils can now push effective stats beyond 99 up to 125.
- Match scoring, lineup score, and Cup power use the boosted effective stat.
- UI displays overcapped stats as 99+X, for example 99+4 instead of silently staying at 99.

## Overcap Whole Value v6

Display change:
- Overcapped stats now display as their full effective value.
- Example: a base 99 stat with +4 upgrade value now displays as 103 instead of 99+4.
- Scoring logic is unchanged.

## Quick Match Arena v1

Rebuilt Quick Match into a phone-first battle layout.

Added:
- Top phase banner strip.
- Center battle stage.
- Bottom sticky lineup dock.
- Each lineup card shows thumbnail, OVR, OFF, DEF, ATH, IQ, and current phase score.
- Best current option gets a gold highlight.
- New phase schedule structure:
  - 2 single-stat rounds.
  - 2 two-stat combo rounds.
  - 1 overall/clutch round.
- Combo phases include OFF+IQ, DEF+ATH, OFF+ATH, and DEF+IQ.
- Phase results now show W/L/T on the top banners.
- Active Quick Match hides the normal header/sidebar on phone to fit the arena on screen.

## Six Players + Match Rewards v1

Added 6 new custom player cards from the player creation package:
- Kaden Vail
- Jalen Arden
- Jace Hampton
- Chase Baylor
- Rafael Costa
- Avery Cole

Card art handling:
- The provided realistic JPGs were copied into `assets/realistic/`.
- Matching fallback SVGs were generated into `assets/cards/`.
- Each new card now has both `realisticArt` and `cardArt` covered.

Quick Match change:
- Match Complete now shows Victory/Defeat plus rewards.
- Removed the review sentence from the match-complete callout.
- Rewards display includes coins, Training Points, and Collector XP.

Card pool:
- Total cards increased from 120 to 126.

## Match Rewards Display Fix v2

Bug fix:
- The active Quick Match Arena template now removes the old review sentence.
- Match Complete now displays Victory/Defeat plus a visible Rewards row.
- Added a secondary rewards strip under the score as a fallback so rewards cannot be missed.

## Bug Fix Counts + Goals v1

Bug fixes:
- Clubhouse sport counts now use live card-pool totals instead of the old `/8` denominator.
- Sport totals now read from the actual card pool:
  - Football: 32
  - Basketball: 32
  - Soccer: 31
  - Baseball: 31
- Unique card count now uses owned card IDs that exist in the current card pool.
- Collect 50 unique cards and Collect 100 unique cards goals now use `uniqueOwnedCount()`.
- Top/card-pool text now supports the current 126-card pool.

## Goal Logic Hard Fix v2

Bug fix:
- Goal completion now uses one ID-driven function: `goalCompleted(goal)`.
- This bypasses the prior mismatch between `complete`, `check`, and rendered button logic.
- Collect 50 unique cards and Collect 100 unique cards now evaluate directly from `uniqueOwnedCount()`.
- Current card pool totals:
  - Total: 126
  - Football: 32
  - Basketball: 32
  - Soccer: 31
  - Baseball: 31

## Goal Actual ID Fix v3

Bug fix:
- The actual goal IDs in `cards.js` are `fifty_unique` and `hundred_unique`.
- Previous fix targeted `unique_50` and `unique_100`, so the visible goal cards stayed incomplete.
- `questDone(id)` now supports the real IDs:
  - `fifty_unique` => `uniqueOwnedCount() >= 50`
  - `hundred_unique` => `uniqueOwnedCount() >= 100`
- Save key was not changed so current test progress can carry over.

## Draft Mode Economy v1

New system:
- Quick Match no longer costs stamina.
- Quick Match win gives 3 Draft clears.
- Quick Match loss gives 1 Draft clear.
- Direct Quick Match coins/TP were removed for non-Cup Quick Matches.
- A 5x5 Draft Board was added.
- Each board has one jackpot.
- Jackpot has a 50/50 chance to be:
  - Pack Jackpot
  - Rare+ Card Jackpot

Pack Jackpot:
- Can award any pack, including locked packs.
- Better packs are rarer.
- Unlocking better pack tiers improves their Draft odds.

Rare+ Jackpot:
- Rare is most common.
- Epic is uncommon.
- Legendary is rare.

Other board spaces:
- Coins
- Training Points
- Stamina
- Bonus Draft clear
- Blanks

Save key:
- Not changed, so current testing progress should carry over.

## Draft Post-Match Flow v2

Tweaks:
- Draft now happens immediately after Quick Match.
- After a non-Cup Quick Match ends, the current view switches to Draft Board.
- Players cannot start another Quick Match while they have unused Draft clears.
- This prevents banking clears by playing match after match.
- When the jackpot is uncovered, the board resets automatically.
- A message shows the jackpot reward and explains that the board reset so remaining rewards on that board cannot be cleared.

## Draft Board Fix v3

Bug/tuning fixes:
- Hidden jackpot tiles no longer show "Jackpot?".
- Hidden jackpot tiles no longer get the jackpot CSS class until revealed.
- Removed the player-facing Manual New Board button.
- Board now resets only when the jackpot is found.
- Jackpot type still targets 50/50 Pack/Rare+, but short-streak protection prevents repeated Pack or Rare+ runs during testing.

## Draft Jackpot Reveal + Card Art Updates v1

Card art updates:
- Updated existing card data/images for: bs_star_hammer, bb_star_prime, sc_star_soleil, fb_qb_ross, bs_3b_cannon_16.
- Copied 5 realistic JPG assets from the fixed five-card package.
- Generated 0 fallback SVG assets where needed.
- No new card IDs were added; total card count is unchanged.

Draft jackpot reveal:
- Rare+ Draft jackpot now opens a face-down card reveal overlay.
- Player taps the card to flip it.
- After reveal, player can inspect the card.
- The card is still awarded immediately, but the reveal gives the reward a pack-opening style moment.

## Draft Reveal Interaction Fix v2

Bug fixes:
- Draft Rare+ reveal card no longer flips backward on hover.
- Reveal now flips only on click/tap.
- Close button now stops propagation and closes the overlay.
- Inspect button now stops propagation and opens card inspect.
- Reveal card shell no longer uses a nested button structure, which was causing unreliable click behavior.

## Draft Buttons + Admin Clears Fix v3

Bug fixes:
- Draft reveal Close/Inspect now use delegated data-action click handling.
- Buttons no longer depend on inline onclick behavior inside the overlay.
- Card shell click/tap is separated from button click/tap.
- Added pointer-event hardening for the reveal overlay.

Admin:
- Added +3 Draft clears.
- Added +10 Draft clears.
- Added Reset Draft board.

## Draft Reveal Auto Collection v4

Changed Rare+ Draft jackpot reveal:
- Removed fragile Inspect/Close overlay behavior.
- Player taps the face-down card to flip it.
- After reveal, the overlay automatically closes.
- The game jumps to Collection and opens that exact card for inspection.
- Added a Skip to card button as a backup path.

## Draft Reward Claim Fix v5

Draft Rare+ reveal:
- Reveal no longer automatically navigates to Collection.
- After flip, player chooses:
  - Back to Draft Board
  - View in Collection
- View in Collection jumps to Collection and attempts to open that exact card.

Draft pack jackpot bug:
- Pack jackpots are no longer lost if a previous pack reveal is still open.
- If a pack reveal is active, the jackpot pack is saved into Pending Draft Packs.
- Draft Board now shows pending Draft pack jackpots with an Open Pack button.
- Player must finish the current pack reveal before opening pending Draft packs.

## Pack Auto Complete + Collection Focus v6

Collection focus:
- Draft Rare+ View in Collection stores the pulled card ID.
- Collection attempts to highlight, scroll to, and inspect that exact card.

Pack reveal:
- Removed the need for Done.
- Pack reveal auto-completes once all cards are flipped.
- If a Draft pack jackpot is earned while a previous pack is fully revealed, the old reveal clears and the Draft pack opens.
- If a Draft pack jackpot is earned while a previous pack is mid-reveal, it is safely saved as a pending Draft pack.

## Draft Pack Reset + Simple Reveal v7

Fixes:
- Removed the broken View in Collection flow.
- Rare+ jackpot reveal now only offers Back to Draft Board after reveal.
- Pack jackpot now always resets the board after being selected.
- Pack jackpot now either opens immediately or is saved as a Pending Draft Pack if another pack reveal is mid-reveal.
- Fixed board getting stuck at 25/25 cleared after a pack jackpot.

## Art Batches 1-3 v1

Applied existing-card art updates from 3 player-creation batches.

Updated existing card IDs:
- bs_c_archer_03
- bb_pg_ford_06
- fb_rb_knox
- sc_st_hayes_01
- bb_c_hale_15
- bs_cf_reed_08
- bb_pg_carter
- fb_qb_frost_01
- sc_am_page_06
- bb_sf_banks
- bs_2b_wells
- bb_pf_cannon_04
- fb_te_price_04
- sc_st_mills_09
- bs_sp_fox_11

Assets copied:
- assets/realistic/bs_c_archer_03.jpg
- assets/realistic/bb_pg_ford_06.jpg
- assets/realistic/fb_rb_knox.jpg
- assets/realistic/sc_st_hayes_01.jpg
- assets/realistic/bb_c_hale_15.jpg
- assets/realistic/bs_cf_reed_08.jpg
- assets/realistic/bb_pg_carter.jpg
- assets/realistic/fb_qb_frost_01.jpg
- assets/realistic/sc_am_page_06.jpg
- assets/realistic/bb_sf_banks.jpg
- assets/realistic/bs_2b_wells.jpg
- assets/realistic/bb_pf_cannon_04.jpg
- assets/realistic/fb_te_price_04.jpg
- assets/realistic/sc_st_mills_09.jpg
- assets/realistic/bs_sp_fox_11.jpg

Validation:
- Total updates applied: 15
- Total game cards unchanged: 126
- Missing IDs: none
- Duplicate update IDs: none
- Image files copied from batch packages and validated with PIL.
- Source update files:
  - batch_1/batch_1_card_updates.json
  - batch_2/batch_2_card_updates.json
  - batch_3/batch_3_card_updates.json

## Draft Pack Jackpot Force Fix v8

Bug fix:
- Any Draft tile with type `pack` or `rareplus` is now forcibly treated as the jackpot.
- This fixes boards where a Rookie Pack appeared as a revealed reward without resetting the board.
- Pack jackpot now always either:
  - opens immediately and sends player to Packs, or
  - saves as a Pending Draft Pack if another pack reveal is mid-reveal.
- Added a repair function for old/stale board states that had a revealed pack or Rare+ tile without board reset.

## Art Batches 4-7 v1

Applied existing-card art updates from player-creation batches 4 through 7.

Updated existing card IDs:
- bs_3b_bishop_06
- bb_sf_mercer_08
- fb_lb_pierce_05
- sc_cm_maddox_10
- bs_c_santiago_13
- bs_dh_bridges_10
- bb_sg_bishop_02
- fb_wr_fox_03
- sc_cm_hunt_02
- bb_sf_sutton_13
- bs_sp_bishop_01
- bb_sg_reyes_07
- fb_cb_holloway_06
- sc_cdm_bishop_07
- bs_c_morales
- bs_ss_holloway_07
- bb_sg_miles
- fb_edge_rhodes_08
- sc_fb_valdez_08
- bs_cp_frost_12

Assets copied:
- assets/realistic/bs_3b_bishop_06.jpg
- assets/realistic/bb_sf_mercer_08.jpg
- assets/realistic/fb_lb_pierce_05.jpg
- assets/realistic/sc_cm_maddox_10.jpg
- assets/realistic/bs_c_santiago_13.jpg
- assets/realistic/bs_dh_bridges_10.jpg
- assets/realistic/bb_sg_bishop_02.jpg
- assets/realistic/fb_wr_fox_03.jpg
- assets/realistic/sc_cm_hunt_02.jpg
- assets/realistic/bb_sf_sutton_13.jpg
- assets/realistic/bs_sp_bishop_01.jpg
- assets/realistic/bb_sg_reyes_07.jpg
- assets/realistic/fb_cb_holloway_06.jpg
- assets/realistic/sc_cdm_bishop_07.jpg
- assets/realistic/bs_c_morales.jpg
- assets/realistic/bs_ss_holloway_07.jpg
- assets/realistic/bb_sg_miles.jpg
- assets/realistic/fb_edge_rhodes_08.jpg
- assets/realistic/sc_fb_valdez_08.jpg
- assets/realistic/bs_cp_frost_12.jpg

Validation:
- Total updates applied: 20
- Total game cards unchanged: 126
- Missing IDs: none
- Duplicate update IDs: none
- All images validated as 900 × 1260 RGB JPEGs.
- Source update files:
  - batch_4/batch_4_card_updates.json
  - batch_5/batch_5_card_updates.json
  - batch_6/batch_6_card_updates.json
  - batch_7/cardgame_art_batch_7_package/batch_7_card_updates.json

## Art Corrections 3 Cards v1

Applied corrected existing-card art files.

Updated existing card IDs:
- bb_sf_mercer_08
- sc_am_page_06
- bb_sf_sutton_13

Assets copied:
- assets/realistic/bb_sf_mercer_08.jpg
- assets/realistic/sc_am_page_06.jpg
- assets/realistic/bb_sf_sutton_13.jpg

Validation:
- Total corrections applied: 3
- Total game cards unchanged: 126
- Missing IDs: none
- Duplicate correction IDs: none
- All images validated as 900 × 1260 RGB JPEGs.
- Source update files:
  - cardgame_art_correction_cam_mercer_package/corrected_card_updates.json
  - cardgame_art_correction_orion_makai_package/corrected_card_updates.json

## Art Batches 8-10 v1

Applied existing-card art updates from player-creation batches 8 through 10.

Updated existing card IDs:
- bs_cp_page_02
- bb_pg_cross_01
- fb_k_mason_10
- sc_gk_barrett_05
- bs_1b_valdez_14
- bs_2b_mills_05
- bb_c_bridges_10
- fb_dt_page_09
- sc_w_cross_03
- bs_cf_reed
- bs_of_hayes_09
- bb_pf_mills_09
- fb_s_bennett_07
- sc_st_holt
- bb_pg_hayes_11

Assets copied:
- assets/realistic/bs_cp_page_02.jpg
- assets/realistic/bb_pg_cross_01.jpg
- assets/realistic/fb_k_mason_10.jpg
- assets/realistic/sc_gk_barrett_05.jpg
- assets/realistic/bs_1b_valdez_14.jpg
- assets/realistic/bs_2b_mills_05.jpg
- assets/realistic/bb_c_bridges_10.jpg
- assets/realistic/fb_dt_page_09.jpg
- assets/realistic/sc_w_cross_03.jpg
- assets/realistic/bs_cf_reed.jpg
- assets/realistic/bs_of_hayes_09.jpg
- assets/realistic/bb_pf_mills_09.jpg
- assets/realistic/fb_s_bennett_07.jpg
- assets/realistic/sc_st_holt.jpg
- assets/realistic/bb_pg_hayes_11.jpg

Validation:
- Total updates applied: 15
- Total game cards unchanged: 126
- Missing IDs: none
- Duplicate update IDs: none
- All images validated as 900 × 1260 RGB JPEGs.
- Source update files:
  - batch_8/batch_8_card_updates.json
  - batch_9/batch_9_card_updates.json
  - batch_10/batch_10_card_updates.json

## Art Batch 11 Common Completion v1

Applied final common-card art updates from player-creation batch 11.

Updated existing card IDs:
- bs_1b_rhodes_04
- bs_sp_miller
- bb_c_valdez_05
- bb_sf_rhodes_03
- fb_rb_morrow_02
- sc_cm_santos
- sc_cb_sutton_04

Assets copied:
- assets/realistic/bs_1b_rhodes_04.jpg
- assets/realistic/bs_sp_miller.jpg
- assets/realistic/bb_c_valdez_05.jpg
- assets/realistic/bb_sf_rhodes_03.jpg
- assets/realistic/fb_rb_morrow_02.jpg
- assets/realistic/sc_cm_santos.jpg
- assets/realistic/sc_cb_sutton_04.jpg

Validation:
- Total updates applied: 7
- Total game cards unchanged: 126
- Missing IDs: none
- Duplicate update IDs: none
- All images validated as 900 × 1260 RGB JPEGs.
- Source update file: batch_11_card_updates.json

## Pack Continue Flow Fix v2

Pack reveal fix:
- Reverted the broken auto-complete behavior.
- Reveal All no longer closes the pack immediately.
- One-by-one reveals no longer trap the player.
- After all cards are flipped, the player gets a clear transition button:
  - Open next pack, when queued packs remain
  - Continue, when this is the final pack
- Pack rewards are still granted immediately; the button only advances the visual reveal flow.
- Buying another pack from the reveal hub now requires the current pack to be fully flipped first.

## Buy 5 Pack Start Fix v3

Bug fix:
- Multi-pack purchase now explicitly switches to Packs and starts the first reveal immediately.
- `openPack()` now renders immediately and again on the next animation frame.
- This fixes the issue where Buy 5 created the queue but appeared to do nothing until page refresh.
- Added explicit `buyFivePacks(key)` / `buyOnePack(key)` helpers to avoid inline quantity parsing issues.
- Existing queued-pack reveal flow remains player-controlled through Open next pack / Continue.

## Pack Reveal State Persist Fix v4

Bug fix:
- Active pack reveal and pack queue are now synced into the save state.
- After Buy 5, the game starts the first reveal, saves that reveal state, and forces the Packs screen to re-render.
- Added a safety fallback: if the reveal was created but the screen did not visibly update, the page reloads once and restores the active reveal.
- Buy 1 / Buy 3 / Buy 5 now all use the same explicit `handlePackBuy(event, key, quantity)` path.

## Pack State Queue Fix v5

Bug fix:
- Pack purchases now use a state-backed queue (`state.activePackQueue`) instead of relying only on runtime variables.
- Buy 5 stores the queue in save state first, starts the first reveal from that state, then renders.
- Refresh no longer needs to be the only way to see the reveal; if the UI still fails to show it, the fallback restores from state.
- `startNextPackFromQueue()` now delegates to the state-backed queue.
- This addresses the bug where coins were spent, cards/queue existed, but the reveal did not appear until refresh.

## Core Stability Test v1

Included:
- Batch 12 existing-card art updates: bs_2b_winters_15, bb_pf_rios, fb_te_mercer_14, sc_gk_holloway_13, bb_sg_mercer_12
- Fresh build save key: majorSportsCardCollector_core_stability_test_v1
- Auto-save still works inside this build.
- Fresh game starts at 100/100 stamina for stamina testing.
- Clubhouse, Packs, My Lineup, Quick Match, Draft Board, Earn Coins, and Collector Cup UI cleanup.
- Packs now show Buy 1 / Buy 5 / Buy 10.
- Admin includes Stability test setup and Clear active pack state.

## Core Stability Test v2

Change:
- Removed the browser confirm dialog from Reset Game.
- Reset now immediately clears the current build save and starts a fresh game.
- Fresh build save key: majorSportsCardCollector_core_stability_test_v2

## Core Stability Test v3

Included:
- Batches 13-15 remaining common-card art updates.
- Fresh build save key: majorSportsCardCollector_core_stability_test_v3
- Buy 10 patch:
  - Buy 5 and Buy 10 now save the active reveal and automatically reload into the reveal screen.
  - This replaces the manual-refresh workaround.
  - Buy 1 still attempts immediate render.

## Core Stability Test v4

Change:
- Re-applied corrected Batch 13 art package.
- Updated existing Batch 13 card IDs: bb_pf_barrett_14, bb_pg_cross_16, fb_lb_crowe, fb_wr_blaze, sc_cb_ward
- Fresh build save key: majorSportsCardCollector_core_stability_test_v4
- Normalized corrected art files to 900x1260 where needed: none

## Core Stability Test v5

Change:
- Replaced `bb_pf_barrett_14` art with the user-provided corrected Reid Barrett image.
- Source image normalized from (1054, 1492) RGBA to 900x1260 RGB JPEG.
- Fresh build save key: majorSportsCardCollector_core_stability_test_v5

## Core Stability Test v6

Collection cleanup:
- Removed Collection tab top owned counter.
- Removed level/foil and card-count overlays from Collection thumbnails.
- Moved level/foil/count info below the lineup action button in the binder pocket footer.
- Disabled inspect-card tilt handlers on touch/coarse-pointer devices so mobile scrolling works normally.
- Fresh build save key: majorSportsCardCollector_core_stability_test_v6

## Core Stability Test v7

Collection cleanup:
- Removed the redundant Owned / In lineup status pill from Collection binder cards.
- Binder card metadata now only shows level/foil and owned count.
- Fresh build save key: majorSportsCardCollector_core_stability_test_v7

## Core Stability Test v8

Rare-card art update applied for batches 16-19 plus Marco Price update.
Fresh save key: majorSportsCardCollector_core_stability_test_v8
Card count remained 126.
Updated IDs by package:
{
  "cardgame_art_batch_16_package": [
    "bs_dh_price_20",
    "bb_pg_lynch",
    "fb_edge_sterling_18",
    "sc_st_mason_17",
    "bs_cf_sterling_18",
    "bb_sg_santiago_17"
  ],
  "cardgame_art_batch_17_package_corrected": [
    "bs_1b_bishop",
    "bs_cp_frost",
    "bs_ss_hawkins_17",
    "bs_of_hayes_19",
    "bb_pf_santiago_19",
    "bb_sf_ellis_18"
  ],
  "cardgame_art_batch_18_package": [
    "bb_c_reed_20",
    "bb_c_okoro",
    "fb_qb_stone",
    "fb_s_hayes",
    "fb_dt_cross_19",
    "fb_k_west_20"
  ],
  "cardgame_art_batch_19_package": [
    "fb_s_price_17",
    "sc_w_barrett_19",
    "sc_am_silva",
    "sc_cb_winters_20",
    "sc_gk_ito"
  ],
  "cardgame_art_marco_price_update_package": [
    "sc_cm_price_18"
  ]
}
Normalized files:
[]

## Core Stability Test v9

Epic-card art update applied for batches 20-23.
Fresh save key: majorSportsCardCollector_core_stability_test_v9
Card count remained 126.
Updated IDs by package:
{
  "cardgame_art_batch_20_package": [
    "bs_ss_torres",
    "bs_sp_frost_21"
  ],
  "cardgame_art_batch_21_package": [
    "bb_pg_hunt_21",
    "bb_sg_nova"
  ],
  "cardgame_art_batch_22_package": [
    "fb_qb_ford_21",
    "fb_edge_vega"
  ],
  "cardgame_art_batch_23_package": [
    "sc_st_moreau",
    "sc_gk_hawkins_21"
  ]
}
Normalized files:
[]
