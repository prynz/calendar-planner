import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { ThemeProvider, type ThemeName } from '@nowish/ui';

import { useSettings, type ThemePreference } from './settings';

/** Dark is the brand default; "system" follows the OS (docs/design/design-system.md §8). */
export function resolveTheme(preference: ThemePreference, system: string | null | undefined): ThemeName {
  if (preference !== 'system') return preference;
  return system === 'light' ? 'light' : 'dark';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const system = useColorScheme();
  return <ThemeProvider name={resolveTheme(settings.theme, system)}>{children}</ThemeProvider>;
}
