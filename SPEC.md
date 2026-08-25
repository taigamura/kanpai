# カンパイ！ — Product Spec (v1)

> 飲み会・宅飲みパーティーゲーム集 — an offline, single-phone (pass-around) Japanese drinking-game bundle.
> 100% on-device. Zero server. Zero per-user cost.

This spec is the resolved output of a grilling session (2026-08-25). Every decision below was
made deliberately; the "Why" lines exist so future-me doesn't relitigate them.

---

## 1. Thesis (why this app exists)

The JP App Store party-game space splits into three ponds:
- **Online / multi-device** party bundles (Dokopa 4.62★/38k, ワードウルフ 195k) — server-backed, clean (9+).
- **Roulette / decision utilities** (54k, 46k, 45k) — tools, not game bundles.
- **Offline single-phone drinking bundles** — *fragmented, no incumbent above ~2,600 reviews.*

We fish the **third pond**. No offline single-phone group drinking-bundle app has 5,000+ reviews;
the leader (王様ゲーム! by Chouic, 2,582) is (a) foreign-built and repeatedly dinged as
"過激すぎて for real 合コン", and (b) hated for paywall-repeat fatigue. Picolo (the famous brand)
is stale since 2023 and its reviews are dominated by 週500円 subscription-scam complaints.

The market named the winning axis in its own reviews: **JP-native tone + honest 買い切り pricing
+ instant offline pass-around + breadth.**

**Honest ceiling:** a respected ~500–2,500-review niche cashflow app, not a breakout. Near-zero
running cost makes that a good trade. Not a venture outcome.

---

## 2. Positioning

- **Pure drinking, no scene-switcher.** One flat bundle. (Considered a per-scene tone system;
  cut for v1 simplicity. Differentiation now rests on **breadth + tone quality + honest pricing**.)
- **Drinking-native, 17+, but NO 下ネタ in v1.** Own the `飲み会ゲーム` search itch and the
  "loser drinks" framing. Accept the 17+ label (Apple rates any alcohol-referencing app 17+
  regardless). Spicy 下ネタ content is the **v2 upgrade hook**, arriving with 王様ゲーム.

## 3. Differentiation wedge (ranked)

1. **Breadth** — many games in one curated bundle. The bundle *is* the pitch. (Primary.)
2. JP-native tone quality (no foreign-translated cringe).
3. Honest pricing: 買い切り, no subscription — direct shot at Picolo's "詐欺" reviews.
4. Custom 罰ゲーム (editable + saved) — fixes キングスカップ's top complaint.

---

## 4. v1 game roster (6 games) — anchor: 山手線ゲーム

| # | Game | Mechanic | Build weight | Needs roster? |
|---|------|----------|-------------|---------------|
| 1 | **山手線ゲーム** (anchor) | Name items in a category in rhythm; fail/repeat → loser | Low | Optional |
| 2 | **ロシアンルーレット / 爆弾パス** | Pass phone; "explodes" on random person after timer | Low–Med | Optional |
| 3 | **高低 / High&Low** | Guess next card higher/lower; wrong → loser | Low | No |
| 4 | **チンチロ** | 3-dice JP drinking dice; score by roll | Med–High | Optional |
| 5 | **キングスカップ** | Draw card → each card is a rule/action | Med | Optional |
| 6 | **匿名アンケート**（押したの誰だ風） | "誰が一番◯◯?" everyone votes secretly → reveal tally | Med | **Yes** |

**Anchor rationale:** 山手線ゲーム is clean, instantly understood, tiny to build, and carries no
下ネタ moderation burden — the right thing to lead a first ship with. 王様ゲーム (the spicy,
content-heavy, moderation-prone anchor) is deferred to v2.

---

## 5. Harm / liability safeguards (all v1)

- **飲む or 罰ゲーム — drinking is NEVER forced.** Every penalty offers a non-alcoholic out
  (soft drink / 罰ゲーム). This single design rule removes the coercion that creates exposure.
- **No 一気飲み / chugging / volume / speed mechanics.** (一気飲み has killed people in Japan.)
- **Gentle responsible-drinking notice** at session start / between rounds
  (「飲みすぎ注意・体調と相談して」).
- **20歳以上確認 age gate** on first launch + **Terms/EULA** with 飲酒は自己責任・適量,
  no-liability clause. Shown once, linked in Settings.

> Not legal advice — the EULA wording is standard-practice and should get a lawyer's eye before
> a serious scale-up. But the stack above is what responsible drinking-game apps ship and what
> App Review expects for a 17+ alcohol app.

---

## 6. Monetization

- **Free download** (max reach; break the 0-download streak).
- **Light ads** (AdMob) — unobtrusive interstitial between games, never mid-round.
- **¥370 one-time 買い切り IAP** → removes ads (+ becomes the container for future unlocks).
- Explicitly **no subscription.** ("週500円詐欺" is Picolo's grave.)

## 7. Tech

- **Expo (React Native) + TypeScript.** Reuses the existing EAS / ship-ios pipeline.
- **100% on-device.** No backend, no network except the ad SDK. AsyncStorage for roster,
  custom 罰ゲーム, settings, IAP entitlement.
- Ads: `react-native-google-mobile-ads`. IAP: RevenueCat or Expo StoreKit (TBD in build).
- **Analytics:** Apple App Store Connect App Analytics + a crash reporter only. No extra
  tracking SDK beyond what AdMob requires. Clean privacy labels.
- **ATT:** AdMob triggers an App Tracking Transparency prompt + privacy-manifest work.

## 8. Shared UX

- **Player roster:** entered once at session start (quick-add, remembered via AsyncStorage,
  editable). Games that don't need names (高低/チンチロ) let you skip straight in.
- **Pass-around ritual** must be flawless: for 匿名アンケート, secret vote + tap-to-hide + reveal.
- **準備要らずで即スタート** is a hard requirement — the most-praised trait of liked incumbents.

## 9. Language / branding

- **Japanese only.** No i18n framework (matches the JP-native wedge).
- **Name:** カンパイ！  **Subtitle:** 飲み会・宅飲みパーティーゲーム集
  - ✅ Name verified on JP App Store (2026-08-26): **no drinking-game named カンパイ exists.**
    Only near-match is "カンパイ! - 飲酒量記録" (a tiny 2-rating Health & Fitness drink-*tracker*,
    different genre); the rest are 乾杯-kanji water-reminder / wedding-speech / shop apps.
    Home-screen name stays カンパイ！; **App Store listing title carries keywords for ASO +
    differentiation:** `カンパイ！飲み会・宅飲みパーティーゲーム`.

---

## 10. Explicitly OUT of v1 (→ v2+)

- 王様ゲーム + spice tiers (マイルド / ノーマル / ハード) + 下ネタ packs — the paid upgrade.
- Per-scene tone switcher (合コン / 宅飲み / 会社 / カップル / 女子会).
- Full content editors (お題 / rules / 山手線 themes) — v1 ships custom 罰ゲーム only.
- i18n / English.
- Any online/multiplayer/sync — permanently out; the offline thesis is the whole moat.

## 11. Definition of done (v1)

- 6 games playable end-to-end, offline, from a cold launch in < 15s to first game.
- Age gate + EULA + responsible-drinking notice wired.
- Shared roster with quick-add + persistence.
- Custom 罰ゲーム add/save.
- Ads + ¥370 remove-ads IAP working; entitlement persists.
- Passes App Review as 17+ with alcohol reference.
- JP copy proofread; no em dashes in user-facing JP text.
