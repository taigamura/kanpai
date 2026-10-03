# ワイワイ！ (repo: kanpai)

Offline, pass-one-iPhone Japanese party-game bundle (8 games). Expo / React Native + TypeScript,
iPhone-only, bundle id `app.kanpai.mvp`. Renamed from カンパイ！ on 2026-10-02.

## Where the state lives
A SessionStart hook (`.claude/hooks/session-start.sh`) prints `docs/STATE.md` → `## TL;DR` plus
recent git into every session. For full context run `/catchup` (reads `docs/STATE.md`, `SPEC.md`,
`docs/ROADMAP.md`; STATE wins when they disagree). After meaningful work or a ship, run `/handoff`
so the TL;DR stays true.

## Hard rules
- **No drinking content, ever**: no 飲む mechanics, alcohol お題, beer/glass visuals, or
  飲み会/宅飲み/お酒 in store metadata. v1.0 build 16 was rejected under App Review 4.3(b) as a
  drinking-game app; the whole product was reframed to avoid that.
- **No em dashes in public-facing text** (store listing, terms page, in-app copy).
- **User-facing strings** live in `content/copy.json`; game content lists live in `src/data/*.ts`.
- **Shared お題 are UGC** (Guideline 1.2): keep the NG filter, report, and block paths working
  (`src/services/topics.ts`, `src/games/TopicsModal.tsx`, `supabase/schema.sql`).

## Commands
- Typecheck `npx tsc --noEmit` · tests `npx jest` · web preview `npm run web` (restart with
  `--clear` if Metro misses edits on WSL).
- Ship: "ship it" → `/ship-ios` (config `.claude/ship.json`; builds on the Mac over SSH, submits from WSL).
- App Store Connect API helper: `scripts/asc.py`.
