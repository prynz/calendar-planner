import { useState } from 'react';
import { View } from 'react-native';

import { addExpense, memberIds, SPLIT_MODES, type ExpenseSplit, type SplitMode } from '@nowish/domain';
import { formatMoney } from '@nowish/i18n';
import {
  Button,
  Card,
  ChipGroup,
  FieldLabel,
  SectionTitle,
  SegmentedControl,
  space,
  Text,
  TextField,
} from '@nowish/ui';

import { LimitNotice } from '../premium/LimitNotice';
import type { CollabContext } from './use-collab';
import { useAccount } from '@/providers/account';

/** "12,40" / "12.40" / "12" → 1240 cents; null when not a positive amount. */
export function parseCents(input: string): number | null {
  const m = /^\s*(\d{1,6})(?:[.,](\d{1,2}))?\s*$/.exec(input);
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '0').padEnd(2, '0'));
  return cents > 0 ? cents : null;
}

/** CST-01/02: add an expense. Shares and exact amounts are part of Plus; equal split is always free. */
export function AddExpense({ ctx }: { ctx: CollabContext }) {
  const { collab, t, locale, run, viewerId, name } = ctx;
  const { limits } = useAccount();
  const members = collab ? memberIds(collab) : [];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(viewerId);
  const [among, setAmong] = useState<string[]>(members);
  const [mode, setMode] = useState<SplitMode>('equal');
  const [shares, setShares] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  if (!collab) return null;
  const currency = collab.currency ?? 'EUR';
  const full = limits.costSplit === 'full';

  const save = () => {
    setProblem(null);
    const cents = parseCents(amount);
    if (cents === null) return setProblem(t('costs.add.invalid'));
    let split: ExpenseSplit;
    if (mode === 'equal') split = { mode, among };
    else if (mode === 'shares')
      split = { mode, shares: Object.fromEntries(among.map((id) => [id, Number(shares[id] ?? '1') || 1])) };
    else {
      const amounts = Object.fromEntries(among.map((id) => [id, parseCents(shares[id] ?? '') ?? 0]));
      const sum = Object.values(amounts).reduce((a, b) => a + b, 0);
      if (sum !== cents)
        return setProblem(
          t('costs.add.sumMismatch', {
            sum: formatMoney(sum, currency, locale),
            amount: formatMoney(cents, currency, locale),
          }),
        );
      split = { mode, amounts };
    }
    void run((c, at) => addExpense(c, viewerId, { title, amount: cents, paidBy, split }, at), 'success').then((ok) => {
      if (ok) {
        setTitle('');
        setAmount('');
        setShares({});
      }
    });
  };

  return (
    <Card testID="expense-new">
      <SectionTitle>{t('costs.add')}</SectionTitle>
      <TextField
        label={t('costs.add.title')}
        value={title}
        onChangeText={setTitle}
        maxLength={120}
        testID="expense-title"
      />
      <TextField
        label={t('costs.add.amount', { currency })}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        maxLength={10}
        testID="expense-amount"
      />
      <FieldLabel>{t('costs.add.paidBy')}</FieldLabel>
      <ChipGroup
        options={members.map((id) => ({ value: id, label: name(id) }))}
        selected={[paidBy]}
        onToggle={setPaidBy}
        accessibilityLabel={t('costs.add.paidBy')}
        testIDPrefix="expense-paid"
      />
      <FieldLabel>{t('costs.add.among')}</FieldLabel>
      <ChipGroup
        multiple
        options={members.map((id) => ({ value: id, label: name(id) }))}
        selected={among}
        onToggle={(id) => setAmong((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))}
        accessibilityLabel={t('costs.add.among')}
        testIDPrefix="expense-among"
      />
      <FieldLabel>{t('costs.add.mode')}</FieldLabel>
      {full ? (
        <SegmentedControl<SplitMode>
          options={SPLIT_MODES.map((m) => ({ value: m, label: t(`costs.mode.${m}`) }))}
          value={mode}
          onChange={setMode}
          accessibilityLabel={t('costs.add.mode')}
          testIDPrefix="expense-mode"
        />
      ) : (
        <LimitNotice text={t('limit.costs')} reason="cost-split" testID="limit-costs" />
      )}
      {mode !== 'equal'
        ? among.map((id) => (
            <View key={id} style={{ gap: space[1] }}>
              <TextField
                label={t(mode === 'shares' ? 'costs.add.share' : 'costs.add.exact', { name: name(id) })}
                value={shares[id] ?? (mode === 'shares' ? '1' : '')}
                onChangeText={(v) => setShares((s) => ({ ...s, [id]: v }))}
                keyboardType={mode === 'shares' ? 'number-pad' : 'decimal-pad'}
                maxLength={10}
                testID={`expense-part-${id}`}
              />
            </View>
          ))
        : null}
      {problem ? (
        <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID="expense-problem">
          {problem}
        </Text>
      ) : null}
      <Button
        label={t('costs.add.save')}
        onPress={save}
        disabled={title.trim().length === 0 || amount.trim().length === 0 || among.length === 0}
        testID="expense-save"
      />
    </Card>
  );
}
