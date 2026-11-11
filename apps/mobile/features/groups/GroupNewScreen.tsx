import { useRouter } from 'expo-router';
import { useState } from 'react';

import { DEMO_PEOPLE } from '@nowish/demo';
import { createGroup, GROUP_LIMITS, GroupError } from '@nowish/domain';
import { Button, ChipGroup, Text, TextField } from '@nowish/ui';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { DetailShell } from '../shell/DetailShell';
import { haptic } from '@/services/haptics';

const EMOJIS = ['🍻', '🏃', '🎲', '🏠', '⚽', '🎸', '📚', '🍕'] as const;

/** GRP-01: create a private group from demo people (invite links arrive with block B2). */
export function GroupNewScreen() {
  const { store, t, now } = useAgendaContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(EMOJIS[0]);
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const people = DEMO_PEOPLE.filter((p) => p.kind === 'friend' || p.kind === 'family');

  const create = () => {
    setError(null);
    try {
      const group = createGroup(`grp-${now.getTime().toString(36)}`, { name, emoji }, VIEWER_ID, members, now);
      store
        .addGroup(group)
        .then(() => {
          haptic('success');
          router.replace({ pathname: '/group/[id]', params: { id: group.id } });
        })
        .catch((e: unknown) => {
          console.warn('[groups] create failed', e instanceof Error ? e.message : 'unknown');
          setError(t('groups.error.save'));
        });
    } catch (e) {
      if (!(e instanceof GroupError)) throw e;
      haptic('warning');
      setError(t(`groups.error.${e.code}`));
    }
  };

  return (
    <DetailShell
      title={t('groupNew.title')}
      demo
      error={error}
      missing={null}
      testID="screen-group-new"
      backTestID="group-new-back"
    >
      <TextField
        label={t('groupNew.name')}
        value={name}
        onChangeText={setName}
        maxLength={GROUP_LIMITS.name}
        testID="group-new-name"
      />
      <Text variant="label" color="textSecondary">
        {t('groupNew.emoji')}
      </Text>
      <ChipGroup
        options={EMOJIS.map((e) => ({ value: e, label: e }))}
        selected={[emoji]}
        onToggle={setEmoji}
        accessibilityLabel={t('groupNew.emoji')}
        testIDPrefix="group-new-emoji"
      />
      <Text variant="label" color="textSecondary">
        {t('groupNew.members')}
      </Text>
      <ChipGroup
        multiple
        options={people.map((p) => ({ value: p.id, label: p.name }))}
        selected={members}
        onToggle={(id) => setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))}
        accessibilityLabel={t('groupNew.members')}
        testIDPrefix="group-new-member"
      />
      <Text variant="label" color="textSecondary">
        {t('groups.private')}
      </Text>
      <Button
        label={t('groupNew.create')}
        onPress={create}
        disabled={name.trim().length === 0}
        testID="group-new-create"
      />
    </DetailShell>
  );
}
