/// <reference types="jest" />
import { render } from '@testing-library/react-native';

import { ThemeProvider } from '../../src/theme';
import { TicksRing } from '../../src/components/TicksRing';
import { lightTheme } from '../../src/theme/tokens';

async function renderTicks(props: React.ComponentProps<typeof TicksRing>) {
  return render(
    <ThemeProvider mode="light">
      <TicksRing {...props} />
    </ThemeProvider>
  );
}

describe('TicksRing', () => {
  it('renders 20 ticks by default with stable testIDs', async () => {
    const { getAllByTestId } = await renderTicks({ lit: 20 });
    const ticks = getAllByTestId(/tick-\d+/);
    expect(ticks).toHaveLength(20);
    for (let i = 0; i < 20; i++) {
      expect(getAllByTestId(`tick-${i}`)).toHaveLength(1);
    }
  });

  it('lights all 20 ticks when lit = 20', async () => {
    const { getByTestId } = await renderTicks({ lit: 20 });
    for (let i = 0; i < 20; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).toBe(
        lightTheme.colors.primary
      );
    }
  });

  it('leaves all ticks in the dim track color when lit = 0', async () => {
    const { getByTestId } = await renderTicks({ lit: 0 });
    for (let i = 0; i < 20; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).toBe(
        lightTheme.colors.surfaceAlt
      );
    }
  });

  it('lights ticks 0 .. lit-1 and dims lit .. total-1 (per-second depletion)', async () => {
    // After 5 seconds elapsed, 5 ticks have turned off, so lit=15.
    const { getByTestId } = await renderTicks({ lit: 15 });
    for (let i = 0; i < 15; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).toBe(
        lightTheme.colors.primary
      );
    }
    for (let i = 15; i < 20; i++) {
      expect(getByTestId(`tick-${i}`).props.style.backgroundColor).toBe(
        lightTheme.colors.surfaceAlt
      );
    }
  });

  it('exposes a progressbar role with the live lit count', async () => {
    const { findByLabelText } = await renderTicks({ lit: 15 });
    const ring = await findByLabelText('15 of 20 ticks lit');
    expect(ring.props.accessibilityRole).toBe('progressbar');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 20, now: 15 });
  });
});