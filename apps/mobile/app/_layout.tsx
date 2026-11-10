import { BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorState, ThemeProvider, useTheme } from '@nowish/ui';
import { createTranslator } from '@nowish/i18n';

import { ClockProvider } from '@/providers/clock';
import { DemoWorldProvider } from '@/providers/demo-world';
import { I18nProvider } from '@/providers/i18n';
import { SettingsProvider, useSettings } from '@/providers/settings';
import { AppThemeProvider } from '@/providers/theme';
import { createSqliteSettingsStore } from '@/storage/settings-store';

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.warn('[splash] preventAutoHide failed', error instanceof Error ? error.name : 'unknown');
});

function Shell() {
  const { state } = useSettings();
  const { name } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });
  // Font failure is not fatal: system fonts take over.
  const ready = state !== 'loading' && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (fontError) console.warn('[fonts] failed to load, using system fonts', fontError.name);
  }, [fontError]);
  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch((error: unknown) => {
      console.warn('[splash] hide failed', error instanceof Error ? error.name : 'unknown');
    });
  }, [ready]);

  if (!ready) return null;
  // On iOS react-native-screens owns the status bar per screen and otherwise follows the *system*
  // appearance (white text on our cream light theme). Setting it on the root stack keeps it in sync
  // with the app theme; expo-status-bar covers the time before the first screen mounts.
  const barStyle = name === 'dark' ? 'light' : 'dark';
  return (
    <>
      <StatusBar style={barStyle} />
      <Stack screenOptions={{ headerShown: false, statusBarStyle: barStyle }} />
    </>
  );
}

export default function RootLayout() {
  const [store] = useState(createSqliteSettingsStore);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider store={store}>
          <I18nProvider>
            <AppThemeProvider>
              <ClockProvider>
                <DemoWorldProvider>
                  <Shell />
                </DemoWorldProvider>
              </ClockProvider>
            </AppThemeProvider>
          </I18nProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Route-level crash screen (expo-router). Outside the providers, so it uses German defaults. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const t = createTranslator('de');
  return (
    <ThemeProvider name="dark">
      <SafeAreaProvider>
        <ErrorState
          title={t('common.error.title')}
          body={t('common.error.body')}
          retryLabel={t('common.retry')}
          onRetry={retry}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
