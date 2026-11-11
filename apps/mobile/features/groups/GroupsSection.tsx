import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { canAddOne } from '@nowish/entitlements';
import { attendanceSummary, displayTitle, type Group } from '@nowish/domain';
import { formatShortDate, formatTime } from '@nowish/i18n';
import { AvatarStack, Button, Card, EmptyState, FadeIn, Gutter, PressableScale, space, Text } from '@nowish/ui';

import { useAgendaContext } from '../agenda/use-agenda';
import { nameOf } from '../collab/text';
import { LimitNotice } from '../premium/LimitNotice';
import { myGroups } from '../premium/usage';
import { useAccount } from '@/providers/account';
import { haptic } from '@/services/haptics';

import { groupName, nextMeetings } from './use-group';

/** Groups in the "Together" tab (groups.md GRP-01/02): fixed circles with their next meeting. */
export function GroupsSection() {
  const { store, t } = useAgendaContext();
  const { limits } = useAccount();
  const groupLimit = canAddOne(limits.groups, myGroups(store.groups));
  const router = useRouter();
  const create = () => {
    haptic('light');
    router.push('/group-new');
  };
  return (
    <Gutter gap={4}>
      {groupLimit.ok ? (
        <Button label={t('groups.create')} onPress={create} testID="groups-create" />
      ) : (
        <LimitNotice text={t('limit.groups', { limit: groupLimit.limit })} reason="groups" testID="limit-groups" />
      )}
      {store.groups.length === 0 ? (
        <EmptyState title={t('groups.empty.title')} body={t('groups.empty.body')} testID="groups-empty" />
      ) : (
        store.groups.map((g, i) => (
          <FadeIn key={g.id} delay={i * 40}>
            <GroupCard group={g} />
          </FadeIn>
        ))
      )}
      <Text variant="label" color="textSecondary">
        {t('groups.private')}
      </Text>
    </Gutter>
  );
}

function GroupCard({ group: g }: { group: Group }) {
  const { store, now, today, locale, t } = useAgendaContext();
  const router = useRouter();
  const next = nextMeetings(g, store.events, today, now, store.timeZone)[0];
  const tz = store.timeZone;
  const names = g.memberIds.map((id) => nameOf(id, t));
  const summary = next ? attendanceSummary(g, next.event.id, next.occurrenceKey) : null;
  const meetingLine = next
    ? t('groups.next', {
        title: displayTitle(next.event, locale),
        when: `${formatShortDate(next.start, locale, tz)} · ${formatTime(next.start, locale, tz)}`,
      })
    : t('groups.noMeeting');
  return (
    <PressableScale
      onPress={() => {
        haptic('light');
        router.push({ pathname: '/group/[id]', params: { id: g.id } });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${g.emoji} ${groupName(g, locale)}, ${t('groups.members', { count: g.memberIds.length })}, ${meetingLine}`}
      testID={`group-${g.id}`}
      pressedScale={0.98}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <Text variant="titleL">{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="titleM">{groupName(g, locale)}</Text>
            <Text variant="label" color="textSecondary">
              {t('groups.members', { count: g.memberIds.length })}
            </Text>
          </View>
          <AvatarStack names={names} accessibilityLabel={names.join(', ')} />
        </View>
        <Text variant="bodyM">{meetingLine}</Text>
        {summary ? (
          <Text variant="label" color="textSecondary">
            {t('groups.attendance', { yes: summary.yes.length, no: summary.no.length, open: summary.open.length })}
          </Text>
        ) : null}
      </Card>
    </PressableScale>
  );
}
