import { describe, expect, it } from 'vitest';

import {
  addExpense,
  balances,
  CollabError,
  confirmSettlement,
  emptyCollab,
  invite,
  markSettled,
  paypalLink,
  pendingSettlements,
  removeExpense,
  setPlanB,
  settleUp,
  sharesOf,
  togglePlanB,
  type EventCollab,
} from '../src';

const NOW = new Date('2026-11-11T10:00:00Z');
const base = (): EventCollab => invite(emptyCollab('e', 'olivia'), 'olivia', ['chris', 'tom', 'mia'], NOW);
const all = ['olivia', 'chris', 'tom', 'mia'];

describe('shares', () => {
  it('always add up to the amount; leftover cents go to the payer first', () => {
    expect(sharesOf({ amount: 1000, paidBy: 'tom', split: { mode: 'equal', among: ['chris', 'tom', 'mia'] } })).toEqual(
      {
        chris: 333,
        tom: 334,
        mia: 333,
      },
    );
    for (const amount of [1, 7, 99, 1001, 123457]) {
      for (const split of [
        { mode: 'equal' as const, among: all },
        { mode: 'shares' as const, shares: { olivia: 1, chris: 2, tom: 3, mia: 1 } },
      ]) {
        const s = sharesOf({ amount, paidBy: 'olivia', split });
        expect(Object.values(s).reduce((a, b) => a + b, 0)).toBe(amount);
      }
    }
  });

  it('weights shares deterministically (largest remainder, then list order)', () => {
    expect(sharesOf({ amount: 100, paidBy: 'x', split: { mode: 'shares', shares: { a: 1, b: 1, c: 1 } } })).toEqual({
      a: 34,
      b: 33,
      c: 33,
    });
  });
});

describe('expenses, balances and settling up', () => {
  it('validates input and only lets members add', () => {
    const c = base();
    expect(() =>
      addExpense(c, 'gabi', { title: 'x', amount: 100, paidBy: 'chris', split: { mode: 'equal', among: all } }, NOW),
    ).toThrow(new CollabError('not-invited'));
    expect(() =>
      addExpense(c, 'chris', { title: 'x', amount: 0, paidBy: 'chris', split: { mode: 'equal', among: all } }, NOW),
    ).toThrow(new CollabError('invalid-input'));
    expect(() =>
      addExpense(
        c,
        'chris',
        { title: 'x', amount: 100, paidBy: 'chris', split: { mode: 'exact', amounts: { chris: 60, tom: 30 } } },
        NOW,
      ),
    ).toThrow(new CollabError('invalid-input'));
    expect(() =>
      addExpense(
        c,
        'chris',
        { title: 'x', amount: 100, paidBy: 'chris', split: { mode: 'equal', among: ['gabi'] } },
        NOW,
      ),
    ).toThrow(new CollabError('invalid-input'));
  });

  it('computes balances and a minimal transfer list that settles everything', () => {
    let c = base();
    c = addExpense(
      c,
      'olivia',
      { title: 'Grillgut', amount: 4800, paidBy: 'olivia', split: { mode: 'equal', among: all } },
      NOW,
    );
    c = addExpense(
      c,
      'tom',
      { title: 'Getränke', amount: 2350, paidBy: 'tom', split: { mode: 'equal', among: all } },
      NOW,
    );
    c = addExpense(
      c,
      'chris',
      { title: 'Kohle', amount: 899, paidBy: 'chris', split: { mode: 'equal', among: all } },
      NOW,
    );
    const bal = balances(c);
    expect(Object.values(bal).reduce((a, b) => a + b, 0)).toBe(0);
    expect(c.currency).toBe('EUR');
    const transfers = settleUp(bal);
    expect(transfers.length).toBeLessThanOrEqual(3);
    const after = { ...bal };
    for (const t of transfers) {
      after[t.from] = (after[t.from] ?? 0) + t.amount;
      after[t.to] = (after[t.to] ?? 0) - t.amount;
    }
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
    expect(settleUp(bal)).toEqual(transfers); // deterministic
  });

  it('a payment counts once both sides confirmed', () => {
    let c = addExpense(
      base(),
      'olivia',
      { title: 'Pizza', amount: 2000, paidBy: 'olivia', split: { mode: 'equal', among: ['olivia', 'chris'] } },
      NOW,
    );
    expect(balances(c).chris).toBe(-1000);
    c = markSettled(c, 'chris', { from: 'chris', to: 'olivia', amount: 1000 }, NOW);
    expect(pendingSettlements(c)).toHaveLength(1);
    expect(balances(c).chris).toBe(-1000);
    c = confirmSettlement(c, 'olivia', c.settlements![0]!.id, NOW);
    expect(balances(c).chris).toBe(0);
    expect(c.messages.at(-1)).toMatchObject({
      type: 'system',
      note: { kind: 'settled', from: 'chris', to: 'olivia', amount: 1000 },
    });
    expect(() => markSettled(c, 'tom', { from: 'chris', to: 'olivia', amount: 1 }, NOW)).toThrow(
      new CollabError('invalid-input'),
    );
  });

  it('only the payer or the host removes an expense', () => {
    const c = addExpense(
      base(),
      'tom',
      { title: 'x', amount: 500, paidBy: 'tom', split: { mode: 'equal', among: all } },
      NOW,
    );
    const id = c.expenses![0]!.id;
    expect(() => removeExpense(c, 'chris', id)).toThrow(new CollabError('not-host'));
    expect(removeExpense(c, 'olivia', id).expenses).toEqual([]);
  });

  it('builds PayPal.me links without ever paying in the app', () => {
    expect(paypalLink('ChrisDemo', 1240, 'EUR')).toBe('https://paypal.me/ChrisDemo/12.40EUR');
    expect(() => paypalLink('chris demo', 1, 'EUR')).toThrow(new CollabError('invalid-input'));
  });
});

describe('plan B', () => {
  it('the host sets and switches plan B; everyone sees a note', () => {
    let c = base();
    expect(() => setPlanB(c, 'chris', { outdoor: true, location: 'Café' })).toThrow(new CollabError('not-host'));
    c = setPlanB(c, 'olivia', { outdoor: true, location: ' Café Lindner ' });
    expect(c.planB).toEqual({ location: 'Café Lindner', active: false });
    c = togglePlanB(c, 'olivia', NOW);
    expect(c.planB?.active).toBe(true);
    expect(c.messages.at(-1)).toMatchObject({ note: { kind: 'plan-b', location: 'Café Lindner' } });
    expect(togglePlanB(c, 'olivia', NOW).planB?.active).toBe(false);
    expect(setPlanB(c, 'olivia', { outdoor: false, location: '' }).planB).toBeUndefined();
  });
});
