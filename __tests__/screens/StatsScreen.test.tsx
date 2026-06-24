/// <reference types="jest" />
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RouteNames, type TabsParamList } from '../../src/navigation/routes';
import { StatsScreen } from '../../src/screens/StatsScreen';
import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { DailyLogProvider } from '../../src/state/DailyLogProvider';
import { ThemeProvider } from '../../src/theme';
import { dateKey } from '../../src/types/log';

const Tabs = createBottomTabNavigator<TabsParamList>();

function TestNavigator() {
  return (
    <NavigationContainer>
      <Tabs.Navigator>
        <Tabs.Screen
          name={RouteNames.Stats}
          component={StatsScreen}
          options={{ headerShown: false }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

async function renderStats(repo: InMemoryRepository) {
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

const today = dateKey(new Date());
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = dateKey(yesterdayDate);

describe('StatsScreen', () => {
  it('shows today counts after loading', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    await repo.upsertLog({ date: today, eyeBreaks: 2, waterGlasses: 4 });

    const { findByLabelText } = await renderStats(repo);

    await findByLabelText('2 eye breaks today');
    await findByLabelText('4 water glasses today');
  });

  it('renders 7-day dot grids for eye breaks and water', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    const { getAllByTestId } = await renderStats(repo);

    await waitFor(() => {
      const eyeDots = getAllByTestId(/eye-dot-/);
      expect(eyeDots).toHaveLength(7);

      const waterDots = getAllByTestId(/water-dot-/);
      expect(waterDots).toHaveLength(7);
    });
  });

  it('fills dots for days with activity and leaves empty days blank', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 8 });
    await repo.upsertLog({ date: yesterday, eyeBreaks: 1, waterGlasses: 0 });
    await repo.upsertLog({ date: today, eyeBreaks: 0, waterGlasses: 3 });

    const { getByTestId } = await renderStats(repo);

    await waitFor(() => {
      const yesterdayEye = getByTestId(`eye-dot-${yesterday}`);
      expect(yesterdayEye.props.style.backgroundColor).not.toBe('transparent');

      const todayEye = getByTestId(`eye-dot-${today}`);
      expect(todayEye.props.style.backgroundColor).toBe('transparent');

      const yesterdayWater = getByTestId(`water-dot-${yesterday}`);
      expect(yesterdayWater.props.style.backgroundColor).toBe('transparent');

      const todayWater = getByTestId(`water-dot-${today}`);
      expect(todayWater.props.style.backgroundColor).not.toBe('transparent');
    });
  });
});
