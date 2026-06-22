import { createContext, useContext, type ReactNode } from 'react';
import type { Repository } from './Repository';

/**
 * Context that holds a {@link Repository} instance.
 *
 * Created when the database is opened in App.tsx and injected via
 * `RepositoryProvider` so every app component can consume the data layer
 * through the abstract interface (never the concrete sqlite impl).
 */
const RepositoryContext = createContext<Repository | undefined>(undefined);

export function RepositoryProvider({
  repository,
  children,
}: {
  repository: Repository;
  children: ReactNode;
}) {
  return (
    <RepositoryContext.Provider value={repository}>
      {children}
    </RepositoryContext.Provider>
  );
}

/**
 * Returns the current {@link Repository}.
 *
 * Throws if called outside a `RepositoryProvider` — fail-fast for mis-wired
 * composition (same pattern as `useTheme`).
 */
export function useRepository(): Repository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error(
      'useRepository must be used within a RepositoryProvider'
    );
  }
  return repo;
}
