/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { RepositoryProvider, InMemoryRepository } from '../../src/data';
import {
  SchedulingProvider,
} from '../../src/state/SchedulingProvider';
import { SettingsProvider } from '../../src/state/SettingsProvider';

// Mock the scheduling functions so we can count calls without real native modules.
jest.mock('../../src/scheduling/waterScheduler', () => ({
  rescheduleWaterReminders: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../src/scheduling/eyeScheduler', () => ({
  rescheduleEyeReminders: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../src/permissions/notifications', () => ({
  ensureNotificationChannels: jest.fn(() => Promise.resolve()),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const waterModule = require('../../src/scheduling/waterScheduler');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const eyeModule = require('../../src/scheduling/eyeScheduler');

function App() {
  return <Text>hi</Text>;
}

async function renderSchedulingTree() {
  const repo = new InMemoryRepository();
  return render(
    <RepositoryProvider repository={repo}>
      <SettingsProvider>
        <SchedulingProvider>
          <App />
        </SchedulingProvider>
      </SettingsProvider>
    </RepositoryProvider>,
  );
}

describe('SchedulingProvider — single reschedule on mount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls each reschedule function exactly once on initial mount (no concurrent double-scheduling)', async () => {
    await renderSchedulingTree();
    expect(waterModule.rescheduleWaterReminders).toHaveBeenCalledTimes(1);
    expect(eyeModule.rescheduleEyeReminders).toHaveBeenCalledTimes(1);
  });
});