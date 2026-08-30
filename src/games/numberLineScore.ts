// Pure scoring for 意思疎通ゲーム. Kept out of the component so it can be unit-tested.
//
// Given each player's secret number and the order the group guessed (small→large), the loser is
// the player whose guessed position is furthest from their true position (largest positional
// error). Ties break toward the larger number (deterministic). A round where every position is
// already correct is `perfect` and has no loser (全員成功).

export type NumberLineRow = {
  name: string;
  number: number;
  guessPos: number; // 0-indexed position in the group's guessed order
  err: number; // |guessPos - actualPos|
};

export type NumberLineOutcome = {
  actual: string[]; // names sorted ascending by number (the true order)
  rows: NumberLineRow[]; // one per guessed name, in guessed order
  perfect: boolean;
  loser: string | null;
};

export function computeNumberLineOutcome(
  roster: string[],
  numbers: Record<string, number>,
  ordered: string[],
): NumberLineOutcome {
  const actual = [...roster].sort((a, b) => (numbers[a] ?? 0) - (numbers[b] ?? 0));
  const rows: NumberLineRow[] = ordered.map((name, guessPos) => {
    const actualPos = actual.indexOf(name);
    return { name, number: numbers[name] ?? 0, guessPos, err: Math.abs(guessPos - actualPos) };
  });
  const perfect = rows.length > 0 && rows.every((r) => r.err === 0);
  let loser: string | null = null;
  if (!perfect && rows.length > 0) {
    loser = rows.reduce<NumberLineRow | null>(
      (worst, r) =>
        !worst || r.err > worst.err || (r.err === worst.err && r.number > worst.number) ? r : worst,
      null,
    )!.name;
  }
  return { actual, rows, perfect, loser };
}
