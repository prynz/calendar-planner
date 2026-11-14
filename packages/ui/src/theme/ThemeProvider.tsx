import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { themeColors, themes, type AccentName, type ThemeColors, type ThemeName } from '../tokens';

export interface Theme {
  name: ThemeName;
  accent: AccentName;
  colors: ThemeColors;
}

const ThemeContext = createContext<Theme>({ name: 'dark', accent: 'sunrise', colors: themes.dark });

export function ThemeProvider({
  name,
  accent = 'sunrise',
  children,
}: {
  name: ThemeName;
  accent?: AccentName;
  children: ReactNode;
}) {
  const value = useMemo<Theme>(() => ({ name, accent, colors: themeColors(name, accent) }), [name, accent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
