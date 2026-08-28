---
name: catchup
description: Restore full project context for カンパイ！ at the start of a fresh session. Reads docs/STATE.md (the live current-state handoff), SPEC.md, and docs/ROADMAP.md, then summarizes what the app is, what's built, and what's next. Use when opening this repo cold, when the user says "catch up" / "where were we" / "restore context", or before doing any work on カンパイ！.
---

# /catchup — restore カンパイ！ context

Every product and design decision for this app lives in the docs, not in chat history.
This skill reloads them so a fresh session can continue with zero loss.

## Steps

1. **Read `docs/STATE.md` FIRST** — the live current-state handoff: what is built/shipped right
   now, all ids/config, the ship pipeline, the Supabase お題 backend, and open decisions. This is
   the freshest doc and takes precedence when it and SPEC/ROADMAP disagree.
2. **Read `SPEC.md`** (repo root) — the resolved product spec: thesis, positioning, the v1 game
   roster, safeguards, monetization, tech, and what is explicitly out of scope.
3. **Read `docs/ROADMAP.md`** — the phased build order and the current status of each phase.
4. **Optionally skim `git log --oneline`** to see the most recent work.

Do NOT read the whole `src/` tree on catch-up — the docs above are authoritative. Open
source files only once the user names a concrete task.

## Then report, concisely

- **What it is:** one line (offline single-phone JP drinking-game bundle, カンパイ！).
- **Built so far:** the games and systems that are done (from ROADMAP's ✅ items).
- **Next / blocked:** the next unstarted work and anything waiting on the user's accounts
  (AdMob IDs, App Store Connect IAP, Terms page, screenshots).
- **Verification state:** typecheck / jest / bundle status if relevant.

Keep it tight — this is a restore, not a re-plan. End by asking what to work on, unless the
user already said.
