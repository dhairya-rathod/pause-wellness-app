import { useContext } from 'react';

import { ThemeContext } from './ThemeProvider';

/**
 * Access the resolved theme. Throws if used outside a ThemeProvider so misuse
 * fails fast rather than rendering unstyled.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
