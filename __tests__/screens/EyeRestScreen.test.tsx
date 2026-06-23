/// <reference types="jest" />
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RouteNames, type RootStackParamList } from '../../src/navigation/routes';
import { EyeRestScreen } from '../../src/screens/EyeRestScreen';
import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { DailyLogProvider } from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';
import { todayKey } from '../../src/types/log';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Minimal navigator wrapping EyeRestScreen as a modal so the screen sees
 * a real navigation context (same shape as RootNavigator).
 */
function TestNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={RouteNames.EyeRest}
          component={EyeRestScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

async function renderEyeRest(repo: InMemoryRepository) {
  return render(
    <RepositoryProvider repository={repo}>
      <DailyLogProvider>
        <ThemeProvider mode="system">
          <TestNavigator />
        </ThemeProvider>
      </DailyLogProvider>
    </RepositoryProvider>
  );
}

describe('EyeRestScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the breathing prompt and initial countdown', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { findByText } = await renderEyeRest(repo);

    await findByText('look 20 ft away · breathe');
    await findByText('20');
  });

  it('completing the full 20 s logs a break and persists', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    await renderEyeRest(repo);

    // Advance through the full countdown (20 × 1000 ms ticks).
    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });

    // The async completeBreak → upsertLog chain needs a microtask flush.
    // Poll until the repo reflects the persisted break.
    const today = todayKey();
    await waitFor(async () => {
      const saved = await repo.getLog(today);
      expect(saved.eyeBreaks).toBe(1);
    });
  });

  it('dismissing early logs nothing', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { unmount } = await renderEyeRest(repo);

    // Simulate early dismissal before any ticks fire.
    unmount();

    const today = todayKey();
    const saved = await repo.getLog(today);
    expect(saved.eyeBreaks).toBe(0);
  });
});
