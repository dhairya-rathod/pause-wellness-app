import { Text as RNText, type TextProps } from 'react-native';

/**
 * Themed text wrapper that respects the user's system font scale.
 *
 * - `allowFontScaling` defaults to `true` so users with larger accessibility
 *   font sizes can read app copy.
 * - `maxFontSizeMultiplier` caps growth at 1.5× to keep the calm single-screen
 *   layouts from breaking at extreme font sizes.
 */
export function Text({ allowFontScaling = true, maxFontSizeMultiplier = 1.5, ...rest }: TextProps) {
  return (
    <RNText
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
    />
  );
}
