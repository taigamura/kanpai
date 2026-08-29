# カンパイ！ — App Store submission runbook (v1.0.0 public release)

_Grounded in `docs/STATE.md` (2026-08-29). Currently: live on TestFlight (build 4), NOT public._
_"Claude can do" = say it in this session. Everything else is manual in App Store Connect (ASC)._

Bundle id `app.kanpai.mvp` · ASC Apple ID `6805814337` · listing name「カンパイ！飲み会パーティーゲーム集」
· min iOS 16.4 · support email taigamura.dev@gmail.com · Terms/Privacy https://taigamura.github.io/kanpai/terms.html

---

## Phase 0 — Decisions before you touch ASC
- [x] **App icon — DONE.** A real designed 1024² `assets/icon.png` (lager mug + red ！ + confetti) is
      committed (`c39f32a`) and wired in `app.json` (icon + splash). It bakes into every build; no
      icon action remains. (The old "placeholder clinking-mugs" note is obsolete.)
- [ ] **Confirm screenshots.** DONE this session: App Store set 15 at 6.9″ (1290×2796) + 6.7″
      (1284×2778) in `store-assets/`. You need ≥3 per size; you have 5. Good.
- [ ] **Confirm the reviewed build.** The newest code (参加者・負けカウント) is built but NOT yet
      shipped. Ship a fresh build so review sees the final app (Phase 2).

## Phase 1 — Backend + privacy prerequisites (do before the review build)
- [ ] **Re-run `supabase/schema.sql`** in the Supabase SQL editor if not already: it adds the
      `game_requests` table + `submit_game_request` RPC so the home "ゲームをリクエスト" box logs.
      (お題 tables `topics`/`topic_votes`/`topic_submissions` are already live.)
- [ ] **Data collection is ON** (お題 text + anonymous install id go to Supabase). This MUST be
      declared in ASC App Privacy before public review — see Phase 5. TestFlight didn't need it; public does.

## Phase 2 — Build the app you will submit  (Claude can do: say "ship it")
- [x] Icon is already in place (Phase 0) — nothing to do here for the icon.
- [ ] **"ship it"** → commits, pushes, builds on the Mac over SSH, submits the .ipa to ASC via EAS.
      This is also the build that first ships the ads **preload-and-cache** fix + the 参加者・負けカウント
      feature — all built but not on TestFlight yet.
      Result: a new build appears in ASC → TestFlight after ~10–20 min processing.
- [ ] Smoke-test that build on TestFlight (age gate → each of the 6 games → settings).

## Phase 3 — Paid Apps agreement + IAP (needed for the ¥370 remove-ads purchase)
Business → Agreements: the **Paid Apps** agreement must be **Active** or IAP won't work / can't be reviewed.
- [ ] Tax forms (W-8BEN + Certificate of Foreign Status) — already submitted per STATE.
- [ ] **Complete banking** (add a bank account) so Paid Apps flips to Active.
- [ ] ASC → your app → **In-App Purchases** → create a **Non-Consumable**:
      - Product ID: **`app.kanpai.mvp.removeads`**  (must match `REMOVE_ADS_SKU` in `src/iap/iap.ts`)
      - Reference name: e.g. "広告を非表示" · Price: **¥370** (JP tier)
      - Localized display name + description (JP), add a review screenshot.
- [ ] Add a **Sandbox tester** (Users and Access → Sandbox) and test **buy + restore** on a build.
      (Dev builds unlock without the native module; a real StoreKit test needs the ASC product live.)
- [ ] The IAP is submitted **with** the app version the first time (attach it in Phase 6).

## Phase 4 — Listing metadata  (ASC → your app → the 1.0.0 version page)
- [ ] **Name:**「カンパイ！飲み会パーティーゲーム集」(already the app name).
- [ ] **Subtitle (30 chars):**「飲み会・宅飲みパーティーゲーム集」(keyword-carrying, per SPEC §9).
- [ ] **Keywords:** 飲み会,宅飲み,パーティー,ゲーム,山手線,王様,チンチロ,罰ゲーム,合コン,二次会 (100 chars, comma-sep, no spaces).
- [ ] **Description:** the pitch — 6 games in one, 買い切り (no subscription), offline pass-around, JP-native.
      Mention each game. No medical/【over-claims】.
- [ ] **Promotional text** (optional, editable without review).
- [ ] **Screenshots:** upload `store-assets/appstore_6.9/*` to the 6.9″ slot and `appstore_6.7/*` to
      the 6.7″ slot, in order 01→05. (6.9″ + 6.7″ is sufficient; older sizes auto-scale.)
- [ ] **App icon** shows from the build; **Support URL** + **Marketing URL**:
      https://taigamura.github.io/kanpai/terms.html (or a landing page).
- [ ] **Category:** Games → primary **Entertainment**/**Casual** (Games subcat). Secondary optional.
- [ ] **Copyright, contact info** (uses your ASC account; support email taigamura.dev@gmail.com).

## Phase 5 — Age rating + App Privacy (BOTH required before submit)
- [ ] **Age rating questionnaire** → answer so it lands on **17+**: declare
      "Alcohol, Tobacco, or Drug Use or References" = **Frequent/Intense** (the app references drinking).
      This matches the in-app 20歳以上 age gate. Expect **17+**.
- [ ] **App Privacy** (App → App Privacy → Edit): "Do you collect data?" **Yes**, then enter exactly
      what's in **`docs/app-privacy.md`**:
      - **User Content → Other User Content** (お題 + request text): collected, NOT linked, NOT tracking, App Functionality.
      - **Identifiers → User ID** (anon install id): collected, NOT linked, NOT tracking, App Functionality.
      - **Identifiers → Device ID** (AdMob): collected, NOT linked, **tracking = Yes**, Third-Party Advertising.
      - **Usage Data → Product Interaction** (AdMob): collected, NOT linked, **tracking = Yes**, Third-Party Advertising.
      - Diagnostics: leave unchecked (no remote crash SDK) unless AdMob requires it.
      - **Tracking (ATT):** "uses data for tracking" = Yes (AdMob). ATT prompt already ships via `expo-tracking-transparency`.
      - Do NOT declare on-device-only data (roster, custom 罰ゲーム, settings, purchase state).
      - Privacy Policy URL: https://taigamura.github.io/kanpai/terms.html

## Phase 6 — Attach build, compliance, submit
- [ ] On the **1.0.0** version page → **Build** → select the Phase 2 build.
- [ ] Attach the **`app.kanpai.mvp.removeads` IAP** to this version (first submission only).
- [ ] **Export compliance:** the app uses only standard HTTPS/exempt encryption → answer "No" to
      proprietary/non-exempt encryption (add `ITSAppUsesNonExemptEncryption=false` to keep it non-interactive on future builds).
- [ ] **Content rights / advertising identifier (IDFA):** answer **Yes** it uses IDFA → check "Serve
      advertisements within the app" (AdMob), and the ATT boxes.
- [ ] **App Review notes:** the app is 17+ alcohol-*referencing* but has NO forced drinking (every
      penalty offers a non-alcoholic out), NO 一気飲み mechanic; the 20歳以上 gate + EULA are shown on
      first launch. A demo account is not needed (offline, no login). Note the ¥370 IAP is remove-ads.
- [ ] **Submit for Review.** Choose manual or automatic release.

## Phase 7 — After submit
- [ ] Watch for **Metadata Rejected / needs info** (alcohol apps sometimes get age/marketing questions —
      the notes in Phase 6 pre-empt most).
- [ ] On **Approved** → release (or it auto-releases). Verify the live listing + a real purchase.
- [ ] Any code change after this = a new build via **"ship it"**, then attach the new build to the next version.

---

### Quick "what's blocking" summary
Screenshots ✅ · Icon ✅ (real, wired) · Ads ✅ (preload-cache fix, ship to verify) · Build ⚠️ ship latest ·
Paid Apps ⚠️ finish banking · IAP ⚠️ create in ASC · App Privacy ⚠️ enter per `app-privacy.md` ·
17+ questionnaire ⚠️ · Listing copy ⚠️.

> **Ads note:** two placements — interstitial between games + a bottom 320×50 banner. The code is
> correct. If ads don't show, it's environment, not wiring: Expo Go / web / plain simulator have no
> native ad module (use a dev-client or EAS build), and a brand-new AdMob account returns "no fill"
> for hours-to-days until payments/app-ads.txt are set up. A dev build uses Google TEST ids and WILL
> show both ads — that's the wiring check. **All iOS ad ids are now real** (interstitial + banner unit
> `…/9261864571`); nothing left to fill. Ship a build to verify both on device. See `docs/STATE.md` → "Ads".

---

# COPY-PASTE BLOCK — everything to enter in ASC

## Listing text
**App Name (≤30):**
カンパイ！飲み会パーティーゲーム集

**Subtitle (≤30):**
飲み会・宅飲みで盛り上がる6ゲーム

**Keywords (≤100, comma-separated, NO spaces):**
飲み会,宅飲み,パーティー,ゲーム,山手線,王様ゲーム,チンチロ,罰ゲーム,合コン,二次会,乾杯,飲みゲー,宴会,女子会,パーティーゲーム

**Promotional text (≤170):**
スマホ1台ですぐ乾杯。飲み会・宅飲みが盛り上がる6つのゲームを、準備いらずのオフラインで。買い切りで広告も消せます。

**Description:**
カンパイ！は、飲み会・宅飲みがそのまま盛り上がる、スマホ1台で遊べるパーティーゲーム集です。アプリを開いてすぐ、みんなでプレイできます。ネット接続もアカウント登録も不要です。

■ 収録ゲーム（全6種）
・山手線ゲーム：お題に沿って順番に答える定番ゲーム。
・ロシアンルーレット：スマホを回して、爆発した人が負け。
・ハイ&ロー：次のカードが上か下かを当てる。
・チンチロ：サイコロ3つの出目で勝負。
・キングスカップ：引いたカードごとにルールが発動。
・匿名アンケート：「誰が一番◯◯？」をこっそり投票して集計。

■ 特長
・準備いらずで即スタート。スマホを回して遊ぶオフライン専用です。
・無料でダウンロードでき、広告は¥370の買い切りで非表示にできます。月額課金は一切ありません。
・参加者を登録して、負けた回数を記録できます。
・自分だけの罰ゲームを追加・保存できます。

■ 安心して遊ぶために
・お酒を強制する演出はありません。負けても罰ゲームか、ソフトドリンクでOKです。
・一気飲みをあおる要素はありません。
・20歳以上の確認と、飲みすぎ注意のご案内を表示します。飲酒は自己責任、適量でお楽しみください。

対象年齢：17歳以上（飲酒に関する表現を含みます）。

## URLs / misc
- **Support URL:** https://taigamura.github.io/kanpai/terms.html
- **Marketing URL (optional):** https://taigamura.github.io/kanpai/terms.html
- **Privacy Policy URL:** https://taigamura.github.io/kanpai/terms.html
- **Support email:** taigamura.dev@gmail.com
- **Copyright:** 2026 Taiga Kimura
- **Primary category:** Games (Entertainment / Casual)
- **Age rating:** 17+ (Alcohol references = Frequent/Intense)

## In-App Purchase (Non-Consumable)
- **Product ID (must match code):** app.kanpai.mvp.removeads
- **Reference Name (internal):** 広告を非表示
- **Display Name (shown to user):** 広告を非表示
- **Description:** 動画・バナー広告をすべて非表示にします。買い切りで、月額課金はありません。
- **Price:** ¥370

## App Review notes (paste into "Notes")
本アプリは17歳以上向けで、飲酒に「言及」しますが、飲酒を強制する演出はありません。すべての罰は「罰ゲーム」または「ソフトドリンクでOK」で、アルコールを強制しません。一気飲みをあおる仕組みもありません。初回起動時に20歳以上確認と利用規約（免責事項含む）を表示します。完全オフラインで動作し、ログイン不要のためデモアカウントは不要です。¥370の買い切りアプリ内課金は「広告を非表示」にするものです。

## Export compliance
Uses standard HTTPS only, no proprietary/non-exempt encryption → answer "No".
(`ITSAppUsesNonExemptEncryption: false` is already set in app.json.)

## IDFA / advertising
Uses IDFA = Yes → check "Serve advertisements within the app" (AdMob) + the ATT boxes.
