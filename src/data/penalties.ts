// 罰ゲーム = the NON-alcoholic alternative activity a loser may choose instead of 飲む.
//
// v1 DECISION (2026-08-27): ship NO built-in 罰ゲーム. The 罰ゲーム pool is entirely
// user-supplied — a penalty only appears once the group adds their own in 設定. This keeps
// the app from shipping/curating penalty content (nothing for App Review to object to) and
// makes every 罰ゲーム the group's own. Until one is added, a loss offers the 飲む option
// only (soft drink is always OK), so the non-alcoholic out still exists via "飲まなくてOK".
export const DEFAULT_PENALTIES: string[] = [];
