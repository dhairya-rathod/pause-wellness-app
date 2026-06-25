/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RouteNames, type TabsParamList } from '../../src/navigation/routes';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { SettingsProvider } from '../../src/state/SettingsProvider';
import { ThemeProvider } from '../../src/theme';

const Tabs = createBottomTabNavigator<TabsParamList>();

function TestNavigator() {
  return (
    <NavigationContainer>
      <Tabs.Navigator>
        <Tabs.Screen
          name={RouteNames.Home}
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

async function renderHome(repo: InMemoryRepository) {
  return render(
    <RepositoryProvider repository={repo}>
      <SettingsProvider>
        <ThemeProvider mode="system">
          <TestNavigator />
        </ThemeProvider>
      </SettingsProvider>
    </RepositoryProvider>
  );
}

describe('HomeScreen', () => {
  it('labels the eye-rest and water buttons with hints', async () => {
    const repo = new InMemoryRepository({});
    const { getByRole } = await renderHome(repo);

    const eyeButton = await waitFor(() =>
      getByRole('button', { name: 'Start eye rest' })
    );
    expect(eyeButton.props.accessibilityHint).toBe(
      'Opens a 20-second guided eye break'
    );

    const waterButton = getByRole('button', { name: 'Log water' });
    expect(waterButton.props.accessibilityHint).toBe('Opens the water log');
  });

  it('toggles eye pause via the switch and persists', async () => {
    const repo = new InMemoryRepository({ eyePaused: false });
    const { getByRole } = await renderHome(repo);

    const toggle = await waitFor(() =>
      getByRole('switch', { name: 'Pause eye reminders' })
    );
    expect(toggle.props.accessibilityHint).toBe(
      'Pauses eye-break reminders until turned back on'
    );

    fireEvent(toggle, 'valueChange', true);
    await waitFor(async () => {
      expect((await repo.getSettings()).eyePaused).toBe(true);
    });
  });
});
