import { householdMemberIds } from '@nowish/domain';
import type { Translate } from '@nowish/i18n';
import { ChipGroup, FieldLabel, Gutter, Text } from '@nowish/ui';

import { memberName } from '../family/names';
import { useEvents } from '@/providers/events';
import { haptic } from '@/services/haptics';

/** FAM-03: who in the family an appointment is for. Hidden when there is no family space. */
export function ForWhomSection({
  value,
  onChange,
  t,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  t: Translate;
}) {
  const { household } = useEvents();
  if (!household) return null;
  return (
    <Gutter gap={3}>
      <FieldLabel>{t('editor.for')}</FieldLabel>
      <ChipGroup
        multiple
        options={householdMemberIds(household).map((id) => ({ value: id, label: memberName(household, id, t) }))}
        selected={value}
        onToggle={(id) => {
          haptic('selection');
          onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
        }}
        accessibilityLabel={t('editor.for')}
        testIDPrefix="editor-for"
      />
      <Text variant="label" color="textSecondary">
        {t('editor.for.hint')}
      </Text>
    </Gutter>
  );
}
