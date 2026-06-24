/// <reference types="jest" />
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { DailyLogProvider, useDailyLog } from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';

jest.mock('../../src/types/log', () => ({
  ...jest.requireActual('../../src/types/log'),
  todayKey: () => '2026-06-24',
}));

function Dump() {
  const { loading, eyeBreaks, waterGlasses, recent } = useDailyLog();
  return (
    <Text testID="dump">
      {loading ? 'loading' : `${eyeBreaks}|${waterGlasses}|${recent.length}`}
    </Text>
  );
}

async function renderProvider(repo: InMemoryRepository) {
  return render(
    <RepositoryProvider repository={repo}>
      <DailyLogProvider>
        <ThemeProvider mode="system">
          <Dump />
        </ThemeProvider>
      </DailyLogProvider>
    </RepositoryProvider>
  );
}

describe('DailyLogProvider rollover', () => {
  it('cold-starts across a day boundary and resets counts to zero', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    // Simulate yesterday's session that never rolled over.
    await repo.upsertLog({ date: '2026-06-23', eyeBreaks: 3, waterGlasses: 5 });

    const { getByTestId } = await renderProvider(repo);

    await waitFor(() => {
      expect(getByTestId('dump')).toHaveTextContent('0|0|1');
    });

    // Yesterday was archived into recent and a fresh today row was persisted.
    const today = await repo.getLog('2026-06-24');
    expect(today).toEqual({ date: '2026-06-24', eyeBreaks: 0, waterGlasses: 0 });

    const yesterday = await repo.getLog('2026-06-23');
    expect(yesterday).toEqual({ date: '2026-06-23', eyeBreaks: 3, waterGlasses: 5 });
  });
});
