/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RouteNames, type RootStackParamList } from '../../src/navigation/routes';
import { WaterLogScreen } from '../../src/screens/WaterLogScreen';
import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { SettingsProvider, useSettings } from '../../src/state/SettingsProvider';
import { SchedulingProvider } from '../../src/state/SchedulingProvider';
import {
  DailyLogProvider,
} from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

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

/** Calls `useSettings().updateSettings` when pressed — lets the test drive a
 * settings update from inside the provider tree, mirroring what SettingsScreen
 * does. */
function GoalProbe({ goal }: { goal: number }) {
  const { updateSettings } = useSettings();
  return (
    <View>
      <Button
        testID="set-goal"
        title="set"
        onPress={() => {
          void updateSettings({ waterGoalGlasses: goal });
        }}
      />
    </View>
  );
}

async function renderTree(repo: InMemoryRepository, goal: number) {
  return render(
    <RepositoryProvider repository={repo}>
      <SettingsProvider>
        <SchedulingProvider>
          <DailyLogProvider>
            <ThemeProvider mode="system">
              <TestNavigator />
              <GoalProbe goal={goal} />
            </ThemeProvider>
          </DailyLogProvider>
        </SchedulingProvider>
      </SettingsProvider>
    </RepositoryProvider>
  );
}

describe('WaterLogScreen — goal live updates from Settings', () => {
  it('reflects a settings goal change without an app reload', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { findByLabelText, getByTestId } = await renderTree(repo, 6);

    await findByLabelText('0 of 8 glasses');

    fireEvent.press(getByTestId('set-goal'));

    // Regression: previously the goal on WaterLogScreen stayed at 8 until
    // app restart because DailyLogProvider only read settings at mount.
    await findByLabelText('0 of 6 glasses');
  });
});