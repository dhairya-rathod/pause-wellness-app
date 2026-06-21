import { useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts, Inter_300Light, Inter_400Regular } from '@expo-google-fonts/inter';

import { RootNavigator, linking } from './src/navigation';
import { ThemeProvider, useTheme } from './src/theme';

// Keep the splash visible until fonts + first paint are ready.
SplashScreen.preventAutoHideAsync().catch(() => {
  // In some environments (tests) this is a no-op; ignore.
});

function ThemedApp() {
  const { theme, scheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
  });

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // ignore — splash may already be hidden
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

  if (!fontsLoaded && !fontError) {
    // Splash still covering; render nothing underneath to avoid a flash.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider mode="system">
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
