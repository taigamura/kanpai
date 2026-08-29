// UI Studio — runtime token override bridge (web + __DEV__ only).
//
// The Studio panel (src/studio/) writes token overrides to localStorage. This module reads
// them at MODULE LOAD and Object.assigns them onto the live token objects in theme.ts BEFORE
// any screen's StyleSheet.create() captures a value — that is what lets sliders retune the real,
// unmodified app screens with pixel-exact fidelity after an Apply→reload.
//
// Import-safe on native: every web-only API (localStorage) is guarded behind Platform.OS.
import { Platform } from 'react-native';

export const STUDIO_KEY = 'kanpai:studio';

export type StudioComment = {
  id: string;
  route: string; // route name the comment was drawn on
  // normalized viewport coords (0..1) so arrows track across window sizes
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  ts: number;
};

export type StudioTokenOverrides = {
  colors?: Record<string, string>;
  spacing?: Record<string, number>;
  radius?: Record<string, number>;
  font?: Record<string, number>;
};

export type StudioState = {
  tokens?: StudioTokenOverrides;
  comments?: StudioComment[];
};

export function isStudioEnv(): boolean {
  return Platform.OS === 'web' && typeof __DEV__ !== 'undefined' && __DEV__;
}

function ls(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return (globalThis as unknown as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStudioState(): StudioState {
  const store = ls();
  if (!store) return {};
  try {
    const raw = store.getItem(STUDIO_KEY);
    return raw ? (JSON.parse(raw) as StudioState) : {};
  } catch {
    return {};
  }
}

export function writeStudioState(state: StudioState): void {
  const store = ls();
  if (!store) return;
  try {
    store.setItem(STUDIO_KEY, JSON.stringify(state));
  } catch {
    /* quota / disabled — ignore */
  }
}

// Called from theme.ts at module load, after the pristine token objects are built.
export function applyTokenOverrides(
  colors: Record<string, unknown>,
  spacing: Record<string, unknown>,
  radius: Record<string, unknown>,
  font: Record<string, unknown>,
): void {
  const o = readStudioState().tokens;
  if (!o) return;
  if (o.colors) Object.assign(colors, o.colors);
  if (o.spacing) Object.assign(spacing, o.spacing);
  if (o.radius) Object.assign(radius, o.radius);
  if (o.font) Object.assign(font, o.font);
}
