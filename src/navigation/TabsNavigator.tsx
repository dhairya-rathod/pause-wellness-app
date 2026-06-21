import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { type ComponentProps } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import {
  EyeRestScreen,
  HomeScreen,
  SettingsScreen,
  StatsScreen,
  WaterLogScreen,
} from '../screens';
import { RouteNames, type TabsParamList } from './routes';

const Tabs = createBottomTabNavigator<TabsParamList>();

/**
 * A calm, minimal tab icon: a small rounded mark in the theme palette. Kept
 * geometric (no icon-library dependency) for this slice; later slices may swap
 * in a proper icon set.
 */
function TabMark({ color, shape }: { color: string; shape: 'circle' | 'grid' | 'sliders' }) {
  if (shape === 'grid') {
    return (
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {[0, 1].map((r) => (
          <View key={r} style={{ flexDirection: 'column', gap: 3 }}>
            {[0, 1].map((c) => (
              <View key={c} style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: color }} />
            ))}
          </View>
        ))}
      </View>
    );
  }
  if (shape === 'sliders') {
    return (
      <View style={{ flexDirection: 'column', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: color }} />
        ))}
      </View>
    );
  }
  return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />;
}

type TabIconProps = ComponentProps<typeof View> & { color: string };

export function TabsNavigator() {
  const { theme } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.colors.text,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: theme.typography.title,
          fontFamily: theme.typography.familyRegular,
        },
        tabBarActiveTintColor: theme.colors.primaryDeep,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.caption,
          fontFamily: theme.typography.familyRegular,
        },
      }}
    >
      <Tabs.Screen
        name={RouteNames.Home}
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: TabIconProps) => <TabMark color={color} shape="circle" />,
        }}
      />
      <Tabs.Screen
        name={RouteNames.Stats}
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }: TabIconProps) => <TabMark color={color} shape="grid" />,
        }}
      />
      <Tabs.Screen
        name={RouteNames.Settings}
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }: TabIconProps) => <TabMark color={color} shape="sliders" />,
        }}
      />
    </Tabs.Navigator>
  );
}

// Re-exported so the root navigator can import all screens from one place if needed.
export { EyeRestScreen, WaterLogScreen };
