# カンパイ！ — Current State (session handoff)

_Last updated 2026-08-30 (banner ad + preload ship). Read this + `SPEC.md` + `docs/ROADMAP.md` to take over._

## TL;DR
The app is **built and live on TestFlight (internal testing)**. **Not yet public.** The full ship
pipeline works end to end; say **"ship it"** to build + submit a new build. **Latest shipped build
(2026-08-30, commit `b6b0582`, EAS submission `c9443b50`, ipa `build-1788017349308.ipa`)** adds the
**bottom banner ad** + the **interstitial preload-and-cache fix**, on top of everything below:
参加者・負けカウント (registered players + loss tally), the **real app icon**, the Lager beer-glass
theme, app-wide motion + phone-tilt beer, the shared 山手線 お題 feature LIVE on Supabase (data
collection ON), the KingsCup/transition fixes, and the UI pop pass. Processing on Apple at handoff
(≈5–10 min) — verify banner + interstitial on TestFlight once it lands. Nothing built-but-unshipped.
**Before PUBLIC release:** update ASC App Privacy (see `docs/app-privacy.md`) + listing work
(screenshots, 17+ questionnaire, IAP/Paid-Apps agreement). See the sections below for detail.

## Identifiers (all already committed in-repo)
- **Repo:** github.com/taigamura/kanpai (PUBLIC), branch `main`.
- **EAS project:** `@taigamura/kanpai`, projectId `ea0d603a-8163-42b9-a1b4-0e93e41d95b5` (app.json).
- **Bundle id:** `app.kanpai.mvp`. **Min iOS: 16.4** (Expo SDK 57 floor — TestFlight hides it on older devices).
- **App Store Connect app:** listing name "カンパイ！飲み会パーティーゲーム集", **Apple ID `6805814337`**
  (home-screen name stays カンパイ！; listing name differs because bare カンパイ！ was taken).
- **AdMob (iOS):** App ID `ca-app-pub-6862698457969651~3900340220` (app.json); interstitial unit
  `ca-app-pub-6862698457969651/3331645387` (src/ads/ads.ts); banner unit
  `ca-app-pub-6862698457969651/9261864571` (src/ads/BannerAdSlot.tsx). Real units in RELEASE only;
  dev uses Google TEST ids. Android has no units yet (not a ship target).
- **IAP:** non-consumable `app.kanpai.mvp.removeads` @ ¥300 (src/iap/iap.ts `REMOVE_ADS_SKU`).
- **ASC API key (for submit):** keyId `FM2QG63KF9`, issuer `427cba56-68b8-42ec-b1a8-2f71d5195e53`,
  `.p8` at `~/.appstoreconnect/keys/AuthKey_FM2QG63KF9.p8` on WSL (in eas.json). Shared across the user's apps.
- **Terms/Privacy:** https://taigamura.github.io/kanpai/terms.html (GitHub Pages from `/docs`). Support email **taigamura.dev@gmail.com**.

## Ship pipeline (`/ship-ios`, ~/.claude/skills/ship-ios)
Config in `.claude/ship.json`. Flow: commit → push → **build on the Mac over SSH** → scp ipa → **submit from WSL**.
- **Mac build server:** taigamuras-MBP, `192.168.50.175`, ssh key `~/.ssh/simple-bookkeeping-buildserver`,
  repo at `~/dev/kanpai`, `eas` logged in as taigamura. Already cloned + deps installed.
- **Build cmd (detached, poll ~20 min):** `EAS_SKIP_AUTO_FINGERPRINT=1 EAS_BUILD_NO_EXPO_GO_WARNING=true eas build -p ios --local --profile production`
- **Submit (from WSL):** `npx eas-cli@21.8.0 submit -p ios --profile production --path <ipa> --non-interactive`
- **Credentials already minted** (distribution cert reused, provisioning profile created). The one-time
  keychain-unlock first build is DONE — future builds run unattended.
- **TestFlight builds:** builds 2–4 (older) + build 4 (UI pop pass) + **the current build shipped
  2026-08-30** (banner ad + interstitial preload fix + 参加者・負けカウント + real icon; commit
  `b6b0582`, EAS submission `c9443b50`). Test the newest one.

## Critical gotchas — DO NOT LOSE
1. **Xcode 26.3 build fix (shipped):** expo-modules-jsi@57.0.5 annotates `RuntimeScheduler` constructors with
   `SWIFT_RETURNS_RETAINED`, which Xcode 26.3 rejects → compile fail. Fixed via **patch-package**:
   `patches/expo-modules-jsi+57.0.5.patch` + `postinstall`/`eas-build-post-install` = `patch-package`.
   If expo-modules-jsi bumps version, regenerate the patch (nibble-app 57.0.4 lacks the annotations).
2. **IAP is react-native-iap v16 (openiap):** `fetchProducts` (not `getProducts`), `requestPurchase` is
   **event-based** (result via `purchaseUpdatedListener`), and `finishTransaction` is mandatory. src/iap/iap.ts is already correct for v16 — don't "simplify" it back to the old API.
3. **Audio = expo-audio (NEW native module, 2026-08-28 part 2).** Added for ロシアンルーレット
   (tension bed + explosion SFX). `src/audio/sound.ts` is guarded like ads/iap (absent module → no-op).
   Assets in `assets/audio/*.m4a` are **synthesized with ffmpeg** (royalty-free, no licensing). The
   app.json plugin is configured playback-only: `microphonePermission:false`, `recordAudioAndroid:false`,
   `enableBackgroundPlayback:false` — do NOT let it re-add mic / background-audio perms (App Review risk).
   Needs a native rebuild (it's a new module) — ship it.
4. **Re-run `supabase/schema.sql`** in the Supabase SQL editor before the game-request box works:
   it adds the `game_requests` table + `submit_game_request` RPC. Until then the request modal still
   thanks the user (best-effort) but nothing is logged.

## Product decisions locked this session
- **Penalties:** no built-in 罰ゲーム — user-added only. Every loss = **罰ゲーム** (no 飲む, no ノンアルOK wording)
  **except キングスカップ**, which keeps drinking via its center-cup mechanic with plain 飲む wording.
  Scope of the de-drinking = penalties only; the drinking theme, name/subtitle, anketo「お酒に強そう」, etc. stay.
- **Emoji removed** → semantic `src/components/Icon.tsx` (Ionicons + MaterialCommunityIcons). Only ♠♥♦♣ and ✕ remain.
- **Per-game rules** via an ⓘ icon on each home tile (modal).
- **20歳以上 age gate kept** (app still references alcohol → 17+ rating + gate stay).

## Refinement pass — BUILT (2026-08-28, from TestFlight feedback)
Mocked in `docs/refine-mockups.html` (signed off), then wired in:
1. **Tilt = liquid, not twitchy.** `Screen.tsx useTiltStyle` now drives the angle through an
   underdamped spring on a `useFrameCallback` loop (STIFFNESS 70 / DAMPING 9 → one slosh-overshoot
   then settle), cap dropped to ~7° (`TILT_CAP` 0.12 rad), plus a slow idle sway so it reads wet at
   rest. No sensor → only idle sway.
2. **Transitions don't move the glass.** The beer ground was extracted into `BeerGround` and is now
   rendered ONCE in `App.tsx`, fixed behind everything; `Screen` is transparent. The router
   cross-fades content (`FadeIn`/`FadeOut`) instead of sliding — chosen option A (cross-fade
   everywhere). `ROUTE_DEPTH`/slide logic removed.
3. **Popup calmer.** New `PopIn` Keyframe in `motion.tsx` (scale 0.92→1 + fade, 200ms, no
   overshoot) replaces the bouncy `ZoomIn().springify()` on the Home rules modal.
4. **山手線 ヒント.** `YAMANOTE_HINTS` (examples per built-in お題) in `yamanoteThemes.ts`; a ヒント
   button on the お題 screen fades in the examples as Pills. Custom/community お題 have no hint →
   button hidden. New `bulb` icon.
5. **Bigger dice & cards.** PlayingCard lg 120×164→150×206 (font 44→56) + deeper shadow
   (`ui.tsx`); チンチロ roll dice 46→64.
6. **Beer-fill boot screen.** New `LoadingScreen.tsx` (amber fills bottom-to-top, foam head,
   bubbles, logo) replaces the bare spinner in `App.tsx`; held ≥1.9s so the pour always shows.

Verified: `tsc --noEmit` clean, `jest` 5/5. Not yet runtime-tested on device — ship + check on TF.

## UI pop pass — SHIPPED (2026-08-29, PR #5 `ed5cf3f`, TestFlight build 4) — from TF feedback
Four small consistency/legibility fixes. `tsc` clean + jest 5/5. Shipped to TestFlight
(EAS submission `81f49a21-604a-4dd6-986b-3c694dff9e17`); not yet device-verified. Party-direction
mockups in `docs/party-mockups.html` (home shelf w/ per-game color, big お題 headline, full-bleed
罰ゲーム flood) — a direction to react to, not yet built into the app.
1. **Uniform black ！.** `LoadingScreen` bang was `colors.primary` (red) while the home logotype's ！
   is ink — boot now uses `colors.text` so the two match (no red flash on load).
2. **Calm popups everywhere.** `TopicsModal` (みんなのお題) + `GameRequestModal` were still entering
   with the bouncy `enterPop()` (ZoomIn.springify). Both now use the no-overshoot `PopIn` keyframe,
   matching the Home rules modal. `enterPop` stays for in-content reveals (お題/roll/penalty), not modals.
3. **Type scale bumped one notch** in `theme/theme.ts` `font`: small 14→15, body 17→19, heading 24→28,
   title 34→40. Every screen sizes off these tokens, so game text now reads big app-wide. Also
   `GameFrame` per-screen title font.body→font.heading. Watch for any tight layouts on next TF build.

## 参加者・負けカウント (registered players + loss tally) — SHIPPED (2026-08-30, build `b6b0582`)
Opt-in named-players system. Empty = every game behaves exactly as before (anonymous
「負けた人！」). Register players and the app switches into tally mode. `tsc` clean + jest 5/5.
- **Model:** `players: {name, losses}[]` in `AppState`, persisted under `kanpai.players.v1`
  (new key in `storage.ts`). Mutators: `addPlayer`/`removePlayer`/`adjustLoss(name, ±1)`/`resetLosses`.
- **Home entry (top of list, NOT a game tile):** solid caramel card + people icon + forward
  chevron above all game tiles (`HomeScreen.tsx`), deliberately distinct from the frosted-glass
  game rows. Subtitle adapts: 「参加者を登録して負け数を記録」→「N人が参加中」→「最多負け：○○（N回）」
  once someone's lost. New route `{name:'players'}` (`Nav.tsx` + `App.tsx`).
- **Players screen (`src/screens/PlayersScreen.tsx`):** quick-add/remove, live leaderboard sorted
  by losses (trophy icon on anyone with losses), 「負け数をリセット」 button (Alert-confirmed) shown
  only when there's something to reset.
- **Lose screen (`PenaltyReveal.tsx`, shared across all 6 games):** when players registered, shows
  「負けた人をタップ（負け数に記録）」 + a chip per player (name + count). Tap records a loss + turns the
  chip red; tap again undoes it. Selection is a per-reveal toggle (local `selected[]`) so a mistap
  is reversible and never double-counts. 罰ゲーム draw unchanged below.
- **匿名アンケート uses these players:** `HomeScreen.openGame` seeds the session roster from players
  and skips the roster screen when `players.length >= minPlayers`; else the old quick-add flow runs.
  AnketoGame itself is unchanged (still reads `roster`).
- New icons `players` (account-group) + `trophy` (trophy-outline) in `Icon.tsx`. All strings in
  `content/copy.json` under `players.*` + `penalty.whoPrompt`/`penalty.lossSuffix`.
- **チンチロ defers to registered players (2026-08-29):** when players are registered, the 人数
  stepper is replaced by a read-only roster line and the seat count IS `registered.length`; seats
  are named (handoff / result / reveal rows / loser label all show the player's name via `seatLabel`)
  instead of「N人目」. No players → the manual stepper is unchanged. New copy keys `chinchiro.rosterLabel`
  /`fromRoster`/`handoffNoteName`/`seatResultName`/`loserLabelName`. (Local count state renamed
  `seatCount`; the AppState `players` is imported as `registered` to avoid the name clash.)

## App icon — DONE (committed `c39f32a`)
The real 1024×1024 `assets/icon.png` (lager mug + red ！ + confetti, brand palette) is committed
and wired: `app.json` `expo.icon` points at it AND the `expo-splash-screen` plugin uses it as the
splash image (amber `#E39A24` background). `assets/favicon.png` (web) is generated too. The old
"placeholder clinking-mugs" wording in prior handoffs is obsolete. `scripts/generate-icon.mjs` +
`npm run icon` still exist but are NOT needed anymore — the shipped icon is the designed one, not
generator output. No icon work remains before store submission; it is baked into every build.

## Ads NOT showing on TestFlight — diagnosis + on-device diagnostic (2026-08-30)
Tester reported no ads (banner + interstitial) on TestFlight. Wiring was audited and is CORRECT
(App.tsx: ATT → `initAds()` → SDK init → preload; `BannerAdSlot` mounted once `!booting &&
ageAccepted`; real iOS units in RELEASE). So the cause is environment/account-side, most-likely-first:
1. **Tester may be on an OLD build.** Banner + the interstitial preload-fix exist only from build
   `b6b0582` (2026-08-30). Confirm the installed TestFlight build number first.
2. **Brand-new AdMob account + app not yet public = ~zero fill (expected).** Real units serve little
   or nothing until the app is LIVE on the App Store and the **AdMob app is linked** to that listing,
   **`app-ads.txt` is published** (MISSING — must be at `taigamura.github.io/app-ads.txt`, the
   USER-pages root, not `/kanpai/`), and AdMob payments/tax are complete. New units also no-fill for
   hours–48h. A **dev build uses Google TEST ids (always fill)** — use it to prove the wiring.
3. **Interstitial needs ≥3 game opens/session** (first 2 ad-free, resets on cold start). Banner has
   no such gate, so a missing banner points at #1/#2.

**On-device ad diagnostic — BUILT (this session).** Because the `[kanpai/ads]` console logs are
`__DEV__`-only (silent in a RELEASE TestFlight build), added an always-on status store + a hidden
Settings panel so a tester can SEE why an ad didn't appear without Xcode:
- `src/ads/adStatus.ts` — tiny pub/sub store (`reportAdStatus`/`subscribeAdStatus`/`getAdStatus`).
- `ads.ts` + `BannerAdSlot.tsx` report every SDK/interstitial/banner event into it (module present,
  test-vs-live ids, SDK init/ready/failed, LOADED / NO_FILL / ERROR, opens count).
- **Reveal:** in Settings, **tap the「設定」title 7×** → a 「広告診断」 card appears showing all state +
  an「インタースティシャルを試す」button (`debugTryInterstitial`, bypasses the freq cap). Hidden from
  normal users; works in release. NOT localized copy (dev tooling, strings inline). Needs a native
  rebuild — ship it, then read the panel on TestFlight to confirm no-fill vs a wiring problem.

## Ads — INTERSTITIAL (preload-cache) + BOTTOM BANNER — SHIPPED (2026-08-30, build `b6b0582`)
Two placements now (SPEC §6). Both hide for owners (`adsRemoved`), on web/Expo Go (native module
absent), and during boot/age-gate.

### Bottom banner (NEW 2026-08-29)
`src/ads/BannerAdSlot.tsx` (+ `.web.tsx` stub) renders a fixed **320×50** banner on a foam-cream bar
with an ink hairline. It is mounted in `App.tsx` as part of a new **`Shell`** that lays out the app
in a column: content in a `flex:1` box, banner in normal flow BENEATH it. Because the banner reserves
its own height, it can never float over the UI or hide a button. On no-fill the bar collapses (no
empty gap). Shown only when `!booting && ageAccepted`.
- ✅ **Real iOS banner unit wired (2026-08-29):** `REAL_BANNER.ios =
  ca-app-pub-6862698457969651/9261864571` (AdMob app `~3900340220`, already the `iosAppId` in
  app.json). Dev shows a TEST banner, RELEASE shows this real unit. Both interstitial + banner now
  have real iOS units — no ad ids remain to fill. Ship to verify on device. (Android has no unit yet.)

### Interstitial — preload-and-cache refactor
Fixes "ads don't show up." `src/ads/ads.ts` was rewritten from on-demand-load-and-race to a
**preload-and-cache** manager (the pattern AdMob recommends):
- `initAds()` (called once at startup from `App.tsx` after the ATT prompt) initializes the SDK and
  **preloads** the first interstitial so one is ready before the frequency cap is ever hit.
- `maybeShowInterstitial(adsRemoved)` (called on every game open, `HomeScreen.openGame`) counts opens;
  on the 3rd (`SHOW_EVERY = 3`, first two are ad-free) it shows the **cached** ad instantly and, on
  CLOSED, preloads the next. If nothing is loaded yet (slow/no fill) it kicks a preload and skips
  WITHOUT resetting the counter, so the next open shows — gameplay never blocks on an ad load.
- The old code created an interstitial on each attempt, `.load()`d it, and raced a 6s timeout; any
  fill slower than 6s (routine on a fresh AdMob account) was silently dropped. That race is gone.
- **On-device diagnostics:** in `__DEV__` every decision logs as `[kanpai/ads] …` (SDK init, load
  requested/loaded/error, show, "no ad loaded"). Read it in Metro / the Xcode device console to see
  exactly why an ad did or didn't appear.
- Dev builds always use Google's **TEST** interstitial id (reliable fill, never a live tap);
  RELEASE uses the real iOS unit `ca-app-pub-6862698457969651/3331645387`. iOS App ID is in app.json.
- **Why you may STILL see no ad even though the wiring is correct:** (a) running in **Expo Go / web /
  a plain simulator** — the native `react-native-google-mobile-ads` module is absent, so ads no-op
  (the log says so); use a dev-client or EAS build. (b) A **brand-new AdMob account/unit returns
  "no fill"** for hours-to-days and until the AdMob app is fully set up (payments/app-ads.txt) — the
  code is correct but there's no inventory; TEST ids in a dev build confirm the wiring meanwhile.
  (c) You opened fewer than 3 games in a session (the counter resets on cold start). `tsc` clean +
  jest 5/5 after the refactor. Needs a native rebuild to verify on device — **ship it**.

## UX polish + audio + game-requests — BUILT (2026-08-28, part 2)
From the latest feedback. Verified `tsc` clean + `jest` 5/5; not yet runtime-tested on device.
1. **Loading → home is seamless.** `LoadingScreen` now renders the real `BeerGround` underneath
   and drains a cream foam cover upward, so the pour ends exactly on the home glass (foam head +
   carbonation), then cross-fades in. No more cut to a different-looking glass.
2. **Loading logotype font fixed.** The カンパイ！ logo is hidden until app fonts load
   (`showLogo={fontsLoaded}` from `App.tsx`), so it never flashes in a fallback system face.
3. **Uniform bounce.** Canonical entrance builders in `motion.tsx` — `enterItem(i)` (list stagger),
   `enterPop(delay)` (single pop), `enterBoom(delay)` (big reveal) — now used everywhere (home tiles,
   Chinchiro, Yamanote, TopicsModal, PenaltyReveal). One damping/stiffness across the app.
4. **Yamanote fixed.** The お題 no longer does a 3D card-flip (it's not a card) — it uses the shared
   `enterPop`, matching the rest of the app.
5. **Chinchiro roll & stop.** 振る now spins the dice (faces cycle) and a ストップ！ button freezes
   them on the real result — a real throw instead of an instant reveal. New `rolling` phase.
6. **ロシアンルーレット juiced.** On スタート the bomb inflates (grows + heartbeat + rattle) while a
   tension bed speeds up (`playbackRate` ramp); on detonation: big on-screen boom + full-screen flash +
   `Vibration.vibrate` pattern + explosion SFX + error haptic. Audio via `src/audio/sound.ts`.
7. **KingsCup last-King warning.** When 3 Ks are out (1 left), a pulsing red banner warns that the
   next K drinks the center cup. (Copy avoids 一気飲み per SPEC §5.)
8. **"ゲームをリクエスト" box (home).** Dashed tile under the game list opens a free-text suggestion
   form (`src/games/GameRequestModal.tsx`); submits to Supabase `game_requests` via
   `src/services/requests.ts` (guarded, best-effort). New privacy stream folded into User Content —
   `docs/app-privacy.md` + `docs/terms.html` (§7.4) updated.

## Motion pass — BUILT (2026-08-28)
- App-wide animation layer on Reanimated 4 (worklets plugin + New Arch, already wired). Shared
  primitives in `src/components/motion.tsx`: `PressableScale` (spring press), `FlipIn` (3D card
  flip), `TumbleDie` (dice tumble), `Pulse` (looping scale), plus re-exported entering presets.
  - Page transitions: `App.tsx` Router wraps each screen in `Animated.View` with direction-aware
    slide (deeper = SlideInRight, home = SlideInLeft) keyed on route.
  - Buttons spring on press (`ui.tsx`). Home tiles stagger in + press-scale; rules modal pops (ZoomIn).
  - Games: 高低/キングスカップ card flips; チンチロ dice tumble + result pop + reveal stagger;
    山手線 お題 flip; ルーレット fuse Pulse + BounceIn boom; PenaltyReveal BounceIn/ZoomIn.

## 山手線 shared お題 + voting — LIVE on Supabase (2026-08-28)
- **What ships:** users add their own 山手線 お題 (persisted, merged into the draw pool) via the
  お題 modal (`src/games/TopicsModal.tsx`, opened from the 山手線 intro), AND those お題 are shared
  to everyone + the community list is upvotable. `topicsConfig.ts` is filled with the live Supabase
  project (`driqzhzlejeujfzwtstg`, anon key committed — publishable/safe). Verified end-to-end
  (submit/vote/dedupe/read) 2026-08-28; pool seeded with 「コンビニのスイーツ」.
- **⚠️ DATA COLLECTION IS NOW ON.** The app sends submitted お題 text + an anonymous install id to
  Supabase. **Before submitting the next build for PUBLIC App Store review, update App Privacy in
  ASC** (declare "User Content" = submitted text, "Identifiers" = install id) and add a line to
  `docs/terms.html`. TestFlight is fine meanwhile. Analytics = `topics.votes` + `topic_submissions`
  in the Supabase dashboard. To disable again, blank out `topicsConfig.ts` and reship.
- **Backend = Supabase** (client already wired for it; only creds + privacy work remain).
  To turn ON shared お題 + upvotes + developer analytics:
  1. Create a Supabase project (free tier). SQL editor → run `supabase/schema.sql` (tables
     `topics`/`topic_votes`/`topic_submissions` + SECURITY DEFINER RPCs `submit_topic`/`vote_topic`
     + RLS: anon may only SELECT `topics` and EXECUTE the two RPCs).
  2. Settings → API: paste **Project URL** + **anon public key** into `src/services/topicsConfig.ts`
     (`{ url, anonKey }`). The anon key is publishable/safe to ship; NEVER the service_role key.
     The client hits PostgREST directly: GET `topics` ranked by votes; RPC for submit/vote.
  3. **Privacy work REQUIRED before that build ships:** update App Privacy labels (declare the
     submitted-text = "User Content" + anonymous install id = "Identifiers" collection) and add a
     line to `docs/terms.html`. Then reship. Analytics = the `topics.votes` aggregate +
     `topic_submissions` log (keyed by anonymous install id, no PII), read in the Supabase dashboard.
- Client wiring: `src/services/topics.ts` (Supabase PostgREST/RPC, guarded), `topicsConfig.ts`
  (`url`/`anonKey`, empty = off), `AppState.customTopics` (+add/remove; add also best-effort
  `submitTopic`), storage keys `customTopics`/`installId`/`topicVotes`.

## Design status — LAGER THEME BUILT (2026-08-28)
- **Theme = 生ビール Lager beer-glass (LOCKED, built).** Replaced the twilight-blue izakaya palette.
  Whole app now reads as the inside of a lager glass: amber liquid ground + cream foam head across
  the top + rising carbonation + diagonal glass shine (`src/components/Screen.tsx`), dark roasted-malt
  ink type on frosted-glass panels. Palette flipped in `src/theme/theme.ts` (mirror of
  `docs/lager-tilt.html` / `docs/beer-glass-ui.html` concept 1). StatusBar → `dark` for the light foam top.
  - Decoupled tokens added: `cardBack` (dark card back), `accentBright` (gold crown on dark), `cream`
    (button foreground), `beerTop/beerBot/foam`. `accent` is now deep caramel (legible dark-on-light).
  - **Foam:beer ratio = 3:7 (2026-08-29).** The cream foam head now fills the top 30% of the glass,
    amber liquid the bottom 70%, driven by `FOAM_*` constants at the top of `src/components/Screen.tsx`
    (proportional to screen height, not fixed px). Change the `0.3` there to re-tune the ratio.
- **Tilt layer NOT built** (deferred): the live foam/bubble-stays-level-on-tilt gimmick from
  `docs/lager-tilt.html` needs `expo-sensors` (DeviceMotion) = a new native module + rebuild. The static
  beer-glass ground ships the Lager look now; add tilt as a follow-up if desired before store screenshots.
- Other locked tweaks this session: **山手線 timer removed** (verbal game, no countdown); **per-game
  responsible-drinking caution removed from GameFrame footer** (age-gate + Settings legal notices kept).

## IAP purchase-sheet UX — diagnosed + hardened (2026-08-30)
TestFlight tester saw the buy sheet show a **"[?]" app name** and a **typed-password login (no Face
ID)**. Both are expected symptoms, not app bugs:
- **Password, not Face ID:** TestFlight IAP always runs in the **StoreKit Sandbox**, and Sandbox
  deliberately does NOT use the streamlined Face ID one-tap flow — the sandbox tester must type their
  Apple ID password. Real production users WILL get the Face ID flow. Nothing to fix in code.
- **"[?]" app name + placeholder price:** StoreKit resolved NO product metadata, because the
  non-consumable **isn't "Ready to Submit" in ASC yet and/or the Paid Apps agreement isn't active**
  (both still open below). With no product, the sheet has nothing to show. This is account-side.

Code hardening shipped so the app degrades gracefully once ASC is set up (commit pending):
- `iap.ts`: new `fetchRemoveAdsProduct()` returns `{price,title}` or null; `purchaseRemoveAds` now
  returns `'owned' | 'cancelled' | 'unavailable'` and **refuses to open the sheet when the product
  can't be resolved** (returns `'unavailable'`) so testers never hit the broken "[?]" sheet again.
- `SettingsScreen.tsx`: fetches the product on mount and shows **StoreKit's live localized price**
  on the buy button (fallback `¥300`), so the price is whatever the ASC price tier says and is never
  a stale hardcode. On `'unavailable'` it shows 「現在購入できません」 instead of a dead sheet.
- **Price is now ¥300** (was ¥370) everywhere in docs/copy — but the AUTHORITATIVE number is the ASC
  price tier: **set the removeads product to ¥300 when you create it**, and the button follows it.

## Remaining to launch (manual unless noted "Claude can do")
1. **IAP:** create non-consumable `app.kanpai.mvp.removeads` @ **¥300** in ASC; finish **banking** so
   the **Paid Apps agreement** goes active (tax forms W-8BEN + Certificate of Foreign Status already
   submitted); add a **sandbox tester**; test buy + restore on a build. Until the product exists +
   the agreement is active, the buy button correctly reports 「現在購入できません」 (see the IAP section above).
2. **App icon:** ✅ DONE — a real designed 1024² `assets/icon.png` (lager mug + red ！ + confetti)
   is committed (`c39f32a`) and wired in `app.json` (`icon` + splash image). No longer a placeholder.
3. **Listing:** JP screenshots (from the TestFlight build), **17+** age-rating questionnaire, **App Privacy**
   (declare AdMob data collection), support email taigamura.dev@gmail.com.
4. Attach build to version 1.0.0 → **Submit for Review**.
5. Ship a fresh build after any code change: **"ship it"**.

## UI Studio — browser slider + comment tool for UI finetuning (BUILT 2026-08-29)
A dev-only, **web + `__DEV__` only** overlay for tuning the UI without code round-trips. Runs the
REAL app on `react-native-web` (true fidelity, not a mockup replica).
- **Launch:** `npm run web` (or `npx expo start --web`), open localhost in a browser, click the
  **🎛 Studio** button (bottom-right). No-op on native/production — adds nothing to the app bundle.
- **iPhone-sized frame:** on web the app is centered in a 393×852 (iPhone 14/15 logical pt) rounded
  card with shadow on a dark backdrop (`WebFrame` in `App.tsx`, mirrors simple-bookkeeping's
  AppShell) so it reads as a phone. The frame carries `nativeID="kanpai-phone-frame"`; the Studio
  normalizes arrow-comment coords to that frame rect so arrows stay pinned to components on resize.
- **How fidelity works:** `src/theme/studio.ts` reads token overrides from `localStorage` at module
  load and `Object.assign`s them onto the token objects in `theme.ts` **before** any screen's
  `StyleSheet.create()` captures a value. The panel edits pending values; **Apply** persists +
  reloads the page so `StyleSheet.create()` re-captures at the new sizes = pixel-exact. Route is
  persisted across the reload (`Nav.tsx`, studio-only) so you stay on the screen you're tuning.
- **Sliders:** tabs 文字 (font: title/heading/body/small), 余白 (spacing xs→xxl), 角丸 (radius),
  色 (colors: hex = picker, rgba = text). All read from `theme.ts` tokens dynamically.
- **Comments:** コメント tab → 「＋ 矢印コメント」 → drag an arrow onto any component and type a note
  (for things a slider can't express). Comments are tagged to the current screen, stored in
  `localStorage`. **📋 Copy for Claude** exports token diffs + comments as a paste-ready block.
- **Files:** `src/theme/studio.ts` (bridge), `src/studio/studioDom.ts` (the DOM UI, vanilla),
  `src/studio/StudioOverlay.tsx` (RN shim, dynamic-imports the DOM module), mounted in `App.tsx`.
  `theme.ts` exports `THEME_DEFAULTS` (pristine snapshot for diffs) + calls `applyTokenOverrides`.
- **Web-bundle enablers:** AdMob/IAP/expo-audio are native-only and broke `expo start --web`
  bundling. Added `.web.ts` no-op stubs (`src/ads/ads.web.ts`, `src/iap/iap.web.ts`,
  `src/audio/sound.web.ts`) that Metro prefers on web. **Native builds are untouched** (they never
  see `.web.ts`). If a new native-only module is added, give it a `.web.ts` stub too or web breaks.
- **Workflow:** tune with sliders → for anything else, drop an arrow-comment → hit Copy for Claude →
  paste here, and I apply the diffs to `theme.ts` + address the comments.

## Swipe-back navigation — BUILT (2026-08-29)
Right-swipe from any non-home screen goes home (`App.tsx` Router: a RNGH `Gesture.Pan` wrapping the
routed view). The nav is flat and every 戻る button calls `nav.home`, so swipe-back = go home. Guards:
`enabled` only off-home, `activeOffsetX(24)` needs clear horizontal travel, `failOffsetY([-18,18])`
yields to the vertical ScrollViews, and it only fires on a rightward, mostly-horizontal flick
(`translationX > 70 && velocityX > 0 && translationX > |translationY|`). Verified on web: right→home,
vertical drag + left drag do nothing. No screen has a competing horizontal gesture.

## Boxed pre-game rules — BUILT (2026-08-29, restyled from 10-option board)
Pre-start rule/instruction text is wrapped in a shared `RuleCard` (`src/components/ui.tsx`) instead
of floating as loose text. **Style = "labeled tab" (option #04** from `docs/rulecard-mockups.html`,
also published as an artifact): cream `bgElevated` card + a caramel accent pill straddling the top
edge that names the box. `RuleCard` takes an optional `label` prop (default 「ルール」). The tab pokes
13px above the card, so the style reserves `marginTop:13` — keep clearance above it.
Applied to: 山手線, チンチロ, ロシアンルーレット, 匿名アンケート, キングスカップ (label「はじめる前に」,
now holds the whole setup: lead + the two center-cup bullets; the old standalone heading + spacing-
only `rulesBox` are gone), 高低 (new intro screen, see below), and the roster/name-input screen.
(The 10 mockups also live as an artifact; #07 Coaster was briefly built then replaced by #04.)

## 高低 intro screen + roster quick-rule — BUILT (2026-08-29)
- **高低 (HighLow):** added a pre-start screen (`started` state) with the rule in a `RuleCard` +
  a スタート button; the first card is drawn only on スタート (`start()` → `setCurrent(draw())`).
  The old mid-play rule line under the card was removed (now on the intro). Was previously the one
  game with no intro — it dealt a card immediately.
- **Roster / name-input (`src/screens/RosterScreen.tsx`):** shows a quick-rule `RuleCard` above the
  name field, game-aware via `GAMES.find(g => g.id === next)?.rules[0]` — so 匿名アンケート's
  secret-vote rule appears while you enter players. Generic: any needsRoster game shows its rule[0].

## Central UI text document — BUILT (2026-08-29)
Every user-facing UI **chrome** string (buttons, titles, labels, instructions, modal copy, alerts,
game rule/role text) now lives in one editable document: **`content/copy.json`** (repo root). Edit a
value there and it is mirrored everywhere that string renders (Fast Refresh / next build picks it up).
- Loader: `src/content/copy.ts` exports `copy` (the typed JSON) + `fmt(template, vars)` for the
  handful of strings with `{n}`/`{name}`/`{names}`/`{i}`/`{total}`/`{title}` placeholders. Keep those
  tokens intact when editing.
- Scope decision: **UI chrome only.** Game CONTENT lists stay in `src/data/*.ts` (山手線 themes+hints,
  アンケート questions, game roster/rules on the home tiles, penalties) — that layer was already a clean
  single edit surface and was deliberately left alone.
- Type-safety: `tsc` validates every `copy.x.y` key path, so a mistyped key fails the build (not silently
  at runtime). Two intentional non-copy literals remain in code: the `・` name-joiner in AnketoGame and the
  `[カンパイ]` console.error tag in ErrorBoundary (a dev log, not shown to users).
- KingsCup rank→rule text and Chinchiro role names moved into `copy.kingscup.rules` / `copy.chinchiro.role*`.
  The standalone chinchiro jest spec keeps its own label copy, so it's unaffected.

## Diagnostics note
The ASC API is queryable from WSL with the `.p8` key (ES256 JWT → `api.appstoreconnect.apple.com/v1`); a prior
session used this to read build `processingState` / `internalBuildState` and beta-tester state. Handy for TestFlight debugging.

## Verification at handoff
`npx tsc --noEmit` clean; `npx jest` 5/5 pass. Latest work landed on `origin/main` (`b6b0582`, PR #10)
and **shipped to TestFlight** (EAS submission `c9443b50`, ipa `build-1788017349308.ipa`) on 2026-08-30.
Untracked-but-intentionally-uncommitted in the tree: `store-assets/` + `store-assets.zip` (App Store
screenshots) and `.ralph/` — left out of commits on purpose.
