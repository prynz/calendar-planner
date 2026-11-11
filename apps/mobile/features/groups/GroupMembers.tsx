import { View } from 'react-native';

import { DEMO_PEOPLE } from '@nowish/demo';
import { addGroupMembers, isGroupAdmin, removeGroupMember, setGroupAdmin } from '@nowish/domain';
import { Badge, Button, ChipGroup, MemberAvatar, SectionTitle, space, Text } from '@nowish/ui';

import { confirm } from '@/services/confirm';

import type { GroupContext } from './use-group';

/** GRP-06: members and admins. Only admins add, remove or promote. */
export function GroupMembers({ ctx }: { ctx: GroupContext }) {
  const { group, t, run, viewerId, name } = ctx;
  if (!group) return null;
  const admin = isGroupAdmin(group, viewerId);
  const addable = DEMO_PEOPLE.filter((p) => p.kind === 'friend' || p.kind === 'family').filter(
    (p) => !group.memberIds.includes(p.id),
  );
  return (
    <View style={{ gap: space[3] }} testID="group-members">
      <SectionTitle>{t('group.members')}</SectionTitle>
      {group.memberIds.map((id) => (
        <View key={id} style={{ gap: space[2] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }} testID={`group-member-${id}`}>
            <MemberAvatar name={name(id)} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyL">{name(id)}</Text>
            </View>
            {isGroupAdmin(group, id) ? <Badge label={t('group.admin')} tone="neutral" /> : null}
          </View>
          {admin && id !== viewerId ? (
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              {!isGroupAdmin(group, id) ? (
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('group.makeAdmin')}
                    variant="tertiary"
                    onPress={() => void run((g) => setGroupAdmin(g, viewerId, id, true))}
                    testID={`group-admin-${id}`}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button
                  label={t('group.remove')}
                  variant="tertiary"
                  onPress={() =>
                    confirm(t('group.remove.confirm', { name: name(id) }), '', t('members.cancel'), [
                      {
                        label: t('group.remove'),
                        destructive: true,
                        onPress: () => void run((g, now) => removeGroupMember(g, viewerId, id, now)),
                      },
                    ])
                  }
                  testID={`group-remove-${id}`}
                />
              </View>
            </View>
          ) : null}
        </View>
      ))}
      {admin && addable.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <Text variant="label" color="textSecondary">
            {t('group.addMembers.title')}
          </Text>
          <ChipGroup
            options={addable.map((p) => ({ value: p.id, label: p.name }))}
            selected={[]}
            onToggle={(id) => void run((g, now) => addGroupMembers(g, viewerId, [id], now), 'success')}
            accessibilityLabel={t('group.addMembers.title')}
            testIDPrefix="group-add"
          />
        </View>
      ) : null}
    </View>
  );
}
