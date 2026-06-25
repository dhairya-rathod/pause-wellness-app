import { View } from 'react-native';

import { useTheme } from '../theme';
import { previousDays, type DailyLog } from '../types/log';

type Feature = 'eye' | 'water';

type DotGridProps = {
  feature: Feature;
  today: string;
  recent: DailyLog[];
  accessibilityLabel?: string;
};

/**
 * A soft 7-day dot grid for a single feature.
 *
 * - One dot per calendar day for the last 7 days (today-6 .. today), ordered
 *   left-to-right as a timeline.
 * - Filled when there was any activity that day; empty otherwise.
 * - No numbers, no streaks, no targets — just a calm visual pattern.
 */
export function DotGrid({ feature, today, recent, accessibilityLabel }: DotGridProps) {
  const { theme } = useTheme();
  const logsByDate = new Map(recent.map((log) => [log.date, log]));
  const days = previousDays(today, 7);

  const filledDays = days.filter((date) => {
    const log = logsByDate.get(date);
    if (!log) return false;
    return feature === 'eye' ? log.eyeBreaks > 0 : log.waterGlasses > 0;
  }).length;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={
        accessibilityLabel ??
        `${feature === 'eye' ? 'Eye breaks' : 'Water glasses'}: ${filledDays} of the last 7 days`
      }
      accessibilityValue={{ min: 0, max: 7, now: filledDays }}
      style={{ flexDirection: 'row', gap: theme.spacing.sm }}
    >
      {days.map((date) => {
        const log = logsByDate.get(date);
        const filled = log
          ? feature === 'eye'
            ? log.eyeBreaks > 0
            : log.waterGlasses > 0
          : false;

        return (
          <View
            key={date}
            testID={`${feature}-dot-${date}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: filled ? theme.colors.primary : 'transparent',
              borderWidth: 1,
              borderColor: filled ? theme.colors.primary : theme.colors.surfaceAlt,
            }}
          />
        );
      })}
    </View>
  );
}
