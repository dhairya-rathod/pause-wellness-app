import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable, Switch, View } from 'react-native';

import { Button, Screen, Text } from '../components';
import { useSettings } from '../state/SettingsProvider';
import { useTheme } from '../theme';
import { RouteNames, type RootStackParamList } from '../navigation/routes';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const { settings, updateSettings } = useSettings();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.xxl }}>
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.display,
              fontFamily: theme.typography.familyLight,
            }}
          >
            Pause
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.body,
              fontFamily: theme.typography.familyRegular,
            }}
          >
            A calm moment, whenever you need one.
          </Text>
        </View>

        <Pressable
          onPress={() => updateSettings({ eyePaused: !settings.eyePaused })}
          accessible={false}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            gap: theme.spacing.md,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.body,
              fontFamily: theme.typography.familyRegular,
              flexShrink: 1,
            }}
          >
            Pause eye reminders
          </Text>
          <Switch
            value={settings.eyePaused}
            onValueChange={(v) => updateSettings({ eyePaused: v })}
            trackColor={{ true: theme.colors.primary }}
            accessibilityLabel="Pause eye reminders"
            accessibilityHint="Pauses eye-break reminders until turned back on"
          />
        </Pressable>

        <View style={{ gap: theme.spacing.lg }}>
          <Button
            label="Start Eye Rest"
            onPress={() => navigation.navigate(RouteNames.EyeRest)}
            accessibilityLabel="Start eye rest"
            accessibilityHint="Opens a 20-second guided eye break"
          />
          <Button
            label="Log Water"
            variant="secondary"
            onPress={() => navigation.navigate(RouteNames.WaterLog)}
            accessibilityLabel="Log water"
            accessibilityHint="Opens the water log"
          />
        </View>
      </View>
    </Screen>
  );
}
