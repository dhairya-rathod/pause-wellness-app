import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components';
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

  // Persist + dismiss exactly once when the countdown reaches 0.
  useEffect(() => {
    if (secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      (async () => {
        await completeBreak();
        navigation.goBack();
      })();
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

  // ---- countdown ring (two-half-circles rotation) ----------------------

  const ringAnim = useRef(new Animated.Value(DURATION_S)).current;

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: 0,
      duration: DURATION_S * 1000,
      useNativeDriver: false,
    }).start();
  }, [ringAnim]);

  const progress = ringAnim.interpolate({
    inputRange: [0, DURATION_S],
    outputRange: [0, 1],
  });

  // Right half: spins 0° → 180° over the first half of progress
  const rightHalfRotate = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
  });

  // Left half: spins 0° → 180° over the second half of progress
  const leftHalfRotate = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
  });

  // Left half clip only becomes visible when right half is done
  const leftHalfOpacity = progress.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const RING = 200;
  const BORDER = 12;
  const HALF = RING / 2;

  const progressColor = theme.colors.primary;
  const trackColor = theme.colors.surface;

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
          style={{ width: RING, height: RING }}
        >
          {/* Track (full ring) */}
          <View
            style={{
              position: 'absolute',
              width: RING,
              height: RING,
              borderRadius: HALF,
              borderWidth: BORDER,
              borderColor: trackColor,
            }}
          />

          {/* Right half clip — reveals progress arc 0° → 180° */}
          <View
            style={{
              position: 'absolute',
              left: HALF,
              top: 0,
              width: HALF,
              height: RING,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: -HALF,
                top: 0,
                width: RING,
                height: RING,
                borderRadius: HALF,
                borderWidth: BORDER,
                borderColor: progressColor,
                transform: [{ rotate: rightHalfRotate }],
              }}
            />
          </View>

          {/* Left half clip — reveals progress arc 180° → 360° */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: HALF,
              height: RING,
              overflow: 'hidden',
              opacity: leftHalfOpacity,
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: RING,
                height: RING,
                borderRadius: HALF,
                borderWidth: BORDER,
                borderColor: progressColor,
                transform: [{ rotate: leftHalfRotate }],
              }}
            />
          </Animated.View>

          {/* Center content: breathing circle + countdown number */}
          <View
            style={{
              position: 'absolute',
              top: BORDER,
              left: BORDER,
              width: RING - BORDER * 2,
              height: RING - BORDER * 2,
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
