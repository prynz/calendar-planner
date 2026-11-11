import { Trash2 } from 'lucide-react-native';
import { Share, View } from 'react-native';

import { simulateSettlementConfirm } from '@nowish/demo';
import {
  balances,
  confirmSettlement,
  displayTitle,
  expensesOf,
  localized,
  markSettled,
  paypalLink,
  pendingSettlements,
  removeExpense,
  settleUp,
  type Transfer,
} from '@nowish/domain';
import { formatMoney } from '@nowish/i18n';
import { Button, Card, EmptyState, IconButton, SectionTitle, space, Text } from '@nowish/ui';

import { AddExpense } from './AddExpense';
import { CollabShell } from './CollabShell';
import { useCollab, type CollabContext } from './use-collab';
import { useAccount } from '@/providers/account';

/**
 * Cost split (costs.md): who paid what, balances, a minimal list of transfers and PayPal.me links.
 * Tracking only – nothing is paid inside the app; the other side confirms (Demo).
 */
export function CostsScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, t, locale, name } = ctx;
  const currency = collab?.currency ?? 'EUR';
  const money = (cents: number) => formatMoney(cents, currency, locale);
  const expenses = collab ? expensesOf(collab) : [];
  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const bal = collab ? balances(collab) : {};
  const transfers = settleUp(bal);

  return (
    <CollabShell ctx={ctx} title={t('costs.title')} testID="screen-costs">
      <Text variant="label" color="textSecondary">
        {`${t('collab.demoHint')} ${t('costs.note')}`}
      </Text>
      {expenses.length === 0 ? (
        <EmptyState title={t('costs.empty.title')} body={t('costs.empty.body')} testID="costs-empty" />
      ) : (
        <>
          <Text variant="titleM" testID="costs-total">
            {t('costs.total', { amount: money(total) })}
          </Text>
          <Card testID="costs-balances">
            <SectionTitle>{t('costs.balances')}</SectionTitle>
            {Object.entries(bal).map(([id, v]) => (
              <Text key={id} variant="bodyM" color={v === 0 ? 'textSecondary' : 'textPrimary'}>
                {v > 0
                  ? t('costs.balance.get', { name: name(id), amount: money(v) })
                  : v < 0
                    ? t('costs.balance.owe', { name: name(id), amount: money(-v) })
                    : t('costs.balance.even', { name: name(id) })}
              </Text>
            ))}
          </Card>
          <Card testID="costs-settle">
            <SectionTitle>{t('costs.settle')}</SectionTitle>
            {transfers.length === 0 ? (
              <Text variant="bodyM">{t('costs.even')}</Text>
            ) : (
              <>
                <Text variant="label" color="textSecondary">
                  {t('costs.settle.hint', { count: transfers.length })}
                </Text>
                {transfers.map((tr) => (
                  <TransferRow key={`${tr.from}>${tr.to}`} transfer={tr} ctx={ctx} money={money} />
                ))}
              </>
            )}
          </Card>
          <SectionTitle>{t('costs.expenses')}</SectionTitle>
          {expenses.map((e) => (
            <View
              key={e.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}
              testID={`expense-${e.id}`}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyL">{`${localized(e.title, e.titleI18n, locale)} · ${money(e.amount)}`}</Text>
                <Text variant="label" color="textSecondary">
                  {t('costs.expense.line', { name: name(e.paidBy), amount: money(e.amount) })}
                </Text>
              </View>
              {e.paidBy === ctx.viewerId || ctx.isHost ? (
                <IconButton
                  icon={(c) => <Trash2 color={c} size={18} />}
                  accessibilityLabel={t('costs.expense.remove')}
                  onPress={() => void ctx.run((c) => removeExpense(c, ctx.viewerId, e.id))}
                  testID={`expense-remove-${e.id}`}
                />
              ) : null}
            </View>
          ))}
        </>
      )}
      <AddExpense ctx={ctx} />
    </CollabShell>
  );
}

function TransferRow({
  transfer: tr,
  ctx,
  money,
}: {
  transfer: Transfer;
  ctx: CollabContext;
  money: (c: number) => string;
}) {
  const { collab, event, t, locale, name, run, viewerId } = ctx;
  const { account } = useAccount();
  if (!collab || !event) return null;
  const pending = pendingSettlements(collab).find((s) => s.from === tr.from && s.to === tr.to);
  const mine = tr.from === viewerId || tr.to === viewerId;
  const other = tr.from === viewerId ? tr.to : tr.from;
  const currency = collab.currency ?? 'EUR';
  const id = `${tr.from}-${tr.to}`;

  const mark = () =>
    void run((c, at) => {
      const next = markSettled(c, viewerId, tr, at);
      const s = next.settlements?.[next.settlements.length - 1];
      return { collab: next, simulate: s ? simulateSettlementConfirm(next, s.id, at) : [] };
    }, 'success');

  const shareLink = () => {
    if (!account.paypalMe) return;
    const link = paypalLink(account.paypalMe, tr.amount, currency);
    Share.share({
      message: t('costs.paypal.message', { name: name(tr.from), event: displayTitle(event, locale), link }),
    }).catch((e: unknown) => console.warn('[costs] share failed', e instanceof Error ? e.message : 'unknown'));
  };

  return (
    <View style={{ gap: space[2] }} testID={`transfer-${id}`}>
      <Text variant="bodyL">
        {t('costs.transfer', { from: name(tr.from), to: name(tr.to), amount: money(tr.amount) })}
      </Text>
      {!mine ? null : pending ? (
        pending.confirmedBy.includes(viewerId) ? (
          <Text variant="label" color="textSecondary" testID={`transfer-pending-${id}`}>
            {t('costs.pending', { name: name(other) })}
          </Text>
        ) : (
          <Button
            label={tr.to === viewerId ? t('costs.markReceived') : t('costs.markPaid')}
            variant="secondary"
            onPress={() => void run((c, at) => confirmSettlement(c, viewerId, pending.id, at), 'success')}
            testID={`transfer-confirm-${id}`}
          />
        )
      ) : (
        <>
          {tr.to === viewerId ? (
            account.paypalMe ? (
              <Button
                label={t('costs.paypal.share', { name: name(tr.from) })}
                variant="tertiary"
                onPress={shareLink}
                testID={`transfer-paypal-${id}`}
              />
            ) : (
              <Text variant="label" color="textSecondary">
                {t('costs.paypal.setup')}
              </Text>
            )
          ) : (
            <Text variant="label" color="textSecondary">
              {t('costs.paypal.missing', { name: name(tr.to) })}
            </Text>
          )}
          <Button
            label={tr.to === viewerId ? t('costs.markReceived') : t('costs.markPaid')}
            variant="secondary"
            onPress={mark}
            testID={`transfer-mark-${id}`}
          />
        </>
      )}
    </View>
  );
}
