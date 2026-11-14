import { useRouter } from 'expo-router';
import { Target } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { wallParts } from '@nowish/domain';
import {
  Badge,
  Button,
  DateStrip,
  FadeIn,
  Gutter,
  IconButton,
  Orb,
  Screen,
  ScreenHeader,
  SoftCard,
  space,
  Text,
} from '@nowish/ui';

import { useAccount } from '@/providers/account';
import { useSettings, type HomeBlock } from '@/providers/settings';
import { haptic } from '@/services/haptics';

import { agendaBetweenFor } from '../leave/hero-item';
import { LeavePanel } from '../leave/LeavePanel';
import { dateStripDays, dayHeading, duration, leaveHero, leavePlanFor, nextUp } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { AccountButton } from '../shell/AccountButton';
import { DaySection } from './DaySection';
import { HelperCard } from './HelperCard';
import { dayInsights } from './insights';
import { SummaryCard, WeekSection } from './OverviewBlocks';

/** The orb turns from calm to sunrise this many minutes before leaving. */
const NOW_WINDOW_MIN = 30;

/** "25" below an hour, "1:40" above; never negative. */
function orbValue(minutes: number): string {
  const m = Math.max(0, minutes);
  return m < 60 ? String(m) : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * "Now" (Kompass, ADR 0017): one sentence and the orb answer "how much time do I have?"; below, the day.
 * Built on Today (Phase 8): calm sections in the user's own order – overview, next departure, helper, the day, the week.
 * Only one strong colour (the accent on the departure card); everything else is white cards on warm white.
 */
export function TodayScreen() {
  const { store, now, locale, t, today, openEvent, buffer } = useAgendaContext();
  const { settings } = useSettings();
  const { account } = useAccount();
  const [selected, setSelected] = useState(today);
  const router = useRouter();
  const tz = store.timeZone;
  const isToday = selected === today;
  const heading = dayHeading(selected, today, tz, locale, t);
  const insight = dayInsights(store.events, selected, tz, now, buffer);
  const hero = isToday ? leaveHero(store.events, now, locale, t, buffer, tz) : null;
  const upcoming = isToday && !hero ? nextUp(store.events, now, locale, buffer, tz) : null;
  const heroItem = hero ? agendaBetweenFor(store.events, hero.eventId, hero.occurrenceKey, tz) : null;
  const heroPlan = heroItem ? leavePlanFor(heroItem.event, heroItem.start, buffer) : null;
  const hour = wallParts(now, tz).hour;
  const greeting = t(hour < 11 ? 'greet.morning' : hour < 18 ? 'greet.day' : 'greet.evening', {
    name: account.displayName.trim() || 'none',
  });
  const dense = settings.density === 'compact';

  const select = (key: string) => {
    haptic('selection');
    setSelected(key);
  };

  const blocks: Record<HomeBlock, ReactNode> = {
    summary: isToday ? <SummaryCard hour={hour} /> : null,
    leave: hero ? (
      <Gutter>
        <FadeIn>
          <View style={{ gap: space[4] }}>
            <Text variant="titleM" testID="now-sentence">
              {hero.minutesUntilLeave > 0
                ? t('now.sentence', { duration: duration(hero.minutesUntilLeave, t), title: hero.title })
                : hero.status}
            </Text>
            <Orb
              value={orbValue(hero.minutesUntilLeave)}
              top={hero.minutesUntilLeave > 0 ? t('orb.top') : t('orb.topNow')}
              bottom={t(
                hero.minutesUntilLeave <= 0
                  ? 'orb.bottomNow'
                  : hero.minutesUntilLeave >= 60
                    ? 'orb.bottomHours'
                    : 'orb.bottom',
                { time: hero.leaveTime },
              )}
              tone={hero.minutesUntilLeave <= NOW_WINDOW_MIN ? 'now' : 'calm'}
              onPress={() => openEvent(hero.eventId, today)}
              accessibilityLabel={`${hero.headline}. ${hero.label}. ${hero.breakdown}. ${hero.status}`}
              accessibilityHint={t('event.openHint')}
              testID={hero.testID}
            />
            {hero.breakdown ? (
              <View style={{ alignItems: 'center' }}>
                <Text variant="label" color="textSecondary">
                  {hero.breakdown}
                </Text>
              </View>
            ) : null}
          </View>
        </FadeIn>
        {heroItem && heroPlan ? (
          <LeavePanel
            event={heroItem.event}
            occurrenceKey={heroItem.occurrenceKey}
            start={heroItem.start}
            plan={heroPlan}
            compact
          />
        ) : null}
      </Gutter>
    ) : upcoming ? (
      <Gutter>
        <FadeIn>
          <View style={{ gap: space[4] }}>
            <Text variant="titleM" testID="now-sentence">
              {t(upcoming.hasLeave ? 'now.sentence' : 'now.sentenceStart', {
                duration: duration(upcoming.minutes, t),
                title: upcoming.title,
              })}
            </Text>
            <Orb
              value={orbValue(upcoming.minutes)}
              top={t(upcoming.hasLeave ? 'orb.top' : 'orb.topStart')}
              bottom={t(upcoming.minutes >= 60 ? 'orb.bottomHours' : 'orb.bottom', { time: upcoming.time })}
              tone="calm"
              onPress={() => openEvent(upcoming.eventId, upcoming.occurrenceKey)}
              accessibilityLabel={t(upcoming.hasLeave ? 'now.sentence' : 'now.sentenceStart', {
                duration: duration(upcoming.minutes, t),
                title: upcoming.title,
              })}
              accessibilityHint={t('event.openHint')}
              testID="next-orb"
            />
          </View>
        </FadeIn>
      </Gutter>
    ) : isToday ? (
      <Gutter>
        <SoftCard testID="demo-banner">
          <Text variant="bodyM" color="textSecondary">
            {t('demo.banner')}
          </Text>
        </SoftCard>
      </Gutter>
    ) : null,
    helper: <HelperCard conflicts={insight.conflicts} items={insight.items} />,
    day: (
      <View style={{ gap: space[3] }}>
        <DateStrip days={dateStripDays(store.events, today, tz, locale, t)} selectedKey={selected} onSelect={select} />
        {!isToday ? (
          <Gutter>
            <Button
              label={t('today.backToToday')}
              variant="tertiary"
              onPress={() => select(today)}
              testID="back-to-today"
            />
          </Gutter>
        ) : null}
        <DaySection
          key={selected}
          day={selected}
          title={isToday ? t('day.title') : heading.title}
          items={insight.items}
          gaps={insight.gaps}
          tight={insight.tight}
          dense={dense}
        />
      </View>
    ),
    week: <WeekSection />,
  };

  return (
    <Screen testID="screen-today" gap={dense ? 4 : 6}>
      <ScreenHeader
        eyebrow={heading.eyebrow}
        title={isToday ? greeting : heading.title}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <IconButton
              icon={(c) => <Target color={c} size={20} />}
              onPress={() => {
                haptic('light');
                router.push('/focus');
              }}
              accessibilityLabel={t('today.focus')}
              testID="open-focus"
            />
            <Badge label={t('demo.badge')} tone="demo" testID="demo-badge" />
            <AccountButton />
          </View>
        }
      />
      <StoreGate>
        {settings.homeOrder
          .filter((b) => !settings.homeHidden.includes(b))
          .map((b) => (
            <View key={b} testID={`home-${b}`} style={{ gap: space[3] }}>
              {blocks[b]}
            </View>
          ))}
      </StoreGate>
    </Screen>
  );
}
