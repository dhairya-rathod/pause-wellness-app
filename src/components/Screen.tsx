import { type ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

type ScreenProps = {
  children: ReactNode;
  /** Disables the outer scroll (e.g. for full-bleed modal content). */
  scroll?: boolean;
  style?: ViewStyle;
};

/**
 * Themed full-screen wrapper: calm background, safe-area aware, optional
 * scroll. Every screen composes on top of this so spacing + background stay
 * consistent across the app and across light/dark.
 */
export function Screen({ children, scroll = true, style }: ScreenProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.xl,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
