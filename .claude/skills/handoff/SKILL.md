---
name: handoff
description: Reconcile ワイワイ！'s (formerly カンパイ！; repo `kanpai`) handoff docs (docs/STATE.md, docs/ROADMAP.md, SPEC.md) with the ACTUAL current state of the repo, so the next session's /catchup restores accurate context. This is the WRITE-side counterpart to the read-side /catchup. Use at the end of a work session, after a "ship it", or whenever the user says "update the handoff / state / checklist", "write the handoff", "sync the docs", or "make catchup current".
---

# /handoff — update ワイワイ！'s state docs so /catchup stays accurate

**Always rewrite `docs/STATE.md` → `## TL;DR` last.** The SessionStart hook
(`.claude/hooks/session-start.sh`) prints exactly that section into every new session, so it must
state the current app, review status, and next step in a few bullets.

`/catchup` READS three docs to restore context: `docs/STATE.md` (freshest, wins on conflict),
`SPEC.md`, `docs/ROADMAP.md`. This skill WRITES them back into agreement with reality. Every
product/design decision for this app lives in these docs, not in chat history, so a stale doc
means the next session starts wrong. Keep them true.

**Golden rule: ground every claim in the repo, never in memory or this chat.** If you can't verify
it from git / files / a tool result, don't write it. Do not invent build numbers, submission ids,
commit SHAs, or "shipped" status — read them.

## Step 1 — Gather ground truth (read before you write)

Run/read enough to know what actually changed since the docs were last updated:

- `git log --oneline -15` and `git status --short` — what landed, what's uncommitted, what's
  untracked-on-purpose (e.g. `store-assets/`, `.ralph/`).
- `git log --oneline -1 origin/main` (or the current branch) — the real latest commit SHA.
- If a build/submit happened this session, capture the **exact** ipa filename, EAS submission id,
  and commit SHA from the ship output (see `/ship-ios`). Never approximate these.
- `npx tsc --noEmit` and `npx jest` — record the real pass/fail for the "Verification" footer.
- Config that the docs quote verbatim — read the file, don't trust the doc:
  - `app.json` → version, `iosAppId`, plugins.
  - `src/ads/ads.ts` (`REAL_INTERSTITIAL`), `src/ads/BannerAdSlot.tsx` (`REAL_BANNER`) → ad unit ids.
  - `src/iap/iap.ts` (`REMOVE_ADS_SKU`), `src/services/topicsConfig.ts` (Supabase on/off).
  - `assets/icon.png` (real vs placeholder), `.claude/ship.json` (build server, pipeline).
- Skim `src/` only for features you know changed this session — don't re-audit the whole tree.

## Step 2 — Reconcile `docs/STATE.md` (the primary handoff doc)

STATE.md is a LIVING doc — edit in place, do not append a new dated blob at the top. Bring these
parts current:

- **`_Last updated …`** line → today's date + a 3-word tag of the session's work.
- **TL;DR** → what the latest shipped build contains (SHA + submission id + ipa name if a ship
  happened), and explicitly whether anything is "built but not yet shipped." If everything is
  shipped, say so.
- **Identifiers** → any id that changed (new ad unit, new version, etc.).
- **Ship pipeline → TestFlight builds** line → add the new build with its date + SHA + submission id.
- **Per-feature sections** → flip section headers from `BUILT (date)` to `SHIPPED (date, build <sha>)`
  once that work is in a submitted build; drop "not yet device-tested" once it ships.
- **Remaining to launch** checklist → check off what's now done; leave real blockers (IAP/ASC,
  listing, App Privacy) as-is unless they actually moved.
- **Verification at handoff** footer → the real tsc/jest result, the landed SHA/PR, the ship
  submission id, and which untracked files were intentionally left uncommitted.

## Step 3 — Reconcile `docs/ROADMAP.md`

- Mark phase items `✅` when the code proves them done; add a one-line note with the mechanism/file.
- Keep the "Known placeholders" section as a RESOLVED LOG (✅ each once fixed) rather than deleting
  it — future sessions use it to see what was once open.
- Add newly-shipped features under the right phase with date + file pointer.

## Step 4 — Reconcile `SPEC.md` (only real changes)

SPEC is the resolved PRODUCT spec, not a changelog. Touch it ONLY when a product decision or a
tech fact actually changed (e.g. a new ad placement, IAP library decided, a scope move). Update the
specific line; don't restyle the doc. Preserve the "Why" rationale lines. **No em dashes in any
user-facing text** the SPEC quotes (listing copy etc.) — colon/comma/period instead. (Internal doc
prose may use them.)

## Step 5 — Report + notify

- Give the user a tight bullet list of exactly which sections/files you changed and the key facts
  you wrote (SHA, submission id, statuses flipped).
- If you found a doc claim that reality contradicted (e.g. "placeholder icon" but the icon is real),
  call it out — that drift is the whole point of this skill.
- Do NOT commit automatically. Leave the doc edits in the working tree unless the user says to
  commit (or a subsequent "ship it" will carry them).

## Guardrails

- Never fabricate build/submission/commit identifiers — read them from tool output.
- Don't delete history/rationale; update status in place.
- If tsc/jest fail, WRITE that they fail (with the error) — a green footer over a red tree is a lie.
- Keep STATE.md the single freshest source; if STATE and SPEC/ROADMAP disagree after your pass,
  STATE wins and you should have fixed the other two.
