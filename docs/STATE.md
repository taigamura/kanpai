# カンパイ！ — Current State (session handoff)

_Last updated 2026-08-28. Read this + `SPEC.md` + `docs/ROADMAP.md` to take over._

## TL;DR
The app is **built and live on TestFlight (internal testing)**. **Not yet public.** The full ship
pipeline works end to end; say **"ship it"** to build + submit a new build. Latest shipped build
(2026-08-28) has: the Lager beer-glass theme, app-wide motion + phone-tilt beer, the shared 山手線
お題 feature LIVE on Supabase (data collection now ON), and the KingsCup/transition fixes.
**Before PUBLIC release:** update ASC App Privacy (see `docs/app-privacy.md`) + listing work
(screenshots, 17+ questionnaire, IAP/Paid-Apps agreement). See the sections below for detail.

## Identifiers (all already committed in-repo)
- **Repo:** github.com/taigamura/kanpai (PUBLIC), branch `main`.
- **EAS project:** `@taigamura/kanpai`, projectId `ea0d603a-8163-42b9-a1b4-0e93e41d95b5` (app.json).
- **Bundle id:** `app.kanpai.mvp`. **Min iOS: 16.4** (Expo SDK 57 floor — TestFlight hides it on older devices).
- **App Store Connect app:** listing name "カンパイ！飲み会パーティーゲーム集", **Apple ID `6805814337`**
  (home-screen name stays カンパイ！; listing name differs because bare カンパイ！ was taken).
- **AdMob (iOS):** App ID `ca-app-pub-6862698457969651~3900340220` (app.json); interstitial unit
  `ca-app-pub-6862698457969651/3331645387` (src/ads/ads.ts — real unit in RELEASE only, dev uses TEST ids).
- **IAP:** non-consumable `app.kanpai.mvp.removeads` @ ¥370 (src/iap/iap.ts `REMOVE_ADS_SKU`).
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
- **TestFlight builds:** build 2 (older) + **build 3 (current — has AdMob + IAP + terms link)**. Both `IN_BETA_TESTING`. Test build 3.

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
- **Tilt layer NOT built** (deferred): the live foam/bubble-stays-level-on-tilt gimmick from
  `docs/lager-tilt.html` needs `expo-sensors` (DeviceMotion) = a new native module + rebuild. The static
  beer-glass ground ships the Lager look now; add tilt as a follow-up if desired before store screenshots.
- Other locked tweaks this session: **山手線 timer removed** (verbal game, no countdown); **per-game
  responsible-drinking caution removed from GameFrame footer** (age-gate + Settings legal notices kept).

## Remaining to launch (manual unless noted "Claude can do")
1. **IAP:** create non-consumable `app.kanpai.mvp.removeads` @ ¥370 in ASC; finish **banking** so the
   **Paid Apps agreement** goes active (tax forms W-8BEN + Certificate of Foreign Status already submitted);
   add a **sandbox tester**; test buy + restore on a build.
2. **App icon:** replace the placeholder `assets/icon.png` (`npm run icon` = placeholder art), 1024².
3. **Listing:** JP screenshots (from the TestFlight build), **17+** age-rating questionnaire, **App Privacy**
   (declare AdMob data collection), support email taigamura.dev@gmail.com.
4. Attach build to version 1.0.0 → **Submit for Review**.
5. Ship a fresh build after any code change: **"ship it"**.

## Diagnostics note
The ASC API is queryable from WSL with the `.p8` key (ES256 JWT → `api.appstoreconnect.apple.com/v1`); a prior
session used this to read build `processingState` / `internalBuildState` and beta-tester state. Handy for TestFlight debugging.

## Verification at handoff
`npx tsc --noEmit` clean; `npx jest` 5/5 pass. Latest work committed + pushed to `origin/main`.
