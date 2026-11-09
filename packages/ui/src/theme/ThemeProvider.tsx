import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { themes, type ThemeColors, type ThemeName } from '../tokens';

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
}

const ThemeContext = createContext<Theme>({ name: 'dark', colors: themes.dark });

export function ThemeProvider({ name, children }: { name: ThemeName; children: ReactNode }) {
  const value = useMemo<Theme>(() => ({ name, colors: themes[name] }), [name]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
