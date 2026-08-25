---
description: Restore カンパイ！ project context — read SPEC.md and docs/ROADMAP.md, then summarize state.
---

Read `SPEC.md` and `docs/ROADMAP.md` in this repo (they are the source of truth for every
product and design decision — do not rely on chat history). Optionally skim `git log --oneline`.

Then give a concise restored-context summary:
- **What it is** (one line)
- **Built so far** (ROADMAP ✅ items)
- **Next / blocked** (next work + anything waiting on the user's accounts: AdMob IDs,
  App Store Connect IAP, Terms page, screenshots)
- **Verification state** (typecheck / jest / bundle) if relevant

Do not read the full `src/` tree — open source files only once a concrete task is named.
Keep it tight; end by asking what to work on unless already told.
