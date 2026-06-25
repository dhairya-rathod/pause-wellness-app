import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen, TicksRing, Text } from '../components';
import { useDailyLog } from '../state/DailyLogProvider';
import { useTheme } from '../theme';

const DURATION_S = 20;

/**
 * Calm guided 20-second eye-rest experience.
 *
 * - A `setInterval`-driven countdown ticks every second; when it reaches 0
 *   `completeBreak` is called (logs one `eyeBreak` via the daily state machine)
 *   and the modal dismisses.
 * - A slow breathing animation (~5s in / ~5s out) plays on a centered circle.
 * - A countdown ring depletes over the 20 seconds using two half-circle clips
 *   rotated by animated values.
 * - Early dismissal (Close button / back gesture) logs nothing.
 */
export function EyeRestScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { loading, completeBreak } = useDailyLog();

  // ---- countdown timer ------------------------------------------------

  const [secondsLeft, setSecondsLeft] = useState(DURATION_S);
  const completedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Announce completion, persist, and dismiss exactly once when the countdown
  // reaches 0. The short delay lets the assertive announcement finish before
  // the modal disappears.
  useEffect(() => {
    if (secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      AccessibilityInfo.announceForAccessibility('Eye rest complete');
      const t = setTimeout(() => {
        (async () => {
          await completeBreak();
          navigation.goBack();
        })();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [secondsLeft, completeBreak, navigation]);

  // ---- breathing animation --------------------------------------------

  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim]);

  const breatheScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  // ---- countdown ring (depleting radial ticks) --------------------------
  //
  // The ring is `DURATION_S` radial ticks around a circle. `lit` follows
  // `secondsLeft`, so each per-second tick of the setInterval turns off one
  // tick clockwise from 12 o'clock. Previously the ring used two rotated
  // full-ring outlines clipped to halves — but a rotationally-symmetric
  // annulus pivoted at its own center has zero visible shape change, so
  // the only motion was a single left-half opacity flip at the 10s mark.
  // Driving the ring off the per-second state gives a visible per-second
  // countdown and a clean regression seam (testID per tick).

  const RING = 200;

  // ---- render ---------------------------------------------------------

  if (loading) return null;

  return (
    <Screen scroll={false}>
      {/* ---- calm gradient (layered translucent views) ---- */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.surface,
          opacity: 0.25,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: '60%',
          height: '40%',
          borderRadius: theme.radii.xl,
          backgroundColor: theme.colors.surface,
          opacity: 0.15,
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing.xxl,
        }}
      >
        {/* ---- countdown ring ---- */}
        <View
          accessibilityLabel={`${secondsLeft} seconds remaining`}
          accessibilityLiveRegion="polite"
        >
          <TicksRing lit={secondsLeft} total={DURATION_S} size={RING} />

          {/* Center content: breathing circle + countdown number */}
          <View
            style={{
              position: 'absolute',
              top: RING / 2 - 40,
              left: RING / 2 - 40,
              width: 80,
              height: 80,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Animated.View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: 0.9,
                transform: [{ scale: breatheScale }],
              }}
              accessibilityLabel="Breathing guide"
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.heading,
                  fontFamily: theme.typography.familyLight,
                }}
              >
                {secondsLeft}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ---- prompt ---- */}
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.title,
              fontFamily: theme.typography.familyRegular,
              textAlign: 'center',
            }}
          >
            look 20 ft away · breathe
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.caption,
              fontFamily: theme.typography.familyRegular,
              textAlign: 'center',
            }}
          >
            Close or go back to skip
          </Text>
        </View>
      </View>
    </Screen>
  );
}
