import { useState } from 'react';
import { View } from 'react-native';

import { DEMO_PEOPLE, simulateFamilyJoin } from '@nowish/demo';
import { canAddOne } from '@nowish/entitlements';
import {
  addKid,
  adultCount,
  FAMILY_LIMITS,
  householdMemberIds,
  inviteAdult,
  MEMBER_COLORS,
  removeKid,
  updateKid,
  type KidProfile,
  type MemberColor,
} from '@nowish/domain';
import {
  Button,
  Card,
  ChipGroup,
  MemberAvatar,
  PressableScale,
  SectionTitle,
  space,
  Text,
  TextField,
} from '@nowish/ui';

import { LimitNotice } from '../premium/LimitNotice';
import { useAccount } from '@/providers/account';
import { confirm } from '@/services/confirm';

import { FamilyShell } from './FamilyShell';
import { memberName } from './names';
import { useFamily, type FamilyContext } from './use-family';

const KID_EMOJIS = ['🦊', '🐢', '🐻', '🐰', '🦄', '🐸', '🐼', '🚀'] as const;

/** FAM-01/02: adults with an account and child profiles without one. */
export function MembersScreen() {
  const ctx = useFamily();
  const { household, t, run, viewerId } = ctx;
  const { limits } = useAccount();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  if (!household)
    return (
      <FamilyShell ctx={ctx} title={t('members.title')} testID="screen-members">
        {null}
      </FamilyShell>
    );
  const adults = adultCount(household);
  const canAddAdult = canAddOne(limits.familyAdults, adults);
  const canAddKid = canAddOne(limits.familyKids, household.kids.length);
  const isAdmin = household.adminId === viewerId;
  const invitable = DEMO_PEOPLE.filter(
    (p) => (p.kind === 'family' || p.kind === 'friend') && !householdMemberIds(household).includes(p.id),
  ).filter((p) => !household.invitedIds.includes(p.id));

  return (
    <FamilyShell ctx={ctx} title={t('members.title')} testID="screen-members">
      <Text variant="label" color="textSecondary" testID="members-count">
        {t('members.limit', { count: adults, max: limits.familyAdults })}
      </Text>
      <SectionTitle>{t('members.adults')}</SectionTitle>
      {[...household.adultIds, ...household.invitedIds].map((id) => (
        <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }} testID={`member-${id}`}>
          <MemberAvatar name={memberName(household, id, t)} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyL">{memberName(household, id, t)}</Text>
            <Text variant="label" color="textSecondary">
              {household.invitedIds.includes(id)
                ? t('family.invited')
                : id === household.adminId
                  ? `${t('family.adult')} · ${t('members.admin')}`
                  : t('family.adult')}
            </Text>
          </View>
        </View>
      ))}

      <SectionTitle>{t('members.kids')}</SectionTitle>
      <Text variant="bodyM" color="textSecondary">
        {t('members.kids.hint')}
      </Text>
      {household.kids.map((k) =>
        editing === k.id ? (
          <KidForm key={k.id} ctx={ctx} kid={k} onDone={() => setEditing(null)} />
        ) : (
          <PressableScale
            key={k.id}
            onPress={() => isAdmin && setEditing(k.id)}
            disabled={!isAdmin}
            accessibilityRole="button"
            accessibilityLabel={`${k.name}, ${t('family.kid')}`}
            {...(isAdmin ? { accessibilityHint: t('members.editKid') } : {})}
            testID={`kid-${k.id}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: space[12] }}
          >
            <MemberAvatar name={k.name} color={k.color} emoji={k.emoji} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyL">{k.name}</Text>
              <Text variant="label" color="textSecondary">
                {t('family.kid')}
              </Text>
            </View>
          </PressableScale>
        ),
      )}
      {isAdmin && canAddKid.ok ? (
        editing === 'new' ? (
          <KidForm ctx={ctx} onDone={() => setEditing(null)} />
        ) : (
          <Button label={t('members.addKid')} variant="secondary" onPress={() => setEditing('new')} testID="kid-add" />
        )
      ) : isAdmin && !canAddKid.ok ? (
        <LimitNotice
          text={t('limit.familyKids', { limit: canAddKid.limit })}
          reason="family-size"
          testID="limit-kids"
        />
      ) : null}

      {isAdmin && !canAddAdult.ok ? (
        <LimitNotice
          text={t('limit.familyAdults', { limit: canAddAdult.limit })}
          reason="family-size"
          testID="limit-adults"
        />
      ) : null}
      {isAdmin && invitable.length > 0 && canAddAdult.ok ? (
        <Card testID="members-invite">
          <SectionTitle>{t('members.invite')}</SectionTitle>
          <Text variant="bodyM" color="textSecondary">
            {t('members.invite.hint')}
          </Text>
          <ChipGroup
            options={invitable.map((p) => ({ value: p.id, label: p.name }))}
            selected={[]}
            onToggle={(id) =>
              void run((h, now) => ({ household: inviteAdult(h, viewerId, id), simulate: simulateFamilyJoin(id, now) }))
            }
            accessibilityLabel={t('members.invite')}
            testIDPrefix="invite"
          />
        </Card>
      ) : null}
    </FamilyShell>
  );
}

function KidForm({ ctx, kid, onDone }: { ctx: FamilyContext; kid?: KidProfile; onDone: () => void }) {
  const { t, run, viewerId } = ctx;
  const [name, setName] = useState(kid?.name ?? '');
  const [color, setColor] = useState<MemberColor>(kid?.color ?? 'sport');
  const [emoji, setEmoji] = useState<string>(kid?.emoji ?? KID_EMOJIS[0]);
  const save = () =>
    void run(
      (h, now) =>
        kid
          ? updateKid(h, viewerId, kid.id, { name, color, emoji })
          : addKid(h, viewerId, { name, color, emoji }, now).household,
      'success',
    ).then((ok) => ok && onDone());
  return (
    <Card testID="kid-form">
      <SectionTitle>{kid ? t('members.editKid') : t('members.addKid')}</SectionTitle>
      <View style={{ alignItems: 'center' }}>
        <MemberAvatar name={name || '?'} color={color} emoji={emoji} size="lg" />
      </View>
      <TextField
        label={t('members.kidName')}
        value={name}
        onChangeText={setName}
        maxLength={FAMILY_LIMITS.name}
        testID="kid-name"
      />
      <Text variant="label" color="textSecondary">
        {t('members.color')}
      </Text>
      <ChipGroup
        options={MEMBER_COLORS.map((c) => ({ value: c, label: t(`color.${c}`) }))}
        selected={[color]}
        onToggle={setColor}
        accessibilityLabel={t('members.color')}
        testIDPrefix="kid-color"
      />
      <ChipGroup
        options={KID_EMOJIS.map((e) => ({ value: e, label: e }))}
        selected={[emoji]}
        onToggle={setEmoji}
        accessibilityLabel={t('members.emoji')}
        testIDPrefix="kid-emoji"
      />
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        <View style={{ flex: 1 }}>
          <Button label={t('members.cancel')} variant="tertiary" onPress={onDone} testID="kid-cancel" />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('members.save')} onPress={save} disabled={name.trim().length === 0} testID="kid-save" />
        </View>
      </View>
      {kid ? (
        <Button
          label={t('members.removeKid')}
          variant="tertiary"
          onPress={() =>
            confirm(t('members.removeKid.confirm', { name: kid.name }), '', t('members.cancel'), [
              {
                label: t('members.removeKid'),
                destructive: true,
                onPress: () => void run((h) => removeKid(h, viewerId, kid.id)).then((ok) => ok && onDone()),
              },
            ])
          }
          testID="kid-remove"
        />
      ) : null}
    </Card>
  );
}
