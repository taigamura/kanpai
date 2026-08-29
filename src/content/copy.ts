// Single source of truth for every user-facing UI string in カンパイ！.
//
// The actual text lives in `content/copy.json` at the repo root — edit that file and the change
// is mirrored everywhere the string is used (reload / Fast Refresh picks it up; a production build
// bundles whatever the file said at build time). This module just loads it, types it, and offers
// `fmt` for the handful of strings with runtime placeholders.
//
// Game CONTENT lists (山手線 themes, アンケート questions, roster, penalties) intentionally stay in
// src/data/*.ts — this file is UI chrome (buttons, titles, labels, instructions, modal copy) only.
import data from '../../content/copy.json';

export const copy = data;

// Fill `{name}`-style placeholders in a template string. Missing keys collapse to ''.
// e.g. fmt(copy.chinchiro.seatN, { n: 3 }) => '3人目'
export function fmt(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : ''
  );
}
