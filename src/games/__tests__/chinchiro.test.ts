// Pure scoring logic for チンチロ, mirrored from ChinchiroGame's evaluate().
// Kept here as a standalone spec so the role ranking can't silently regress.
type Kind = 'good' | 'normal' | 'bad';
function evaluate(dice: [number, number, number]): { label: string; score: number; kind: Kind } {
  const [a, b, c] = [...dice].sort((x, y) => x - y);
  if (a === 1 && b === 1 && c === 1) return { label: 'ピンゾロ', score: 70, kind: 'good' };
  if (a === b && b === c) return { label: `${a}のアラシ`, score: 50 + a, kind: 'good' };
  if (a === 4 && b === 5 && c === 6) return { label: 'シゴロ', score: 45, kind: 'good' };
  if (a === 1 && b === 2 && c === 3) return { label: 'ヒフミ', score: -2, kind: 'bad' };
  if (a === b || b === c) {
    const point = a === b ? c : a;
    return { label: `${point}の目`, score: point, kind: 'normal' };
  }
  return { label: '目なし', score: -1, kind: 'bad' };
}

describe('チンチロ evaluate', () => {
  it('ranks ピンゾロ above every アラシ', () => {
    expect(evaluate([1, 1, 1]).score).toBeGreaterThan(evaluate([6, 6, 6]).score);
  });
  it('scores シゴロ as a winning role', () => {
    expect(evaluate([4, 5, 6].sort() as [number, number, number]).kind).toBe('good');
  });
  it('reads a pair as its point value', () => {
    expect(evaluate([2, 5, 2])).toMatchObject({ score: 5, kind: 'normal' });
  });
  it('makes ヒフミ the worst roll', () => {
    expect(evaluate([1, 2, 3]).score).toBeLessThan(evaluate([1, 4, 6]).score);
  });
  it('treats no-pair as 目なし', () => {
    expect(evaluate([1, 3, 6]).label).toBe('目なし');
  });
});
