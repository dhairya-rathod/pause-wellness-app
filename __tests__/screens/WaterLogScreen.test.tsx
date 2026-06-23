/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RouteNames, type RootStackParamList } from '../../src/navigation/routes';
import { WaterLogScreen } from '../../src/screens/WaterLogScreen';
import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { DailyLogProvider } from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';
import { todayKey } from '../../src/types/log';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Minimal navigator wrapping WaterLogScreen as a modal so the screen sees
 * a real navigation context (same shape as RootNavigator).
 */
function TestNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={RouteNames.WaterLog}
          component={WaterLogScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

async function renderWaterLog(repo: InMemoryRepository) {
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

describe('WaterLogScreen', () => {
  it('shows the count and goal after initial load', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { findByLabelText } = await renderWaterLog(repo);

    // The store loads async — the progress bar has an accessibilityLabel
    // like "0 of 8 glasses" once the data is loaded.
    await findByLabelText('0 of 8 glasses');
  });

  it('logs a glass and persists', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getByRole } = await renderWaterLog(repo);

    const logButton = await waitFor(() =>
      getByRole('button', { name: 'Log a glass' })
    );
    fireEvent.press(logButton);

    // Persistence: the repo should reflect the new count for today.
    const today = todayKey();
    const saved = await repo.getLog(today);
    expect(saved.waterGlasses).toBe(1);
  });

  it('undoes a glass', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getByRole, findByRole } = await renderWaterLog(repo);

    // Log one first.
    fireEvent.press(await findByRole('button', { name: 'Log a glass' }));

    // Wait for the undo button to appear (state update is async via setState).
    fireEvent.press(
      await findByRole('button', { name: 'Undo last glass' })
    );

    const today = todayKey();
    const saved = await repo.getLog(today);
    expect(saved.waterGlasses).toBe(0);
  });

  it('shows the hydrated state when goal is reached', async () => {
    // Seed a small goal so one log hits it.
    const repo = new InMemoryRepository({ waterGoalGlasses: 1 });
    const { getByRole, findByText } = await renderWaterLog(repo);

    const logButton = await waitFor(() =>
      getByRole('button', { name: 'Log a glass' })
    );
    fireEvent.press(logButton);

    const hydratedMsg = await findByText("You're hydrated — well done.");
    expect(hydratedMsg).toBeTruthy();
  });

  it('clears the hydrated state when undoing below goal', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 1 });
    const { getByRole, findByText, queryByText } =
      await renderWaterLog(repo);

    // Reach hydrated.
    fireEvent.press(
      await waitFor(() => getByRole('button', { name: 'Log a glass' }))
    );
    await findByText("You're hydrated — well done.");

    // Undo — hydrated should clear. Use getByRole after a short wait
    // (the button was already found, re-render may have occurred).
    fireEvent.press(getByRole('button', { name: 'Undo last glass' }));

    await waitFor(() => {
      expect(queryByText("You're hydrated — well done.")).toBeNull();
    });
  });
});
