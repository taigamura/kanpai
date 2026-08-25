# カンパイ！ Build Roadmap

## Phase 0 — Scaffold ✅ (this commit)
- Expo + TS project matching the nibble/EAS conventions.
- App shell: providers, minimal router, age gate, home grid, roster, settings.
- 6 game screens (4 playable, キングスカップ basic, 匿名アンケート wired stub).
- Content data: 山手線 themes, 匿名アンケート questions, default 罰ゲーム.
- Safeguards wired: 飲む-or-罰ゲーム, responsible-drinking notice, age gate + EULA link.

## Phase 1 — Design alignment ⬅️ NEXT (before more UI)
- Visual mockups of every screen for sign-off (palette, type, tiles, game screens).
- Lock the look, then restyle the scaffold to match. Do NOT polish UI before this.

## Phase 2 — Finish the games
- 匿名アンケート: pass-around SECRET voting (tap-to-hide, per-player pick, tally reveal).
- チンチロ: multi-player turn order + role comparison to decide the loser.
- キングスカップ: card-back animation, drawn-card tracking, 4th-K cup mechanic.
- 山手線: optional rhythm/beat + timer.

## Phase 3 — Monetization + telemetry
- AdMob integration (`react-native-google-mobile-ads`), interstitial between games only.
  - Requires: iOS/Android AdMob app IDs, config plugin, ATT prompt, privacy manifest.
- ¥370 remove-ads 買い切り via StoreKit/RevenueCat; persist entitlement; restore purchases.
- Apple App Analytics (no SDK) + a crash reporter.

## Phase 4 — Ship prep
- ✅ App icon + favicon generated (`npm run icon` → scripts/generate-icon.mjs). PLACEHOLDER
  clinking-mugs art in the brand palette; replace with a designed icon before serious launch.
- ✅ Name verified available (see SPEC §9). Listing title: カンパイ！飲み会・宅飲みパーティーゲーム.
- App Store: 17+ rating, alcohol reference; JP screenshots; keyword subtitle.
- Terms/EULA hosted page (replace example.com placeholder links).
- JP copy proofread; no em dashes in user-facing text.
- Consider a dedicated splash image (currently reuses icon.png).

## v2 (post-launch)
- 王様ゲーム + spice tiers (マイルド / ノーマル / ハード) + 下ネタ packs = the paid upgrade.
- Full content editors (お題 / rules / themes).
- Consider per-scene tone switcher (合コン / 宅飲み / 会社 / カップル / 女子会).

## Known placeholders to replace
- `assets/` — no icon/splash yet.
- `app.json` → `extra.eas.projectId` empty (set on first EAS build).
- Terms URL `https://example.com/kanpai/terms` (AgeGate + Settings).
- AdMob + StoreKit not yet installed (kept out of scaffold so it installs/builds clean).
