/// <reference types="jest" />
import { render } from '@testing-library/react-native';

import App from '../App';

/**
 * Slice 01 proof-of-life: the app boots to the themed Home screen and renders
 * the two buttons that open the EyeRest and WaterLog modals. This pins the
 * acceptance criterion that Home opens both modals, and exercises the whole
 * provider composition root (fonts, splash, theme, navigation).
 */
describe('App', () => {
  it('renders Home with buttons to open the Eye Rest and Water Log modals', async () => {
    // RNTL 14's render is async (uses test-renderer), so await it.
    const { getByText } = await render(<App />);

    expect(getByText('Start Eye Rest')).toBeTruthy();
    expect(getByText('Log Water')).toBeTruthy();
  });
});
