import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts, Inter_300Light, Inter_400Regular } from '@expo-google-fonts/inter';

import { RootNavigator, linking, RouteNames, type RootStackParamList } from './src/navigation';
import { ThemeProvider, useTheme } from './src/theme';
import {
  type Repository,
  RepositoryProvider,
  createRepository,
} from './src/data';
import { DailyLogProvider } from './src/state/DailyLogProvider';

// Keep the splash visible until fonts + repository are ready.
SplashScreen.preventAutoHideAsync().catch(() => {
  // In some environments (tests) this is a no-op; ignore.
});

function ThemedApp({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) {
  const { theme, scheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
        <RootNavigator initialRouteName={initialRouteName} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
  });
  const [repo, setRepo] = useState<Repository | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  // Bootstrap the database and decide the initial route before showing UI.
  useEffect(() => {
    (async () => {
      const r = await createRepository();
      const settings = await r.getSettings();
      setRepo(r);
      setInitialRoute(
        settings.onboardingComplete ? RouteNames.Tabs : RouteNames.Onboarding
      );
    })();
  }, []);

  const ready = (fontsLoaded || fontError) && repo && initialRoute;

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // ignore — splash may already be hidden
    }
  }, []);

  useEffect(() => {
    if (ready) {
      hideSplash();
    }
  }, [ready, hideSplash]);

  if (!ready) {
    // Splash still covering; render nothing underneath to avoid a flash.
    return null;
  }

  return (
    <SafeAreaProvider>
      <RepositoryProvider repository={repo}>
        <DailyLogProvider>
          <ThemeProvider mode="system">
            <ThemedApp initialRouteName={initialRoute} />
          </ThemeProvider>
        </DailyLogProvider>
      </RepositoryProvider>
    </SafeAreaProvider>
  );
}
