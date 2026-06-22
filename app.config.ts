import type { ExpoConfig } from "expo/config";

/**
 * Pause app config. Android-first; iOS deferred (see PRD). The dev client is
 * required for the notification scheduling path (slices 04/06) — Expo Go is
 * not sufficient — so `expo-dev-client` is wired as a plugin here.
 *
 * `userInterfaceStyle: 'automatic'` lets the app follow the system light/dark
 * setting (the ThemeProvider defaults to `mode: 'system'`).
 */
const config: ExpoConfig = {
  name: "Pause",
  slug: "pause",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  scheme: "pause",
  android: {
    package: "com.pause.app", // placeholder — confirm before launch
    adaptiveIcon: {
      backgroundColor: "#F4F1EA",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  // In SDK 56 the splash config lives in the expo-splash-screen plugin (the
  // top-level `splash` field was removed from the typed ExpoConfig). Light =
  // warm cream, dark = charcoal-green, with the on-theme pause mark.
  plugins: [
    "expo-dev-client",
    "expo-sqlite",
    ["expo-build-properties", { android: { minSdkVersion: 26 } }],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F4F1EA",
        image: "./assets/splash-icon.png",
        resizeMode: "contain" as const,
        imageWidth: 200,
        dark: { backgroundColor: "#1B2A22" },
      },
    ],
  ],
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "19c3ffe7-db31-4868-b064-8534260260c3",
    },
  },
};

export default config;
