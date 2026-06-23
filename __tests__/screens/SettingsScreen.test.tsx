/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import { SettingsProvider } from '../../src/state/SettingsProvider';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { ThemeProvider } from '../../src/theme';

async function renderSettings(repo: InMemoryRepository) {
  return render(
    <RepositoryProvider repository={repo}>
      <SettingsProvider>
        <ThemeProvider mode="system">
          <SettingsScreen />
        </ThemeProvider>
      </SettingsProvider>
    </RepositoryProvider>,
  );
}

describe('SettingsScreen', () => {
  it('toggles reminder sounds off and persists', async () => {
    const repo = new InMemoryRepository({ soundEnabled: true });
    const { getByRole } = await renderSettings(repo);

    const toggle = getByRole('switch', { name: 'Reminder sounds' });
    expect(toggle.props.value).toBe(true);

    fireEvent(toggle, 'valueChange', false);
    await waitFor(async () => {
      expect((await repo.getSettings()).soundEnabled).toBe(false);
    });
  });

  it('toggles water reminders off and persists', async () => {
    const repo = new InMemoryRepository({ waterEnabled: true });
    const { getByRole } = await renderSettings(repo);

    const toggle = getByRole('switch', { name: 'Water reminders' });
    fireEvent(toggle, 'valueChange', false);

    await waitFor(async () => {
      expect((await repo.getSettings()).waterEnabled).toBe(false);
    });
  });

  it('shows the default goal value', async () => {
    const repo = new InMemoryRepository({ waterGoalGlasses: 6 });
    const { getByDisplayValue } = await renderSettings(repo);

    await waitFor(() => {
      expect(getByDisplayValue('6')).toBeTruthy();
    });
  });

  it('shows current active hours', async () => {
    const repo = new InMemoryRepository({
      activeHoursStart: '09:00',
      activeHoursEnd: '18:00',
    });
    const { getByDisplayValue } = await renderSettings(repo);

    await waitFor(() => {
      expect(getByDisplayValue('09:00')).toBeTruthy();
      expect(getByDisplayValue('18:00')).toBeTruthy();
    });
  });
});
