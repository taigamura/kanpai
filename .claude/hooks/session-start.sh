#!/usr/bin/env bash
# SessionStart hook: inject a live snapshot of ワイワイ！ (repo: kanpai) into every new session, so a
# fresh session starts from the current state instead of stale memory. Stdout becomes model context.
# Source of truth is docs/STATE.md → "## TL;DR"; keep that section current (/handoff does).
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

echo "=== ワイワイ！ (repo: kanpai) live state — from docs/STATE.md TL;DR ==="
awk '/^## TL;DR/{on=1; next} on && /^## /{exit} on && !/^<!--/ && !/^     / {print}' docs/STATE.md 2>/dev/null
echo
echo "=== git ==="
echo "branch: $(git branch --show-current 2>/dev/null)"
git log --oneline -5 2>/dev/null
dirty=$(git status --short 2>/dev/null | grep -v '^??' | head -10)
[ -n "$dirty" ] && { echo "uncommitted (tracked):"; echo "$dirty"; }
echo
echo "Full context: docs/STATE.md, SPEC.md, docs/ROADMAP.md (/catchup reads them). Update with /handoff."
exit 0
