import {
  COLLAB_LIMITS,
  CollabError,
  nextId,
  type EventCollab,
  type Expense,
  type ExpenseSplit,
  type Settlement,
} from './model';
import { memberIds } from './rsvp';

/**
 * Cost split (docs/product/features/costs.md): tracking only, no payments. All amounts are integer cents;
 * rounding is deterministic so every device computes the same result.
 */

export const expensesOf = (c: EventCollab): Expense[] => c.expenses ?? [];
export const settlementsOf = (c: EventCollab): Settlement[] => c.settlements ?? [];

/** Splits `amount` by weights with the largest-remainder method; ties go by list order (deterministic). */
function byWeights(amount: number, ids: readonly string[], weights: readonly number[]): Record<string, number> {
  const total = weights.reduce((a, b) => a + b, 0);
  const raw = ids.map((_, i) => (amount * (weights[i] ?? 0)) / total);
  const out = raw.map(Math.floor);
  let rest = amount - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const { i } of order) {
    if (rest <= 0) break;
    out[i] = (out[i] ?? 0) + 1;
    rest -= 1;
  }
  return Object.fromEntries(ids.map((id, i) => [id, out[i] ?? 0]));
}

/**
 * What each person owes for one expense. Equal split: leftover cents go to the payer first (they already
 * paid), then in list order – the shares always add up to the amount exactly.
 */
export function sharesOf(e: Pick<Expense, 'amount' | 'paidBy' | 'split'>): Record<string, number> {
  const s = e.split;
  if (s.mode === 'exact') return { ...s.amounts };
  if (s.mode === 'shares') {
    const ids = Object.keys(s.shares);
    return byWeights(
      e.amount,
      ids,
      ids.map((id) => s.shares[id] ?? 0),
    );
  }
  const ids = [...s.among];
  const base = Math.floor(e.amount / ids.length);
  let rest = e.amount - base * ids.length;
  const out: Record<string, number> = Object.fromEntries(ids.map((id) => [id, base]));
  const order = ids.includes(e.paidBy) ? [e.paidBy, ...ids.filter((id) => id !== e.paidBy)] : ids;
  for (const id of order) {
    if (rest <= 0) break;
    out[id] = (out[id] ?? 0) + 1;
    rest -= 1;
  }
  return out;
}

function checkSplit(c: EventCollab, amount: number, split: ExpenseSplit) {
  const members = memberIds(c);
  const ids =
    split.mode === 'equal'
      ? split.among
      : split.mode === 'shares'
        ? Object.keys(split.shares)
        : Object.keys(split.amounts);
  if (ids.length === 0 || new Set(ids).size !== ids.length || ids.some((id) => !members.includes(id)))
    throw new CollabError('invalid-input');
  if (split.mode === 'shares' && Object.values(split.shares).some((w) => !Number.isInteger(w) || w < 1 || w > 99))
    throw new CollabError('invalid-input');
  if (split.mode === 'exact') {
    const values = Object.values(split.amounts);
    if (values.some((v) => !Number.isInteger(v) || v < 0) || values.reduce((a, b) => a + b, 0) !== amount)
      throw new CollabError('invalid-input');
  }
}

export function addExpense(
  c: EventCollab,
  by: string,
  input: { title: string; amount: number; paidBy: string; split: ExpenseSplit },
  now: Date,
): EventCollab {
  const members = memberIds(c);
  if (!members.includes(by)) throw new CollabError('not-invited');
  const title = input.title.trim();
  if (title.length === 0 || title.length > COLLAB_LIMITS.title) throw new CollabError('invalid-input');
  if (!Number.isInteger(input.amount) || input.amount < 1 || input.amount > COLLAB_LIMITS.amount)
    throw new CollabError('invalid-input');
  if (!members.includes(input.paidBy)) throw new CollabError('invalid-input');
  checkSplit(c, input.amount, input.split);
  const expense: Expense = {
    id: nextId('exp', expensesOf(c), now),
    title,
    amount: input.amount,
    paidBy: input.paidBy,
    split: input.split,
    createdAt: now,
  };
  return { ...c, currency: c.currency ?? 'EUR', expenses: [...expensesOf(c), expense] };
}

/** Only the payer or the host removes an expense. */
export function removeExpense(c: EventCollab, by: string, id: string): EventCollab {
  const e = expensesOf(c).find((x) => x.id === id);
  if (!e) throw new CollabError('not-found');
  if (e.paidBy !== by && c.hostId !== by) throw new CollabError('not-host');
  return { ...c, expenses: expensesOf(c).filter((x) => x.id !== id) };
}

export const isConfirmed = (s: Settlement) => s.confirmedBy.includes(s.from) && s.confirmedBy.includes(s.to);

/** Positive = gets money back, negative = owes (CST-03). Confirmed settlements are included. */
export function balances(c: EventCollab): Record<string, number> {
  const out: Record<string, number> = {};
  const add = (id: string, v: number) => {
    out[id] = (out[id] ?? 0) + v;
  };
  for (const e of expensesOf(c)) {
    add(e.paidBy, e.amount);
    for (const [id, share] of Object.entries(sharesOf(e))) add(id, -share);
  }
  for (const s of settlementsOf(c).filter(isConfirmed)) {
    add(s.from, s.amount);
    add(s.to, -s.amount);
  }
  return out;
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

/**
 * Minimal list of payments (CST-04): repeatedly the biggest debtor pays the biggest creditor. Deterministic
 * (ties by id); at most n − 1 transfers for n people.
 */
export function settleUp(bal: Record<string, number>): Transfer[] {
  const debtors = Object.entries(bal)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, v: -v }));
  const creditors = Object.entries(bal)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, v }));
  const sort = (xs: { id: string; v: number }[]) => xs.sort((a, b) => b.v - a.v || a.id.localeCompare(b.id));
  const out: Transfer[] = [];
  for (;;) {
    sort(debtors);
    sort(creditors);
    const d = debtors[0];
    const cr = creditors[0];
    if (!d || !cr || d.v === 0 || cr.v === 0) break;
    const amount = Math.min(d.v, cr.v);
    out.push({ from: d.id, to: cr.id, amount });
    d.v -= amount;
    cr.v -= amount;
    if (d.v === 0) debtors.shift();
    if (cr.v === 0) creditors.shift();
  }
  return out;
}

/** "I paid" / "I received": the other side confirms (CST-05). */
export function markSettled(c: EventCollab, by: string, transfer: Transfer, now: Date): EventCollab {
  if (by !== transfer.from && by !== transfer.to) throw new CollabError('invalid-input');
  if (!Number.isInteger(transfer.amount) || transfer.amount < 1) throw new CollabError('invalid-input');
  const s: Settlement = { id: nextId('pay', settlementsOf(c), now), ...transfer, confirmedBy: [by], createdAt: now };
  return { ...c, settlements: [...settlementsOf(c), s] };
}

export function confirmSettlement(c: EventCollab, by: string, id: string, now: Date): EventCollab {
  const s = settlementsOf(c).find((x) => x.id === id);
  if (!s) throw new CollabError('not-found');
  if (by !== s.from && by !== s.to) throw new CollabError('invalid-input');
  if (s.confirmedBy.includes(by)) return c;
  const next = { ...s, confirmedBy: [...s.confirmedBy, by] };
  return {
    ...c,
    settlements: settlementsOf(c).map((x) => (x.id === id ? next : x)),
    messages: [
      ...c.messages,
      {
        id: nextId('settled', c.messages, now),
        at: now,
        type: 'system',
        note: { kind: 'settled', from: s.from, to: s.to, amount: s.amount },
      },
    ],
  };
}

/** Pending = confirmed by one side only. */
export const pendingSettlements = (c: EventCollab) => settlementsOf(c).filter((s) => !isConfirmed(s));

/** PayPal.me user names: letters and digits, 1–20 (paypal.me rules). */
export const isPaypalName = (name: string) => /^[A-Za-z0-9]{1,20}$/.test(name);

/** `https://paypal.me/<name>/<12.40>EUR` – opens PayPal; nothing is paid inside the app (costs.md). */
export function paypalLink(name: string, cents: number, currency: string): string {
  if (!isPaypalName(name)) throw new CollabError('invalid-input');
  return `https://paypal.me/${name}/${(cents / 100).toFixed(2)}${currency}`;
}
