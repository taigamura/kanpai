---
name: catchup
description: Restore full project context for ワイワイ！ (formerly カンパイ！; repo `kanpai`) at the start of a fresh session. Reads docs/STATE.md (the live current-state handoff), SPEC.md, and docs/ROADMAP.md, then summarizes what the app is, what's built, and what's next. Use when opening this repo cold, when the user says "catch up" / "where were we" / "restore context", or before doing any work on ワイワイ！/カンパイ！.
---

# /catchup — restore ワイワイ！ context

Every product and design decision for this app lives in the docs, not in chat history.
This skill reloads them so a fresh session can continue with zero loss. (A SessionStart hook
already prints STATE.md's TL;DR + recent git into every session; /catchup is the full read.)

## Steps

1. **Read `docs/STATE.md` FIRST** — the live current-state handoff: what is built/shipped right
   now, all ids/config, the ship pipeline, the Supabase お題 backend, recent UI work, and open
   decisions. This is the freshest doc and takes precedence when it and SPEC/ROADMAP disagree.
   Its later sections cover the **UI Studio** (browser slider + arrow-comment tool), the **iPhone
   web frame**, **swipe-back nav**, the **ChatterGround** (drifting riso speech bubbles; the old beer-foam header is gone), and the shared **RuleCard** style —
   note these so you can iterate on UI the fast way instead of blind code round-trips.
2. **Read `SPEC.md`** (repo root) — the resolved product spec: thesis, positioning, the v1 game
   roster, safeguards, monetization, tech, and what is explicitly out of scope.
3. **Read `docs/ROADMAP.md`** — the phased build order and the current status of each phase.
4. **Optionally skim `git log --oneline`** to see the most recent work.

Do NOT read the whole `src/` tree on catch-up — the docs above are authoritative. Open
source files only once the user names a concrete task.

**UI iteration loop (know this before touching any screen):** the real app runs in the browser via
`npm run web` (react-native-web) inside an iPhone-sized frame, with a dev-only **🎛 Studio** panel
(bottom-right) for live-tuning theme tokens (font/spacing/radius/colors) and dropping arrow-comments
on components. Token overrides apply on **Apply → reload**. This is the preferred way to preview and
fine-tune UI. Native-only modules (ads/iap/audio) have `.web.ts` stubs so web bundles cleanly — any
new native-only module needs one too. Full details + gotchas are in `docs/STATE.md`.

## Then report, concisely

- **What it is:** one line (offline single-phone JP party-game bundle, ワイワイ！). Never describe it
  as a drinking app: drinking content was removed after the 4.3(b) rejection and must stay out.
- **Built so far:** the games and systems that are done (from ROADMAP's ✅ items), plus recent UI
  work (UI Studio, iPhone web frame, swipe-back, riso speech-bubble ground, boxed RuleCard rules).
- **How to iterate on UI:** one line — `npm run web` + the 🎛 Studio panel for live token tuning and
  arrow-comments (see STATE.md). Mention this whenever the task is UI-facing.
- **Next / blocked:** the next unstarted work and anything waiting on the user's accounts
  (AdMob IDs, App Store Connect IAP, Terms page, screenshots).
- **Verification state:** typecheck / jest / bundle status if relevant.

Keep it tight — this is a restore, not a re-plan. End by asking what to work on, unless the
user already said.

## Counterpart: /handoff (keep these docs fresh)

`/catchup` only works if the docs it reads are current. The **write-side counterpart is `/handoff`**
(`.claude/skills/handoff/SKILL.md`): it reconciles `docs/STATE.md`, `docs/ROADMAP.md`, and `SPEC.md`
with the actual repo state (git, build/submission ids, config, tsc/jest). Run `/handoff` at the end
of a work session or after a "ship it" so the NEXT `/catchup` restores accurate context.
