import { type ReactNode } from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** accessibilityLabel defaults to label; pass an explicit one when the
   * visible label is ambiguous (e.g. an icon-only button). */
  accessibilityLabel?: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  children?: ReactNode;
};

/**
 * Calm, rounded, on-theme button. `primary` uses sage; `secondary` uses the
 * sand surface with a border. Press feedback is a gentle opacity dip.
 */
export function Button({
  label,
  onPress,
  accessibilityLabel,
  variant = 'primary',
  style,
  children,
}: ButtonProps) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        {
          backgroundColor: isPrimary ? theme.colors.primary : theme.colors.surface,
          borderColor: isPrimary ? 'transparent' : theme.colors.border,
          borderWidth: isPrimary ? 0 : 1,
          borderRadius: theme.radii.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {children ?? (
        <Text
          style={{
            color: isPrimary ? theme.colors.textOnPrimary : theme.colors.text,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.familyRegular,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
