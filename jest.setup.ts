/// <reference types="jest" />
/**
 * App-specific Jest mocks, run after the test environment is installed.
 *
 * The jest-expo preset already mocks most native modules; these cover the few
 * app dependencies that need deterministic JS behavior in tests:
 *  - Inter fonts: resolve `useFonts` synchronously so App renders immediately.
 *  - expo-splash-screen: no-op the show/hide lifecycle.
 *  - react-native-safe-area-context: pass-through providers + zero insets.
 */
jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: () => [true, null],
  Inter_300Light: 'Inter-Light',
  Inter_400Regular: 'Inter-Regular',
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const defaultInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const defaultFrame = { x: 0, y: 0, width: 375, height: 812 };
  // Real context objects so @react-navigation/elements' SafeAreaProviderCompat
  // can useContext them without hitting `undefined`.
  const SafeAreaInsetsContext = React.createContext(defaultInsets);
  const SafeAreaFrameContext = React.createContext(defaultFrame);
  return {
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { style: { flex: 1 } }, children),
    useSafeAreaInsets: () => defaultInsets,
    useSafeAreaFrame: () => defaultFrame,
    useSafeArea: () => ({ insets: defaultInsets, frame: defaultFrame }),
  };
});
