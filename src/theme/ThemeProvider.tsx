import { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { type ThemeMode } from '../types/settings';
import { darkTheme, lightTheme, type Theme } from './tokens';

type ThemeContextValue = {
  /** Resolved theme tokens (light or dark). */
  theme: Theme;
  /** The mode requested (system | light | dark). */
  mode: ThemeMode;
  /** The actually-rendered scheme ('light' | 'dark'). */
  scheme: 'light' | 'dark';
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  /**
   * Defaults to 'system', which follows the device setting. Slice 02 will pass
   * the persisted `themeMode` setting here; the provider is shaped so that swap
   * needs no restructuring.
   */
  mode?: ThemeMode;
  children: ReactNode;
};

export function ThemeProvider({ mode = 'system', children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: 'light' | 'dark' =
      mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return {
      theme: scheme === 'dark' ? darkTheme : lightTheme,
      mode,
      scheme,
    };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
