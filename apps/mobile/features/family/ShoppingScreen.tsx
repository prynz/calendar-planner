import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { simulateShoppingTick } from '@nowish/demo';
import {
  addShoppingItem,
  clearDoneShopping,
  FAMILY_LIMITS,
  localized,
  sortedShopping,
  toggleShoppingItem,
  type ShoppingItem,
} from '@nowish/domain';
import { Button, EmptyState, PressableScale, radii, space, Text, TextField, touch, useTheme } from '@nowish/ui';

import { FamilyShell } from './FamilyShell';
import { memberName } from './names';
import { useFamily, type FamilyContext } from './use-family';

/** FAM-06: shared shopping list. In the prototype the other adult sometimes ticks items (Demo). */
export function ShoppingScreen() {
  const ctx = useFamily();
  const { household, t, run, viewerId } = ctx;
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const items = household ? sortedShopping(household) : [];
  const hasDone = items.some((i) => i.doneAt);

  const add = () =>
    void run((h, now) => {
      const next = addShoppingItem(h, viewerId, title, note, now);
      const added = next.shopping[next.shopping.length - 1];
      return { household: next, simulate: added ? simulateShoppingTick(next, added.id, now) : [] };
    }).then((ok) => {
      if (ok) {
        setTitle('');
        setNote('');
      }
    });

  return (
    <FamilyShell
      ctx={ctx}
      title={t('shopping.title')}
      testID="screen-shopping"
      footer={
        <View style={{ gap: space[2] }}>
          <TextField
            label={t('shopping.add')}
            value={title}
            onChangeText={setTitle}
            maxLength={FAMILY_LIMITS.title}
            testID="shopping-title"
          />
          <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextField
                label={t('shopping.note')}
                value={note}
                onChangeText={setNote}
                maxLength={FAMILY_LIMITS.note}
                testID="shopping-note"
              />
            </View>
            <Button
              label={t('shopping.addButton')}
              onPress={add}
              disabled={title.trim().length === 0}
              testID="shopping-add"
            />
          </View>
        </View>
      }
    >
      <Text variant="label" color="textSecondary">
        {t('collab.demoHint')}
      </Text>
      {items.length === 0 ? (
        <EmptyState title={t('shopping.empty.title')} body={t('shopping.empty.body')} testID="shopping-empty" />
      ) : (
        items.map((i) => <ItemRow key={i.id} item={i} ctx={ctx} />)
      )}
      {hasDone ? (
        <Button
          label={t('shopping.clearDone')}
          variant="tertiary"
          onPress={() => void run((h) => clearDoneShopping(h, viewerId))}
          testID="shopping-clear"
        />
      ) : null}
    </FamilyShell>
  );
}

function ItemRow({ item, ctx }: { item: ShoppingItem; ctx: FamilyContext }) {
  const { household, t, locale, run, viewerId } = ctx;
  const { colors } = useTheme();
  const done = !!item.doneAt;
  const title = localized(item.title, item.titleI18n, locale);
  const by = item.doneBy
    ? t('shopping.doneBy', { name: memberName(household, item.doneBy, t) })
    : t('shopping.addedBy', { name: memberName(household, item.addedBy, t) });
  return (
    <PressableScale
      onPress={() => void run((h, now) => toggleShoppingItem(h, viewerId, item.id, now), done ? 'light' : 'success')}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${title}${item.note ? `, ${item.note}` : ''}, ${by}`}
      testID={`shopping-${item.id}`}
      pressedScale={0.98}
      style={{
        minHeight: touch.cta,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[4],
        borderRadius: radii.md,
        backgroundColor: colors.surface,
      }}
    >
      <View
        style={{
          width: space[8],
          height: space[8],
          borderRadius: radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? colors.accentFill : colors.elevated,
        }}
      >
        {done ? <Check color={colors.onAccentFill} size={18} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyL" color={done ? 'textSecondary' : 'textPrimary'}>
          {item.note ? `${title} · ${item.note}` : title}
        </Text>
        <Text variant="label" color="textSecondary">
          {by}
        </Text>
      </View>
    </PressableScale>
  );
}
