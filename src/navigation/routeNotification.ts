import { RouteNames, type RootStackParamList } from './routes';

/**
 * Minimal shape of a notification response relevant to routing.
 *
 * Does NOT import `expo-notifications` — the function is pure and testable
 * without the OS module. At the call-site a real `NotificationResponse` is
 * compatible with this shape.
 */
export type NotificationResponseShape = {
  notification: {
    request: {
      content: {
        data?: Record<string, unknown>;
      };
    };
  };
};

/**
 * Route a notification tap to the matching modal.
 *
 * Extracted from the `addNotificationResponseReceivedListener` callback so it
 * can be unit-tested with a stub `navigate` (no OS, no real notifications).
 *
 * If `data.feature` is `'water'` it navigates to the WaterLog modal;
 * `'eye'` to EyeRest; any other value is silently ignored.
 */
export function routeNotificationResponse(
  response: NotificationResponseShape,
  navigate: (route: keyof RootStackParamList, params?: Record<string, unknown>) => void,
): void {
  const feature = response.notification.request.content.data?.feature;
  if (feature === 'water') {
    navigate(RouteNames.WaterLog, { feature: 'water' });
  } else if (feature === 'eye') {
    navigate(RouteNames.EyeRest, { feature: 'eye' });
  }
  // Unknown or missing feature → no-op (don't navigate).
}
