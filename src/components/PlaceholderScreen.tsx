import { Text, View } from 'react-native';

import { Screen } from './Screen';
import { useTheme } from '../theme';

type PlaceholderScreenProps = {
  title: string;
  hint: string;
};

/**
 * Calm placeholder for screens whose real implementation arrives in a later
 * slice (Stats, Settings, EyeRest, WaterLog). Centered title + hint on the
 * themed background so the structure is demoable now.
 */
export function PlaceholderScreen({ title, hint }: PlaceholderScreenProps) {
  const { theme } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.heading,
            fontFamily: theme.typography.familyLight,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.familyRegular,
            textAlign: 'center',
          }}
        >
          {hint}
        </Text>
      </View>
    </Screen>
  );
}
