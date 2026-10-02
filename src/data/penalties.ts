// 罰ゲーム = what the loser of any game does (a light, group-chosen dare).
//
// v1 DECISION (2026-08-27): ship NO built-in 罰ゲーム. The 罰ゲーム pool is entirely
// user-supplied — a penalty only appears once the group adds their own in 設定. This keeps
// the app from shipping/curating penalty content (nothing for App Review to object to) and
// makes every 罰ゲーム the group's own. Until one is added, the reveal prompts the group to
// decide one together (copy.penalty.empty).
export const DEFAULT_PENALTIES: string[] = [];
