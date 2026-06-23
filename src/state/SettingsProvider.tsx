import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useRepository } from '../data';
import { DEFAULT_SETTINGS, type Settings } from '../types/settings';

export type SettingsValue = {
  settings: Settings;
  loading: boolean;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
};

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

/**
 * Loads settings from the repository on mount and exposes them reactively.
 *
 * `updateSettings(patch)` merges the supplied fields over the current
 * settings and persists via `repo.setSettings` so downstream providers
 * (SchedulingProvider) can observe and react to changes.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const repo = useRepository();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await repo.getSettings();
      setSettings(s);
      setLoading(false);
    })();
  }, [repo]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      await repo.setSettings(next);
      setSettings(next);
    },
    [repo, settings],
  );

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Returns the current settings and an update function.
 *
 * Throws if called outside a {@link SettingsProvider}.
 */
export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error(
      'useSettings must be used within a SettingsProvider',
    );
  }
  return ctx;
}
