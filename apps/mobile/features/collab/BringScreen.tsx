import { useState } from 'react';
import { View } from 'react-native';

import {
  addBringItem,
  bringProgress,
  claimedQuantity,
  claimOf,
  COLLAB_LIMITS,
  localized,
  remainingQuantity,
  setClaim,
  similarItems,
  type BringItem,
} from '@nowish/domain';
import { Button, Card, EmptyState, ProgressBar, SectionTitle, space, Stepper, Text, TextField } from '@nowish/ui';

import { CollabShell } from './CollabShell';
import { useCollab, type CollabContext } from './use-collab';

/** Bring list: who brings how much, own share via stepper, new items with duplicate hint (BRG-01…06). */
export function BringScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, t, locale, run, viewerId } = ctx;
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(1);

  const progress = collab ? bringProgress(collab.bring) : { covered: 0, total: 0 };
  const similar = collab && title.trim() ? similarItems(collab.bring, title, locale) : [];
  return (
    <CollabShell ctx={ctx} title={t('bring.title')} testID="screen-bring">
      {collab ? (
        <>
          {collab.bring.length === 0 ? (
            <EmptyState title={t('bring.empty.title')} body={t('bring.empty.body')} testID="bring-empty" />
          ) : (
            <Card>
              <Text variant="titleM" testID="bring-progress">
                {progress.covered === progress.total ? t('bring.allCovered') : t('bring.progress', progress)}
              </Text>
              <ProgressBar value={progress.total ? progress.covered / progress.total : 0} />
            </Card>
          )}
          {collab.bring.map((item) => (
            <ItemCard key={item.id} item={item} ctx={ctx} />
          ))}
          <Card>
            <SectionTitle>{t('bring.add.title')}</SectionTitle>
            <TextField
              label={t('bring.add.name')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('bring.add.placeholder')}
              maxLength={COLLAB_LIMITS.title}
              testID="bring-new-title"
            />
            {similar.length > 0 ? (
              <Text variant="label" color="secondaryText" accessibilityLiveRegion="polite" testID="bring-similar">
                {t('bring.add.similar', {
                  items: similar.map((i) => localized(i.title, i.titleI18n, locale)).join(', '),
                })}
              </Text>
            ) : null}
            <Stepper
              label={t('bring.add.quantity')}
              valueText={String(quantity)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrease={() => setQuantity((q) => Math.min(COLLAB_LIMITS.quantity, q + 1))}
              canDecrease={quantity > 1}
              canIncrease={quantity < COLLAB_LIMITS.quantity}
              decreaseLabel={t('bring.dec', { item: title || t('bring.add.name') })}
              increaseLabel={t('bring.inc', { item: title || t('bring.add.name') })}
              testIDPrefix="bring-new-qty"
            />
            <Button
              label={t('common.add')}
              variant="secondary"
              disabled={title.trim().length === 0}
              onPress={() => {
                void run((c, now) => addBringItem(c, viewerId, { title, quantity }, now), 'success').then((ok) => {
                  if (!ok) return;
                  setTitle('');
                  setQuantity(1);
                });
              }}
              testID="bring-add"
            />
          </Card>
        </>
      ) : null}
    </CollabShell>
  );
}

function ItemCard({ item, ctx }: { item: BringItem; ctx: CollabContext }) {
  const { t, locale, run, viewerId, name } = ctx;
  const title = localized(item.title, item.titleI18n, locale);
  const mine = claimOf(item, viewerId);
  const max = mine + remainingQuantity(item);
  const others = item.claims.filter((c) => c.personId !== viewerId);
  const set = (q: number) => void run((c) => setClaim(c, item.id, viewerId, q), 'selection');
  return (
    <Card testID={`bring-${item.id}`}>
      <View style={{ gap: space[1] }}>
        <Text variant="titleM">{title}</Text>
        <Text variant="label" color="textSecondary">
          {[
            t('bring.claimed', { claimed: claimedQuantity(item), quantity: item.quantity }),
            ...others.map((c) => `${name(c.personId)} ×${c.quantity}`),
          ].join(' · ')}
        </Text>
      </View>
      <Stepper
        label={t('bring.mine')}
        valueText={String(mine)}
        onDecrease={() => set(mine - 1)}
        onIncrease={() => set(mine + 1)}
        canDecrease={mine > 0}
        canIncrease={mine < max}
        decreaseLabel={t('bring.dec', { item: title })}
        increaseLabel={t('bring.inc', { item: title })}
        testIDPrefix={`bring-claim-${item.id}`}
      />
    </Card>
  );
}
