import { useEffect, useState } from 'react';
import { Pressable, Switch, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';

import { Screen, Text } from '../components';
import { useSettings } from '../state/SettingsProvider';
import { useTheme } from '../theme';

/**
 * Real Settings screen (slice 04).
 *
 * Each control persists immediately on change — no separate save button.
 * Persisting triggers the SchedulingProvider's settings-effect which
 * reschedules water reminders with the new values.
 *
 * TalkBack labels are set on every interactive control.
 */
export function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, loading, updateSettings } = useSettings();

  // Local state for in-progress text edits so we don't lose partial input.
  const [goalText, setGoalText] = useState(String(settings.waterGoalGlasses));
  const [startText, setStartText] = useState(settings.activeHoursStart);
  const [endText, setEndText] = useState(settings.activeHoursEnd);

  // Sync local state when the async settings load completes.
  useEffect(() => {
    if (!loading) {
      setGoalText(String(settings.waterGoalGlasses));
      setStartText(settings.activeHoursStart);
      setEndText(settings.activeHoursEnd);
    }
  }, [loading, settings]);

  if (loading) return null;

  // ---- shared row styles --------------------------------------------------

  const row: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  };

  const label: TextStyle = {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontFamily: theme.typography.familyRegular,
    flexShrink: 1,
  };

  const muted: TextStyle = {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontFamily: theme.typography.familyRegular,
    flexShrink: 0,
  };

  const input: TextStyle = {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontFamily: theme.typography.familyRegular,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minWidth: 72,
    textAlign: 'center',
  };

  // ---- commit helpers -----------------------------------------------------

  const commitGoal = () => {
    const n = parseInt(goalText, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 20) {
      updateSettings({ waterGoalGlasses: n });
    } else {
      // Revert to the current persisted value on invalid input.
      setGoalText(String(settings.waterGoalGlasses));
    }
  };

  const validateAndCommitTime = (
    text: string,
    field: 'activeHoursStart' | 'activeHoursEnd',
    setter: (v: string) => void,
  ) => {
    const match = text.match(/^\d{2}:\d{2}$/);
    if (!match) {
      setter(settings[field]); // revert
      return;
    }
    const [h, m] = text.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      setter(settings[field]); // revert
      return;
    }
    updateSettings({ [field]: text });
  };

  const startValid = startText.match(/^\d{2}:\d{2}$/);
  const endValid = endText.match(/^\d{2}:\d{2}$/);

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.xs }}>

        {/* ---- Notification toggles ---- */}

        <Pressable
          onPress={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          accessible={false}
          style={row}
        >
          <Text style={label}>Reminder sounds</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
            trackColor={{ true: theme.colors.primary }}
            accessibilityLabel="Reminder sounds"
            accessibilityHint="Plays a soft chime with each reminder"
          />
        </Pressable>

        <Pressable
          onPress={() => updateSettings({ waterEnabled: !settings.waterEnabled })}
          accessible={false}
          style={row}
        >
          <Text style={label}>Water reminders</Text>
          <Switch
            value={settings.waterEnabled}
            onValueChange={(v) => updateSettings({ waterEnabled: v })}
            trackColor={{ true: theme.colors.primary }}
            accessibilityLabel="Water reminders"
            accessibilityHint="Sends gentle hydration nudges during active hours"
          />
        </Pressable>

        <Pressable
          onPress={() => updateSettings({ eyeEnabled: !settings.eyeEnabled })}
          accessible={false}
          style={row}
        >
          <View style={{ flexShrink: 1 }}>
            <Text style={label}>Eye reminders</Text>
            <Text style={muted}>
              Gentle 20-20-20 nudges during active hours
            </Text>
          </View>
          <Switch
            value={settings.eyeEnabled}
            onValueChange={(v) => updateSettings({ eyeEnabled: v })}
            trackColor={{ true: theme.colors.primary }}
            accessibilityLabel="Eye reminders"
            accessibilityHint="Sends gentle 20-20-20 eye-rest nudges during active hours"
          />
        </Pressable>

        {/* ---- Daily water goal ---- */}

        <View style={row}>
          <Text style={label}>Daily water goal (glasses)</Text>
          <TextInput
            value={goalText}
            onChangeText={setGoalText}
            onBlur={commitGoal}
            onSubmitEditing={commitGoal}
            keyboardType="number-pad"
            maxLength={2}
            style={input}
            accessibilityLabel="Daily water goal in glasses"
            accessibilityHint="Enter a number from 1 to 20"
            allowFontScaling
            maxFontSizeMultiplier={1.5}
          />
        </View>

        {/* ---- Active hours ---- */}

        <View style={row}>
          <Text style={label}>Active hours start</Text>
          <TextInput
            value={startText}
            onChangeText={setStartText}
            onBlur={() =>
              validateAndCommitTime(
                startText,
                'activeHoursStart',
                setStartText,
              )
            }
            onSubmitEditing={() =>
              validateAndCommitTime(
                startText,
                'activeHoursStart',
                setStartText,
              )
            }
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={input}
            accessibilityLabel="Active hours start"
            accessibilityHint="24-hour time in HH:MM format"
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textMuted}
            allowFontScaling
            maxFontSizeMultiplier={1.5}
          />
        </View>

        <View style={row}>
          <Text style={label}>Active hours end</Text>
          <TextInput
            value={endText}
            onChangeText={setEndText}
            onBlur={() =>
              validateAndCommitTime(endText, 'activeHoursEnd', setEndText)
            }
            onSubmitEditing={() =>
              validateAndCommitTime(endText, 'activeHoursEnd', setEndText)
            }
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={input}
            accessibilityLabel="Active hours end"
            accessibilityHint="24-hour time in HH:MM format"
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textMuted}
            allowFontScaling
            maxFontSizeMultiplier={1.5}
          />
        </View>

        {/* ---- Validation hint ---- */}

        {(!startValid || !endValid) && (
          <Text
            style={[
              muted,
              { textAlign: 'center', paddingVertical: theme.spacing.md },
            ]}
          >
            Enter times as HH:MM (e.g. 08:00)
          </Text>
        )}
      </View>
    </Screen>
  );
}
