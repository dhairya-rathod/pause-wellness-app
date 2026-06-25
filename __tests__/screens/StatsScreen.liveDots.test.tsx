/// <reference types="jest" />
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RouteNames, type TabsParamList } from '../../src/navigation/routes';
import { StatsScreen } from '../../src/screens/StatsScreen';
import {
  RepositoryProvider,
  InMemoryRepository,
} from '../../src/data';
import {
  DailyLogProvider,
  useDailyLog,
} from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';
import { dateKey } from '../../src/types/log';

const Tabs = createBottomTabNavigator<TabsParamList>();

const today = dateKey(new Date());

function Probe() {
  const { logGlass, completeBreak } = useDailyLog();
  return (
    <View>
      <Button
        testID="log-glass"
        title="log"
        onPress={() => {
          void logGlass();
        }}
      />
      <Button
        testID="complete-break"
        title="break"
        onPress={() => {
          void completeBreak();
        }}
      />
    </View>
  );
}

async function renderStats(repo: InMemoryRepository) {
  return render(
    <RepositoryProvider repository={repo}>
      <DailyLogProvider>
        <ThemeProvider mode="system">
          <NavigationContainer>
            <Tabs.Navigator>
              <Tabs.Screen
                name={RouteNames.Stats}
                component={StatsScreen}
                options={{ headerShown: false }}
              />
            </Tabs.Navigator>
          </NavigationContainer>
          <Probe />
        </ThemeProvider>
      </DailyLogProvider>
    </RepositoryProvider>
  );
}

describe('StatsScreen live dot fill (regression)', () => {
  it('fills today\'s water dot after logGlass without app reload', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getByTestId, findByTestId } = await renderStats(repo);

    // Wait for the today dot to exist (loading finished).
    await findByTestId(`water-dot-${today}`);

    expect(getByTestId(`water-dot-${today}`).props.style.backgroundColor).toBe(
      'transparent',
    );

    fireEvent.press(getByTestId('log-glass'));

    await waitFor(() => {
      const todayWater = getByTestId(`water-dot-${today}`);
      expect(todayWater.props.style.backgroundColor).not.toBe('transparent');
    });
  });

  it('fills today\'s eye dot after completeBreak without app reload', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getByTestId, findByTestId } = await renderStats(repo);

    await findByTestId(`eye-dot-${today}`);
    expect(getByTestId(`eye-dot-${today}`).props.style.backgroundColor).toBe(
      'transparent',
    );

    fireEvent.press(getByTestId('complete-break'));

    await waitFor(() => {
      const todayEye = getByTestId(`eye-dot-${today}`);
      expect(todayEye.props.style.backgroundColor).not.toBe('transparent');
    });
  });
});