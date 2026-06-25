/// <reference types="jest" />
import { lightTheme, darkTheme } from '../../src/theme';

/**
 * Relative luminance of an sRGB color.
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const rs = h.substring(0, 2);
  const gs = h.substring(2, 4);
  const bs = h.substring(4, 6);

  const [r, g, b] = [rs, gs, bs].map((channel) => {
    const c = parseInt(channel, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Semantically meaningful text-on-surface pairs from the theme. These are the
 * realistic combinations used by the UI; every body, label, or state message
 * must clear WCAG AA (4.5:1) for normal-sized text.
 */
const PAIRS: { textToken: string; surfaceToken: string }[] = [
  { textToken: 'text', surfaceToken: 'background' },
  { textToken: 'text', surfaceToken: 'surface' },
  { textToken: 'text', surfaceToken: 'surfaceAlt' },
  { textToken: 'textMuted', surfaceToken: 'background' },
  { textToken: 'textMuted', surfaceToken: 'surface' },
  { textToken: 'textMuted', surfaceToken: 'surfaceAlt' },
  { textToken: 'textOnPrimary', surfaceToken: 'primary' },
  { textToken: 'primaryText', surfaceToken: 'background' },
  { textToken: 'primaryText', surfaceToken: 'surface' },
  { textToken: 'primaryText', surfaceToken: 'surfaceAlt' },
];

type ColorTheme = typeof lightTheme | typeof darkTheme;

describe('theme contrast', () => {
  const cases: { name: string; theme: ColorTheme }[] = [
    { name: 'light', theme: lightTheme },
    { name: 'dark', theme: darkTheme },
  ];

  cases.forEach(({ name, theme }) => {
    describe(name, () => {
      PAIRS.forEach(({ textToken, surfaceToken }) => {
        const textColor = theme.colors[textToken as keyof typeof theme.colors];
        const surfaceColor = theme.colors[surfaceToken as keyof typeof theme.colors];

        if (typeof textColor !== 'string' || typeof surfaceColor !== 'string') {
          return;
        }

        it(`${textToken} on ${surfaceToken} meets AA`, () => {
          const ratio = contrastRatio(textColor, surfaceColor);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
      });
    });
  });
});
