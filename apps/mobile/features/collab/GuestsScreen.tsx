import { useState } from 'react';
import { View } from 'react-native';

import { DEMO_PEOPLE, simulateInviteReplies } from '@nowish/demo';
import {
  addDays,
  dayKeyOf,
  guestsByState,
  invite,
  rsvpSummary,
  setMaybeDeadline,
  zonedWallTimeToInstant,
  type RsvpState,
} from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import { AvatarStack, Button, Card, ChipGroup, SectionTitle, SegmentedControl, space, Text } from '@nowish/ui';

import { CollabShell } from './CollabShell';
import { useCollab } from './use-collab';

const STATE_ORDER: readonly RsvpState[] = ['yes', 'maybe', 'pending', 'expired', 'no'];
type MaybeRule = 'none' | '1d' | '2d';

/** Guest list with answers; the host invites more people and sets the "maybe" deadline (EVT-03, EVT-05). */
export function GuestsScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, event, t, now, locale, isHost, viewerId, run, name } = ctx;
  const [toInvite, setToInvite] = useState<string[]>([]);

  return (
    <CollabShell ctx={ctx} title={t('guests.title')} testID="screen-guests">
      {collab && event ? (
        <>
          <Card>
            <Text variant="titleM" testID="guests-summary">
              {t('events.rsvp', { ...rsvpSummary(collab, now) })}
            </Text>
            <Text variant="bodyM" color="textSecondary">
              {t('rsvp.headcount', { count: rsvpSummary(collab, now).headcount })}
            </Text>
            {collab.maybeDeadline ? (
              <Text variant="label" color="textSecondary">
                {t('rsvp.maybeDeadline', { date: formatLongDate(collab.maybeDeadline, locale, event.timeZone) })}
              </Text>
            ) : null}
          </Card>

          <Card>
            <Row label={`${name(collab.hostId)} · ${t('guests.host')}`} names={[name(collab.hostId)]} />
            {STATE_ORDER.map((state) => {
              const group = guestsByState(collab, now)[state];
              if (group.length === 0) return null;
              return (
                <View key={state} style={{ gap: space[2] }} testID={`guests-${state}`}>
                  <SectionTitle>{`${t(`rsvp.state.${state}`)} · ${group.length}`}</SectionTitle>
                  {group.map((inv) => (
                    <Row
                      key={inv.personId}
                      names={[name(inv.personId)]}
                      label={inv.plusOne ? `${name(inv.personId)} ${t('guests.plusOne')}` : name(inv.personId)}
                    />
                  ))}
                </View>
              );
            })}
          </Card>

          {isHost ? (
            <>
              <Card>
                <SectionTitle>{t('guests.maybe.title')}</SectionTitle>
                <SegmentedControl<MaybeRule>
                  options={[
                    { value: 'none', label: t('guests.maybe.none') },
                    { value: '1d', label: t('guests.maybe.1d') },
                    { value: '2d', label: t('guests.maybe.2d') },
                  ]}
                  value={maybeRuleOf(collab.maybeDeadline, event.start, event.timeZone)}
                  onChange={(rule) => {
                    void run((c) =>
                      setMaybeDeadline(
                        c,
                        viewerId,
                        rule === 'none' ? undefined : maybeDeadlineFor(rule, event.start, event.timeZone),
                      ),
                    );
                  }}
                  accessibilityLabel={t('guests.maybe.title')}
                  testIDPrefix="maybe-rule"
                />
              </Card>
              <InviteMore
                invited={new Set([collab.hostId, ...collab.invitations.map((i) => i.personId)])}
                selected={toInvite}
                onToggle={(id) => setToInvite((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
                onInvite={() => {
                  void run(
                    (c, t0) => ({
                      collab: invite(c, viewerId, toInvite, t0),
                      simulate: simulateInviteReplies(c.eventId, toInvite, t0),
                    }),
                    'success',
                  ).then((ok) => {
                    if (ok) setToInvite([]);
                  });
                }}
                t={t}
              />
            </>
          ) : null}
        </>
      ) : null}
    </CollabShell>
  );
}

function Row({ label, names }: { label: string; names: string[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
      <AvatarStack names={names} max={1} accessibilityLabel={label} />
      <Text variant="bodyL">{label}</Text>
    </View>
  );
}

function InviteMore({
  invited,
  selected,
  onToggle,
  onInvite,
  t,
}: {
  invited: Set<string>;
  selected: string[];
  onToggle: (id: string) => void;
  onInvite: () => void;
  t: ReturnType<typeof useCollab>['t'];
}) {
  const options = DEMO_PEOPLE.filter((p) => p.kind !== 'viewer' && p.kind !== 'child' && !invited.has(p.id)).map(
    (p) => ({ value: p.id, label: p.name }),
  );
  return (
    <Card>
      <SectionTitle>{t('guests.invite.title')}</SectionTitle>
      {options.length === 0 ? (
        <Text variant="bodyM" color="textSecondary">
          {t('guests.invite.none')}
        </Text>
      ) : (
        <>
          <ChipGroup
            options={options}
            selected={selected}
            onToggle={onToggle}
            multiple
            accessibilityLabel={t('guests.invite.title')}
            testIDPrefix="invite"
          />
          <Text variant="label" color="textSecondary">
            {t('editor.who.hint')}
          </Text>
          <Button
            label={t('guests.invite.button')}
            onPress={onInvite}
            disabled={selected.length === 0}
            testID="invite-submit"
          />
        </>
      )}
    </Card>
  );
}

function maybeDeadlineFor(rule: Exclude<MaybeRule, 'none'>, start: Date, tz: string): Date {
  const day = addDays(dayKeyOf(start, tz), rule === '1d' ? -1 : -2);
  return zonedWallTimeToInstant(day, 20, 0, tz);
}

function maybeRuleOf(deadline: Date | undefined, start: Date, tz: string): MaybeRule {
  if (!deadline) return 'none';
  if (deadline.getTime() === maybeDeadlineFor('1d', start, tz).getTime()) return '1d';
  if (deadline.getTime() === maybeDeadlineFor('2d', start, tz).getTime()) return '2d';
  // A custom deadline (e.g. demo data) is shown as the closest rule.
  return start.getTime() - deadline.getTime() > 36 * 3_600_000 ? '2d' : '1d';
}
