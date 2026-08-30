# カンパイ！ Build Roadmap

> **Taking over a session?** Read **[docs/STATE.md](./STATE.md)** first — it has the current
> status (live on TestFlight), all ids/config, the ship pipeline, the Xcode-26 build fix, and
> what's left before public launch.


## Phase 0 — Scaffold ✅ (this commit)
- Expo + TS project matching the nibble/EAS conventions.
- App shell: providers, minimal router, age gate, home grid, roster, settings.
- 6 game screens (4 playable, キングスカップ basic, 匿名アンケート wired stub).
- Content data: 山手線 themes, 匿名アンケート questions, default 罰ゲーム.
- Safeguards wired: 飲む-or-罰ゲーム, responsible-drinking notice, age gate + EULA link.

## Phase 1 — Design alignment ✅ DONE
- ✅ Mockups of every v1 screen (12 screens) for sign-off: docs/design-mockups.html.
  Signed off 2026-08-26.
- ✅ Scaffold restyled to match: Dela Gothic One display + Zen Kaku Gothic New body
  fonts loaded via @expo-google-fonts (App.tsx useFonts gate). New shared primitives in
  src/components/ui.tsx (T display/black props, Pill, PlayingCard) + src/components/Screen.tsx
  (glow ground: LinearGradient + red/gold radial-approx blobs). Every screen + game restyled:
  horizontal gradient-bordered home tiles, playing-card faces (高低/キングスカップ),
  gold 罰ゲーム pills, display-face titles/お題/results.
- ✅ Emoji removed for Apple-clean design (mirrors nibble-app): centralized semantic
  src/components/Icon.tsx wrapping Ionicons + MaterialCommunityIcons behind app names
  (game-*, settings, info, bomb, beer, die-1..6, etc.). Only ♠♥♦♣ card suits and ✕ remain
  (typographic). Button gained an optional `icon` prop.

## Phase 2 — Finish the games ✅ DONE
- ✅ 匿名アンケート: pass-around SECRET voting (handoff cover → per-player ballot → tally
  reveal), secrecy enforced by the cover screen between voters.
- ✅ チンチロ: multi-player turn order + role comparison to decide the loser (unit-tested).
- ✅ キングスカップ: real 52-card deck (no repeats), rank→rule, deck + K counter shown.
  Center-cup mechanic: each K drawn = pour some of your drink into a center cup; the 4th K
  drinks it. Opens with a one-page setup check (needs a physical cup). NOTE: KingsCup is the
  one game that still involves 飲む (per 2026-08-27 decision) — every OTHER game's loss is a
  罰ゲーム only (no 飲む, no ノンアルOK wording anywhere).
- ✅ 山手線: draw a theme, answer verbally in turn, loser → 罰ゲーム. (Countdown timer was
  built then removed 2026-08-28 — the game is purely verbal, no timer needed.)

## Phase 2.5 — Roster expansion ✅ (2026-08-30)
- ✅ **英語禁止** + **意思疎通** added → 8 games. Both pass-around,
  roster-based point games; loser does 罰ゲーム (shared PenaltyReveal). Its loser algorithm is
  unit-tested (`src/games/numberLineScore.ts`). RosterScreen now respects per-game `minPlayers`. Built,
  `tsc`/`jest` green, web bundles clean; NOT yet device-tested on TestFlight.

## Phase 3 — Monetization + telemetry
- ✅ AdMob wired (`react-native-google-mobile-ads`): interstitial only between games
  (src/ads/ads.ts), frequency-capped (`SHOW_EVERY = 3`), skipped for owners, guarded to no-op
  without the native module. ATT requested on launch (App.tsx). Config plugin added to app.json.
  - ✅ **Preload-and-cache refactor (2026-08-29):** interstitials are now preloaded at startup and
    after each close, then shown from cache instantly when the cap is hit. Replaces the old
    on-demand-load-and-race (which dropped any fill slower than 6s — the "ads don't show" cause).
    `__DEV__` logs each decision as `[kanpai/ads] …` for on-device diagnosis. Real iOS unit in
    RELEASE, Google TEST id in dev. NOT yet device-verified — needs a native rebuild (ship it).
- ✅ **Bottom banner (2026-08-29):** `src/ads/BannerAdSlot.tsx` — a fixed 320×50 banner in a reserved
  bottom bar (mounted via the `App.tsx` `Shell` column, so it never overlaps the UI), hidden for
  owners / boot / age-gate, collapses on no-fill. Dev shows a TEST banner; **real iOS unit wired**
  (`ca-app-pub-6862698457969651/9261864571`). Ship to verify on device. (Android unit: not yet.)
- ✅ ¥300 remove-ads IAP wired (`react-native-iap`, src/iap/iap.ts): purchase + restore in
  Settings; entitlement persisted via AppState/AsyncStorage. Dev-only unlock when native
  module absent.
- ⚠️ NOT yet runtime-verified — needs a dev/EAS build + accounts. Before launch:
  - iOS ad ids are all real now: app.json `iosAppId`, interstitial unit in src/ads/ads.ts, and the
    banner unit in src/ads/BannerAdSlot.tsx (`REAL_BANNER.ios`). Only Android units remain unfilled
    (Android not yet a ship target).
  - App Store Connect: create NON-CONSUMABLE IAP `app.kanpai.mvp.removeads`, price ¥300;
    activate Paid Apps agreement; test with a sandbox account.
  - Verify react-native-iap call signatures against the installed major version.
  - Confirm AdMob privacy manifest / SKAdNetwork + App Privacy answers.
- ✅ In-app crash net: src/components/ErrorBoundary.tsx catches render/runtime errors and
  shows a friendly JP recovery screen instead of a blank crash (wired in App.tsx). This is
  NOT a remote reporter — wire Sentry/Crashlytics at the console.error hook at ship time.
- Apple App Analytics (no SDK, via App Store Connect) — enable in the ASC dashboard (manual).

## Phase 4 — Ship prep
- ✅ App icon + favicon DONE. A real designed 1024² `assets/icon.png` (lager mug + red ！ +
  confetti, brand palette) is committed (`c39f32a`) and wired in app.json (icon + splash image).
  No longer the generated placeholder. `scripts/generate-icon.mjs` / `npm run icon` are retained
  but unused — the shipped icon is the designed one.
- ✅ Name verified available (see SPEC §9). Listing title: カンパイ！飲み会・宅飲みパーティーゲーム.
- App Store: 17+ rating, alcohol reference; JP screenshots; keyword subtitle.
- ✅ Terms/EULA + privacy policy page authored: docs/terms.html (利用規約・免責事項・
  プライバシーポリシー, incl. AdMob/ATT disclosures). Still MANUAL: host it publicly and
  replace the example.com links in AgeGateScreen + SettingsScreen with the real URL; fill the
  開発者名 + 連絡先 placeholders; get a lawyer's eye before serious scale-up (per SPEC §5).
- JP copy proofread; no em dashes in user-facing text.
- Consider a dedicated splash image (currently reuses icon.png).

## v2 (post-launch)
- 王様ゲーム + spice tiers (マイルド / ノーマル / ハード) + 下ネタ packs = the paid upgrade.
- Full content editors (お題 / rules / themes).
- Consider per-scene tone switcher (合コン / 宅飲み / 会社 / カップル / 女子会).

## Known placeholders to replace
(All of the original scaffold placeholders below are now RESOLVED — kept here as a resolved log.)
- ✅ `assets/` — real 1024² icon + favicon in place (`c39f32a`); splash reuses the icon.
- ✅ `app.json` → `extra.eas.projectId` set (`ea0d603a-8163-42b9-a1b4-0e93e41d95b5`).
- ✅ Terms URL now the hosted GitHub Pages page (https://taigamura.github.io/kanpai/terms.html).
- ✅ AdMob + StoreKit installed + wired (real iOS AdMob ids; IAP on react-native-iap v16).
