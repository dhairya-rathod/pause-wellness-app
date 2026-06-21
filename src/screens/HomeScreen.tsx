import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { Button, Screen } from '../components';
import { useTheme } from '../theme';
import { RouteNames, type RootStackParamList } from '../navigation/routes';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();

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

        <View style={{ gap: theme.spacing.lg }}>
          <Button
            label="Start Eye Rest"
            onPress={() => navigation.navigate(RouteNames.EyeRest)}
            accessibilityLabel="Start eye rest"
          />
          <Button
            label="Log Water"
            variant="secondary"
            onPress={() => navigation.navigate(RouteNames.WaterLog)}
            accessibilityLabel="Log water"
          />
        </View>
      </View>
    </Screen>
  );
}
