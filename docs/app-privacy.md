# カンパイ！ — App Store Connect "App Privacy" answers

Reference for filling the **App Privacy** questionnaire in App Store Connect
(App → App Privacy → Edit). Must be accurate before submitting a build for
**public** review. TestFlight does not require it, but keep it in sync anyway.

This build collects data from **two** sources: the AdMob ad SDK, and the shared
"みんなのお題" (山手線) feature on Supabase. Everything below reflects the shipped
build (`topicsConfig.ts` is populated → sharing is ON).

---

## Summary to enter

**"Do you or your third-party partners collect data from this app?" → Yes.**

Then declare the following data types. For each, ASC asks three things:
(a) **Linked to the user's identity?** (b) **Used to track?** (c) **Purposes.**

### 1. User Content  →  "Other User Content"
- **What:** the 山手線 お題 text a user types and submits/shares (free-text they author).
- **Collected?** Yes.
- **Linked to identity?** **No.** (No account, name, email, or device identity is
  attached — only an anonymous app-generated id, see #2.)
- **Used for tracking?** **No.**
- **Purposes:** **App Functionality** (sharing お題 with other players). *(Optionally
  also "Analytics" — the vote/submission aggregate is used to understand which お題
  are popular. If you check Analytics, keep it un-linked and non-tracking.)*

### 2. Identifiers  →  "User ID"
- **What:** an anonymous, app-generated random install id (e.g. `k_lz9f_ab12cd34`).
  It exists only to de-duplicate votes/submissions. It is **not** the device IDFA/IDFV,
  and is **not** tied to any account or personal detail.
- **Collected?** Yes (sent only when the user submits or upvotes an お題).
- **Linked to identity?** **No.**
- **Used for tracking?** **No.**
- **Purposes:** **App Functionality** (one-vote-per-install / prevent duplicates).

### 3. Identifiers  →  "Device ID"   *(AdMob)*
- **What:** advertising identifier / device id used by Google AdMob to serve ads.
- **Collected?** Yes (by the AdMob SDK).
- **Linked to identity?** No.
- **Used for tracking?** **Yes.** (Advertising across apps — this is why the app
  shows the App Tracking Transparency prompt.)
- **Purposes:** **Third-Party Advertising.**

### 4. Usage Data  →  "Product Interaction"   *(AdMob)*
- **What:** ad impressions/clicks and related interaction signals collected by AdMob.
- **Collected?** Yes (by the AdMob SDK).
- **Linked to identity?** No.
- **Used for tracking?** **Yes.**
- **Purposes:** **Third-Party Advertising** (and Analytics, if you wish).

### 5. Diagnostics  →  "Crash Data" / "Performance Data"   *(only if applicable)*
- The app ships an in-app ErrorBoundary but **no remote crash reporter** is wired
  (no Sentry/Crashlytics). AdMob may collect some diagnostics. If you have not added
  a crash SDK, you can leave Diagnostics **unchecked** unless AdMob's own disclosures
  require it. Re-check this if you later add Sentry/Crashlytics.

---

## Tracking (ATT) section
Because AdMob (#3, #4) is used for cross-app advertising, the app **does track**.
Ensure "This app uses data for tracking" reflects the AdMob usage, and keep the
ATT prompt (already implemented in `App.tsx` via `expo-tracking-transparency`).

The お題 data (#1, #2) is **not** tracking and must stay un-linked / non-tracking.

## What is NOT collected (still on-device only)
Player roster names, custom 罰ゲーム, settings, and the remove-ads purchase state
never leave the device. Do **not** declare these.

## If you disable sharing later
Blanking `src/services/topicsConfig.ts` and reshipping removes #1 and #2 entirely
(no お題 text, no install id leaves the device). If you do that, update this file and
the App Privacy questionnaire to drop those two data types.
