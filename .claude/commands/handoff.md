---
description: Update ワイワイ！ (repo kanpai)'s handoff docs (docs/STATE.md, docs/ROADMAP.md, SPEC.md) so the next session's /catchup restores accurate context. The write-side counterpart to /catchup.
---

Read `.claude/skills/handoff/SKILL.md` and follow it exactly.

In short: gather ground truth from the repo (git log/status, the latest commit SHA, any build/submit
ids from this session, `tsc`/`jest` results, and the config files that the docs quote — ad unit ids,
IAP sku, app.json version, icon), then reconcile the three docs `/catchup` reads —
`docs/STATE.md` (primary), `docs/ROADMAP.md`, and `SPEC.md` — with that reality. Edit in place, never
fabricate build/submission/commit ids, and report which sections changed. Do not commit unless asked.
