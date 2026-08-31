# カンパイ！ — App Store submission runbook (v1.0.0)

Step by step to take カンパイ！ from "built" to "Submitted for Review" in App Store
Connect (ASC). Do the steps in order. Anything marked **Claude can do** = ask in a
session; everything else is manual in the ASC web UI.

**Single sources of truth (do not retype these into ASC from memory):**
- Listing text (name, subtitle, keywords, description, What's New): `docs/store-listing.md`
- App Privacy answers: `docs/app-privacy.md`
- Screenshots: `store-assets/appstore_6.9/` + `store-assets/appstore_6.7/` (6 each), `store-assets/instagram/` (IG, not for ASC)

**Key identifiers**
| | |
|---|---|
| Bundle id | `app.kanpai.mvp` |
| ASC Apple ID | `6805814337` |
| Listing name | カンパイ！飲み会パーティーゲーム集 |
| Min iOS | 16.4 |
| IAP (non-consumable) | `app.kanpai.mvp.removeads` @ **¥300** |
| Support email | taigamura.dev@gmail.com |
| Terms + Privacy URL | https://taigamura.github.io/kanpai/terms.html |
| Age rating | 17+ (alcohol references) |

---

## Phase 1 — Pre-flight (gates the submission; do first)

- [ ] **Paid Apps agreement is Active.** ASC → Business → Agreements. Tax forms
      (W-8BEN + Certificate of Foreign Status) are submitted; **finish banking** (add a
      bank account) so Paid Apps flips to **Active**. The IAP cannot be reviewed until this
      is Active. Until then the in-app buy button correctly shows「現在購入できません」.
- [ ] **Create the IAP.** ASC → your app → **In-App Purchases** → **Non-Consumable**:
      - Product ID: **`app.kanpai.mvp.removeads`** (must match `REMOVE_ADS_SKU` in `src/iap/iap.ts`)
      - Reference name: 広告を非表示 · Display name: 広告を非表示
      - Description: 動画・バナー広告をすべて非表示にします。買い切りで、月額課金はありません。
      - **Price: ¥300** (the app reads StoreKit's live price, so this tier is authoritative)
      - Add a review screenshot of the Settings buy button.
      - Add a **Sandbox tester** (Users and Access → Sandbox) and test buy + restore.
- [ ] **A reviewable build exists.** A build must be processed in ASC → TestFlight. The
      current shipped build is code-identical to `main`. Only ship a new one if code changed
      (see Phase 4).
- [ ] **(Recommended) `app-ads.txt` published.** Put it at `taigamura.github.io/app-ads.txt`
      (the USER-pages root, NOT `/kanpai/`) so AdMob can fill once live. Not a submission
      blocker, but blocks ad revenue after launch.
- [ ] **(If not done) Supabase schema.** Run `supabase/schema.sql` in the Supabase SQL editor
      so the home "ゲームをリクエスト" box logs. Not a blocker.

---

## Phase 2 — The submission, step by step in ASC

Go to ASC → **Apps → カンパイ！ → the 1.0.0 version page** and fill each section.

### Step 1 — Version + listing metadata
- [ ] Confirm the version is **1.0.0** (create it if needed).
- [ ] Paste **Name, Subtitle, Promotional text, Keywords, Description, What's New**
      from **`docs/store-listing.md`** into the **Japanese (ja)** localization. (JP-only app.)
- [ ] **Category:** Games → Entertainment / Casual.
- [ ] **Support URL** + **Marketing URL:** https://taigamura.github.io/kanpai/terms.html
      (or the `/kanpai/` landing page). **Copyright:** 2026 Taiga Kimura.

### Step 2 — Screenshots
- [ ] Upload `store-assets/appstore_6.9/AppStore_01…06*.png` to the **6.9″** slot and
      `store-assets/appstore_6.7/*` to the **6.7″** slot, in filename order **01 → 06**.
      (6.9″ + 6.7″ is sufficient; other sizes auto-scale.)
- [ ] The `store-assets/instagram/` files are for Instagram, **not** ASC. Do not upload them here.

### Step 3 — App icon
- [ ] The 1024² icon comes from the build automatically. Nothing to upload.

### Step 4 — Age rating (Apple's multi-step wizard, 7 steps)
**Step 1 (Features):** Parental Controls **NO** · Age Assurance **NO** (the 20歳以上 gate is
self-declared, not a verified mechanism) · Unrestricted Web Access **NO** · Social Media
**NO** · **User-Generated Content → depends on the shared お題 feature (see below)**.
**Steps 2–7 (Content):** everything **None** EXCEPT **Alcohol, Tobacco, or Drug Use or
References** = the frequent/intense level → lands on **17+**.

- [ ] **UGC decision.** The community 山手線 お題 (submit + shown to others + upvote) is
      user-generated content, and it is currently **ON** (`src/services/topicsConfig.ts` is
      populated). If UGC = YES, Apple **Guideline 1.2** requires filtering + report + block +
      contact, which the app does not have → likely rejection.
      - **For v1.0 (recommended):** blank `src/services/topicsConfig.ts` so お題 are
        local-only, **reship** (real code change → new build via "ship it"), then answer
        **UGC = NO** here AND drop "User Content" + the install-id "User ID" from App Privacy
        (Step 5). Re-enable sharing in a later version after adding report/block/filter.
      - **To keep sharing:** answer **UGC = YES** and first build the UGC safeguards
        (report/hide/block + basic filtering). More work.

### Step 5 — App Privacy
- [ ] App → **App Privacy** → Edit → "Do you collect data?" **Yes**, then enter **exactly**
      the data types in **`docs/app-privacy.md`**:
      User Content (お題/request text), User ID (anon install id), Device ID + Product
      Interaction (AdMob, tracking = Yes). ATT = Yes. Do NOT declare on-device-only data
      (roster, custom 罰ゲーム, settings, purchase state).
- [ ] Privacy Policy URL: https://taigamura.github.io/kanpai/terms.html

### Step 6 — Build + IAP
- [ ] On the 1.0.0 page → **Build** → select the Phase 1 build.
- [ ] Attach the **`app.kanpai.mvp.removeads`** IAP to this version (first submission only).

### Step 7 — App Review Information  ← the page with Sign-In / Contact / Notes
- [ ] **Sign-In Information: UNCHECK "Sign-in required".** The app is fully offline with no
      account or login, so the reviewer needs no credentials. Leaving it checked with blank
      fields stalls review.
- [ ] **Contact Information:** Taiga / Kimura · a reachable phone (with country code, e.g.
      +81…) · taigamura.dev@gmail.com.
- [ ] **Notes:** paste the review-note block at the bottom of this file (heads off the
      alcohol-app age/marketing questions).
- [ ] **Attachment:** leave empty (optional).

### Step 8 — Export compliance + IDFA
- [ ] **Export compliance:** standard HTTPS only → "No" to proprietary/non-exempt encryption.
      (`ITSAppUsesNonExemptEncryption: false` is already set in `app.json`, so this may not
      even prompt.)
- [ ] **Advertising identifier (IDFA):** **Yes** → check "Serve advertisements within the
      app" (AdMob) + the ATT boxes.

### Step 9 — Release option + Submit
- [ ] Choose **manual** or **automatic** release.
- [ ] **Submit for Review.**

---

## Phase 3 — After submit
- [ ] Watch for **Metadata Rejected / needs info** (alcohol apps sometimes get age/marketing
      questions; the Phase 2 Step 7 notes pre-empt most).
- [ ] On **Approved** → release (or it auto-releases). Verify the live listing + a real
      purchase of the ¥300 remove-ads IAP.

---

## Phase 4 — Shipping a code change later ("ship it")
Store-listing edits and screenshots do NOT need a new build (screenshots upload in the ASC
web UI; `eas submit` uploads only the `.ipa`). Only **source-code** changes need a build.
When they do: say **"ship it"** to run commit → push → Mac build → submit, then attach the
new build to the next version. **Claude can do** the build/submit; the ASC metadata steps
above stay manual.

---

## Copy-paste — App Review notes (Phase 2, Step 7)

```
This is a Japanese-only party-game collection, rated 17+ for alcohol references. It never forces drinking: every losing penalty can be a non-alcoholic dare (罰ゲーム), there is no "chug/one-shot" mechanic, and a 20+ age confirmation and EULA (with disclaimer) are shown on first launch. The app runs fully offline with no account or login, so no demo credentials are needed. The single in-app purchase (¥300, non-consumable) only removes ads.

本アプリは17歳以上向けで、飲酒に「言及」しますが、飲酒を強制する演出はありません。負けたときの罰はすべて「罰ゲーム」で代替でき、アルコールを強制しません。一気飲みをあおる仕組みもありません。初回起動時に20歳以上の確認と利用規約（免責事項を含む）を表示します。完全にオフラインで動作し、ログイン不要のため、レビュー用のデモアカウントは必要ありません。買い切りのアプリ内課金（¥300）は「広告を非表示」にするものです。
```

## Copy-paste — IAP (Phase 1)
```
Product ID:    app.kanpai.mvp.removeads   (must match src/iap/iap.ts)
Type:          Non-Consumable
Reference /
Display name:  広告を非表示
Description:   動画・バナー広告をすべて非表示にします。買い切りで、月額課金はありません。
Price:         ¥300
```

> Listing text (name/subtitle/keywords/description/What's New) is NOT duplicated here on
> purpose. It lives in `docs/store-listing.md` so it can't drift. Copy it from there.
