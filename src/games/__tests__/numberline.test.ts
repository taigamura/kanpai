import { computeNumberLineOutcome } from '../numberLineScore';

describe('意思疎通 outcome', () => {
  const roster = ['A', 'B', 'C'];

  it('flags a perfect order with no loser', () => {
    const numbers = { A: 10, B: 50, C: 90 };
    const out = computeNumberLineOutcome(roster, numbers, ['A', 'B', 'C']);
    expect(out.perfect).toBe(true);
    expect(out.loser).toBeNull();
    expect(out.actual).toEqual(['A', 'B', 'C']);
  });

  it('names the most-misplaced player as the loser', () => {
    // True order A(10) < B(50) < C(90). Group guessed C, B, A (fully reversed).
    const numbers = { A: 10, B: 50, C: 90 };
    const out = computeNumberLineOutcome(roster, numbers, ['C', 'B', 'A']);
    expect(out.perfect).toBe(false);
    // A and C both have error 2; B has error 0. Tie breaks toward the larger number → C.
    expect(out.loser).toBe('C');
  });

  it('picks the single worst when errors differ', () => {
    // True order A(5) < B(40) < C(60). Guess B, A, C → A off by 1, B off by 1, C correct.
    const numbers = { A: 5, B: 40, C: 60 };
    const out = computeNumberLineOutcome(roster, numbers, ['B', 'A', 'C']);
    // A err 1 (num 5), B err 1 (num 40) → tie broken by larger number → B.
    expect(out.loser).toBe('B');
  });

  it('handles an empty order defensively', () => {
    const out = computeNumberLineOutcome(roster, { A: 1, B: 2, C: 3 }, []);
    expect(out.perfect).toBe(false);
    expect(out.loser).toBeNull();
  });
});
