import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import { EyeRestScreen, WaterLogScreen, OnboardingScreen } from '../screens';
import { useTheme } from '../theme';
import { TabsNavigator } from './TabsNavigator';
import { RouteNames, type RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) {
  const { theme } = useTheme();

  const baseModalOptions = (title: string) => ({
    title,
    presentation: 'modal' as const,
    headerShown: true,
    headerTintColor: theme.colors.text,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontFamily: theme.typography.familyRegular,
    },
    headerLeft: () => null,
  });

  const closeButton = (onPress: () => void) => (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ color: theme.colors.primaryDeep, fontSize: theme.typography.body }}>Close</Text>
    </Pressable>
  );

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name={RouteNames.Tabs}
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={RouteNames.Onboarding}
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={RouteNames.EyeRest}
        component={EyeRestScreen}
        options={({ navigation }) => ({
          ...baseModalOptions('Eye Rest'),
          headerRight: () => closeButton(() => navigation.goBack()),
        })}
      />
      <Stack.Screen
        name={RouteNames.WaterLog}
        component={WaterLogScreen}
        options={({ navigation }) => ({
          ...baseModalOptions('Water'),
          headerRight: () => closeButton(() => navigation.goBack()),
        })}
      />
    </Stack.Navigator>
  );
}
