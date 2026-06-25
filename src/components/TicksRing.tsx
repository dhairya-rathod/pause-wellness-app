import { View } from 'react-native';

import { useTheme } from '../theme';

type TicksRingProps = {
  /** Count of lit ticks, counted clockwise from 12 o'clock. 0 .. total. */
  lit: number;
  /** Total ticks around the ring. */
  total?: number;
  /** Outer side dimension (square) of the ring, in px. */
  size?: number;
};

const DEFAULT_TOTAL = 20;
const DEFAULT_SIZE = 200;
const TICK_WIDTH = 4;
const TICK_HEIGHT = 14;

/**
 * A depleting countdown ring rendered as `total` radial ticks around a circle.
 *
 * - Tick `0` sits at 12 o'clock; indices increase clockwise. Tick `i` is lit
 *   iff `i < lit`, so the ring visibly loses one tick per second when `lit`
 *   is bound to a per-second countdown.
 *
 * Pure RN Views + transforms — no SVG dependency. Track ticks use
 * `surfaceAlt`; lit ticks use `primary`. The outer wrapper exposes a
 * progressbar role + `${lit} of ${total} ticks lit` for assistive tech.
 */
export function TicksRing({
  lit,
  total = DEFAULT_TOTAL,
  size = DEFAULT_SIZE,
}: TicksRingProps) {
  const { theme } = useTheme();
  const litColor = theme.colors.primary;
  const trackColor = theme.colors.surfaceAlt;
  const clamped = Math.max(0, Math.min(lit, total));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${clamped} of ${total} ticks lit`}
      accessibilityValue={{ min: 0, max: total, now: clamped }}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: total }, (_, i) => {
        const angle = -90 + (i / total) * 360;
        const filled = i < clamped;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              transform: [{ rotate: `${angle}deg` }],
            }}
          >
            <View
              testID={`tick-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: (size - TICK_WIDTH) / 2,
                width: TICK_WIDTH,
                height: TICK_HEIGHT,
                borderRadius: TICK_WIDTH / 2,
                backgroundColor: filled ? litColor : trackColor,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}