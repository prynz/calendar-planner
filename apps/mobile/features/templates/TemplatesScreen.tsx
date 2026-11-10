import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EVENT_TEMPLATES } from '@nowish/domain';
import { Button, categoryColors, FadeIn, IconButton, PressableScale, radii, space, Text, useTheme } from '@nowish/ui';

import { templateText } from '../collab/text';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

/** Curated templates (TPL-01): picking one opens the event editor prefilled; content can be unticked there. */
export function TemplatesScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const pick = (template?: string) => {
    haptic('light');
    router.replace({ pathname: '/editor', params: template ? { kind: 'social', template } : { kind: 'social' } });
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        testID="screen-templates"
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[8],
          paddingHorizontal: space[5],
          gap: space[4],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: space[1] }}>
            <Text variant="label" color="textSecondary">
              {t('templates.eyebrow')}
            </Text>
            <Text variant="titleL" accessibilityRole="header">
              {t('templates.title')}
            </Text>
          </View>
          <IconButton
            icon={(c) => <X color={c} size={22} />}
            onPress={() => router.back()}
            accessibilityLabel={t('common.close')}
            testID="templates-close"
          />
        </View>
        {EVENT_TEMPLATES.map((tpl, i) => (
          <FadeIn key={tpl.id} delay={i * 40}>
            <PressableScale
              onPress={() => pick(tpl.id)}
              accessibilityLabel={`${templateText(t, tpl.id, 'title')}. ${templateText(t, tpl.id, 'description')}`}
              testID={`template-${tpl.id}`}
              pressedScale={0.98}
              style={{
                backgroundColor: categoryColors[tpl.category],
                borderRadius: radii.lg,
                padding: space[5],
                gap: space[1],
              }}
            >
              <Text variant="titleM" color="onCategoryFill">
                {templateText(t, tpl.id, 'title')}
              </Text>
              <Text variant="bodyM" color="onCategoryFill">
                {templateText(t, tpl.id, 'description')}
              </Text>
              <Text variant="label" color="onCategoryFill">
                {t('templates.content', { tasks: tpl.tasks.length, bring: tpl.bring.length })}
              </Text>
            </PressableScale>
          </FadeIn>
        ))}
        <Button label={t('templates.blank')} variant="secondary" onPress={() => pick()} testID="template-blank" />
      </ScrollView>
    </View>
  );
}
