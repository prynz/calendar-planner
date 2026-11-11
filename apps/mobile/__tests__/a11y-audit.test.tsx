import { screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { BringScreen } from '@/features/collab/BringScreen';
import { ChatScreen } from '@/features/collab/ChatScreen';
import { CostsScreen } from '@/features/collab/CostsScreen';
import { GuestsScreen } from '@/features/collab/GuestsScreen';
import { PollScreen } from '@/features/collab/PollScreen';
import { TasksScreen } from '@/features/collab/TasksScreen';
import { EventDetailScreen } from '@/features/detail/EventDetailScreen';
import { EditorScreen } from '@/features/editor/EditorScreen';
import { ChoresScreen } from '@/features/family/ChoresScreen';
import { MembersScreen } from '@/features/family/MembersScreen';
import { RidesScreen } from '@/features/family/RidesScreen';
import { ShoppingScreen } from '@/features/family/ShoppingScreen';
import { GroupChatScreen } from '@/features/groups/GroupChatScreen';
import { GroupNewScreen } from '@/features/groups/GroupNewScreen';
import { GroupScreen } from '@/features/groups/GroupScreen';
import { FocusScreen } from '@/features/leave/FocusScreen';
import { ReadyCheckScreen } from '@/features/leave/ReadyCheckScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { PaywallScreen } from '@/features/premium/PaywallScreen';
import { PrivacyScreen } from '@/features/privacy/PrivacyScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { IcsImportScreen } from '@/features/settings/IcsImportScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { TemplatesScreen } from '@/features/templates/TemplatesScreen';
import { TodayScreen } from '@/features/today/TodayScreen';
import { TogetherScreen } from '@/features/together/TogetherScreen';
import { DEFAULT_ACCOUNT } from '@/providers/account';

import { renderApp } from './test-utils';

/**
 * Phase 7 accessibility audit: renders every screen and checks that each element a finger can press is also
 * usable with VoiceOver/TalkBack – it has a role and a name that a screen reader can announce.
 */

const clientConfig = { ok: true as const, config: { backend: 'demo' as const, variant: 'development' as const } };

const SCREENS: [string, () => ReactElement][] = [
  ['Today', () => <TodayScreen />],
  ['Calendar', () => <CalendarScreen />],
  ['Together', () => <TogetherScreen />],
  ['Settings', () => <SettingsScreen clientConfig={clientConfig} appVersion="0.1.0" />],
  ['Event detail', () => <EventDetailScreen eventId="demo-bbq" occurrence={undefined} />],
  ['Editor (new)', () => <EditorScreen social />],
  ['Editor (edit)', () => <EditorScreen eventId="demo-tom-party" social />],
  ['Guests', () => <GuestsScreen eventId="demo-movie-night" />],
  ['Poll', () => <PollScreen eventId="demo-bbq" />],
  ['Bring list', () => <BringScreen eventId="demo-bbq" />],
  ['Tasks', () => <TasksScreen eventId="demo-bbq" />],
  ['Chat', () => <ChatScreen eventId="demo-bbq" />],
  ['Costs', () => <CostsScreen eventId="demo-bbq" />],
  ['Ready check', () => <ReadyCheckScreen eventId="demo-bbq" occurrence={undefined} />],
  ['Focus', () => <FocusScreen />],
  ['Templates', () => <TemplatesScreen />],
  ['Family members', () => <MembersScreen />],
  ['Rides', () => <RidesScreen />],
  ['Shopping', () => <ShoppingScreen />],
  ['Chores', () => <ChoresScreen />],
  ['Group', () => <GroupScreen groupId="demo-group-regulars" />],
  ['Group chat', () => <GroupChatScreen groupId="demo-group-regulars" />],
  ['New group', () => <GroupNewScreen />],
  ['ICS import', () => <IcsImportScreen />],
  ['Paywall', () => <PaywallScreen />],
  ['Privacy center', () => <PrivacyScreen />],
  ['Profile', () => <ProfileScreen />],
  ['Onboarding', () => <OnboardingScreen />],
];

type Props = Record<string, unknown>;
type HostNode = NonNullable<typeof screen.root>;

function textOf(node: HostNode | string): string {
  if (typeof node === 'string') return node;
  const props = node.props as Props;
  if (typeof props.accessibilityLabel === 'string') return props.accessibilityLabel;
  return node.children.map(textOf).join('');
}

function isPressable(node: HostNode): boolean {
  return typeof (node.props as Props).onClick === 'function';
}

/** CLAUDE.md: touch targets ≥ 48 dp. */
const MIN_TOUCH = 48;

/**
 * Smallest side of the touch area as far as styles can tell (explicit height/width/min sizes plus hitSlop).
 * `null` when the size comes from content and padding only – then the layout decides and the CI screenshots show it.
 */
function touchSize(props: Props): number | null {
  const style = StyleSheet.flatten(props.style as StyleProp<ViewStyle>) ?? {};
  const slop = typeof props.hitSlop === 'number' ? props.hitSlop : 0;
  const side = (fixed: unknown, min: unknown, a: unknown, b: unknown): number | null => {
    const value = typeof fixed === 'number' ? fixed : typeof min === 'number' ? min : null;
    if (value === null) return null;
    const slopA = typeof a === 'number' ? a : slop;
    const slopB = typeof b === 'number' ? b : slop;
    return value + slopA + slopB;
  };
  const hs = (typeof props.hitSlop === 'object' && props.hitSlop !== null ? props.hitSlop : {}) as Props;
  const h = side(style.height, style.minHeight, hs.top, hs.bottom);
  const w = side(style.width, style.minWidth, hs.left, hs.right);
  const sides = [h, w].filter((v): v is number => v !== null);
  return sides.length === 0 ? null : Math.min(...sides);
}

/** Host elements a user can activate that a screen reader could not announce properly. */
function findProblems(root: HostNode): string[] {
  const problems: string[] = [];
  for (const node of root.queryAll(isPressable)) {
    const props = node.props as Props;
    if (props.accessible === false || props.importantForAccessibility === 'no-hide-descendants') continue;
    const id = typeof props.testID === 'string' ? props.testID : '(no testID)';
    const role = props.accessibilityRole ?? props.role;
    if (typeof role !== 'string' || role === 'none') problems.push(`${id}: no accessibility role`);
    if (textOf(node).trim().length === 0) problems.push(`${id}: no accessible name`);
    const size = touchSize(props);
    if (size !== null && size < MIN_TOUCH) problems.push(`${id}: touch target ${size} dp`);
  }
  return problems;
}

describe('accessibility audit', () => {
  it.each(SCREENS)('%s: every pressable has a role and a name', async (name, ui) => {
    await renderApp(ui(), name === 'Onboarding' ? { account: DEFAULT_ACCOUNT } : {});
    // Let async data (repository load) settle before walking the tree.
    await screen.findAllByText(/./);
    const root = screen.root;
    expect(root).not.toBeNull();
    if (root) {
      // Guard against a vacuous pass: each screen has something to press.
      expect(root.queryAll(isPressable).length).toBeGreaterThan(0);
      expect(findProblems(root)).toEqual([]);
    }
  });
});

describe('accessibility audit (self-check)', () => {
  it('reports a pressable without role or name', async () => {
    await renderApp(
      <Pressable testID="bare" onPress={() => undefined}>
        <View />
      </Pressable>,
    );
    const root = screen.root;
    expect(root && findProblems(root)).toEqual(['bare: no accessibility role', 'bare: no accessible name']);
  });
});
