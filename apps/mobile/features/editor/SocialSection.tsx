import { View } from 'react-native';

import { DEMO_PEOPLE } from '@nowish/demo';
import type { EventTemplate } from '@nowish/domain';
import type { Translate } from '@nowish/i18n';
import { ChipGroup, FieldLabel, Gutter, space, SwitchRow, Text } from '@nowish/ui';

import { templateText } from '../collab/text';
import { haptic } from '@/services/haptics';

export interface SocialChoice {
  inviteeIds: string[];
  /** Template task/bring keys the host keeps (TPL-02: untick what you don't need). */
  taskKeys: string[];
  bringKeys: string[];
}

export const initialSocialChoice = (tpl: EventTemplate | undefined): SocialChoice => ({
  inviteeIds: [],
  taskKeys: tpl?.tasks.map((x) => x.key) ?? [],
  bringKeys: tpl?.bring.map((x) => x.key) ?? [],
});

/** Demo people the viewer can invite (children have no account and are never invited directly). */
export const INVITABLE = DEMO_PEOPLE.filter((p) => p.kind !== 'viewer' && p.kind !== 'child');

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** "Who?" step of a new social event plus the template content to take over (EVT-01, TPL-01/02). */
export function SocialSection({
  value,
  onChange,
  template,
  t,
}: {
  value: SocialChoice;
  onChange: (next: SocialChoice) => void;
  template: EventTemplate | undefined;
  t: Translate;
}) {
  return (
    <>
      <Gutter gap={3}>
        <FieldLabel>{t('editor.who')}</FieldLabel>
        <ChipGroup
          multiple
          options={INVITABLE.map((p) => ({ value: p.id, label: p.name }))}
          selected={value.inviteeIds}
          onToggle={(id) => {
            haptic('selection');
            onChange({ ...value, inviteeIds: toggle(value.inviteeIds, id) });
          }}
          accessibilityLabel={t('editor.who')}
          testIDPrefix="editor-invite"
        />
        <Text variant="label" color="textSecondary">
          {t('editor.who.hint')}
        </Text>
      </Gutter>
      {template ? (
        <Gutter gap={2}>
          <Text variant="titleM" accessibilityRole="header">
            {t('editor.template', { name: templateText(t, template.id, 'title') })}
          </Text>
          <Text variant="label" color="textSecondary">
            {t('editor.template.hint')}
          </Text>
          {template.tasks.length > 0 ? <FieldLabel>{t('tasks.title')}</FieldLabel> : null}
          {template.tasks.map((x) => (
            <SwitchRow
              key={`task-${x.key}`}
              label={templateText(t, template.id, `task.${x.key}`)}
              value={value.taskKeys.includes(x.key)}
              onChange={() => onChange({ ...value, taskKeys: toggle(value.taskKeys, x.key) })}
              testID={`editor-tpl-task-${x.key}`}
            />
          ))}
          {template.bring.length > 0 ? (
            <View style={{ marginTop: space[2] }}>
              <FieldLabel>{t('bring.title')}</FieldLabel>
            </View>
          ) : null}
          {template.bring.map((x) => (
            <SwitchRow
              key={`bring-${x.key}`}
              label={`${templateText(t, template.id, `bring.${x.key}`)} ×${x.quantity}`}
              value={value.bringKeys.includes(x.key)}
              onChange={() => onChange({ ...value, bringKeys: toggle(value.bringKeys, x.key) })}
              testID={`editor-tpl-bring-${x.key}`}
            />
          ))}
        </Gutter>
      ) : null}
    </>
  );
}
