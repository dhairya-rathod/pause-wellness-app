/// <reference types="jest" />
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccessibilityInfo } from 'react-native';

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
    const { findByText, findByLabelText } = await renderEyeRest(repo);

    await findByText('look 20 ft away · breathe');
    await findByText('20');

    const ring = await findByLabelText('20 seconds remaining');
    expect(ring.props.accessibilityLiveRegion).toBe('polite');
  });

  it('completing the full 20 s logs a break, announces completion, and persists', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    await renderEyeRest(repo);

    // Advance through the full countdown (20 × 1000 ms ticks) plus the
    // completion-announcement delay.
    await act(async () => {
      jest.advanceTimersByTime(21_000);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Eye rest complete'
    );

    // The async completeBreak → upsertLog chain needs a microtask flush.
    // Poll until the repo reflects the persisted break.
    const today = todayKey();
    await waitFor(async () => {
      const saved = await repo.getLog(today);
      expect(saved.eyeBreaks).toBe(1);
    });
  });

  it('counts the ring down by depleting one tick per second', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getAllByTestId, getByTestId } = await renderEyeRest(repo);

    // 20 ticks render at start; all share the lit color (tick-0 with tick-19).
    await waitFor(() => {
      expect(getAllByTestId(/tick-\d+/)).toHaveLength(20);
    });
    const litColor = getByTestId('tick-0').props.style.backgroundColor;
    expect(litColor).toBeTruthy();
    expect(getByTestId('tick-19').props.style.backgroundColor).toBe(litColor);

    // After 1 s, one tick (the last one) depletes — the ring visibly moved
    // this second. This is the regression: the previous implementation rotated
    // a symmetric annulus about its own center, which produces zero visible
    // change regardless of progress.
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('tick-19').props.style.backgroundColor).not.toBe(
      litColor
    );
    // The rest stay lit this second.
    expect(getByTestId('tick-0').props.style.backgroundColor).toBe(litColor);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    // 6 seconds total elapsed → ticks 14..19 unlit, 0..13 lit.
    for (let i = 14; i < 20; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).not.toBe(
        litColor
      );
    }
    for (let i = 0; i < 14; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).toBe(
        litColor
      );
    }
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
