import { useLocalSearchParams, useRouter } from 'expo-router';

import { Badge, Gutter, Screen, ScreenHeader, SegmentedControl } from '@nowish/ui';

import { useAgendaContext } from '../agenda/use-agenda';
import { EventsSection } from '../events/EventsSection';
import { FamilySection } from '../family/FamilySection';
import { GroupsSection } from '../groups/GroupsSection';
import { haptic } from '@/services/haptics';

const SECTIONS = ['events', 'groups', 'family'] as const;
type Section = (typeof SECTIONS)[number];
const isSection = (s: unknown): s is Section => typeof s === 'string' && (SECTIONS as readonly string[]).includes(s);

/**
 * "Together" tab (ADR 0014): events, groups and the family space side by side, so the tab bar keeps four
 * entries. The section lives in the route (`?section=family`) – deep links and the back stack keep it.
 */
export function TogetherScreen() {
  const { t } = useAgendaContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const section: Section = isSection(params.section) ? params.section : 'events';
  const titles: Record<Section, string> = {
    events: t('events.title'),
    groups: t('groups.title'),
    family: t('family.title'),
  };
  return (
    // Keyed by section: each section starts at the top. iOS keeps the old scroll offset when the content
    // gets shorter, so switching from a scrolled Family list showed an empty area instead of the groups.
    <Screen key={section} testID={`screen-${section}`}>
      <ScreenHeader
        eyebrow={t('together.eyebrow')}
        title={titles[section]}
        trailing={<Badge label={t('demo.badge')} tone="demo" />}
      />
      <Gutter>
        <SegmentedControl<Section>
          options={SECTIONS.map((s) => ({ value: s, label: t(`together.${s}`) }))}
          value={section}
          onChange={(s) => {
            haptic('selection');
            router.setParams({ section: s });
          }}
          accessibilityLabel={t('together.section')}
          testIDPrefix="together"
        />
      </Gutter>
      {section === 'events' ? <EventsSection /> : section === 'groups' ? <GroupsSection /> : <FamilySection />}
    </Screen>
  );
}
