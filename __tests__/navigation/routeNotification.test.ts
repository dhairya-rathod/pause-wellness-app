/// <reference types="jest" />
import { routeNotificationResponse } from '../../src/navigation/routeNotification';
import { RouteNames } from '../../src/navigation/routes';

function makeResponse(data?: Record<string, unknown>) {
  return {
    notification: {
      request: { content: { data } },
    },
  } as const;
}

describe('routeNotificationResponse', () => {
  it('routes to WaterLog when feature is water', () => {
    const navigate = jest.fn();
    const response = makeResponse({ feature: 'water' });

    routeNotificationResponse(
      // Cast through unknown so the minimal object is assignable to the
      // helper's type without an expo-notifications import.
      response as Parameters<typeof routeNotificationResponse>[0],
      navigate,
    );

    expect(navigate).toHaveBeenCalledWith(RouteNames.WaterLog, {
      feature: 'water',
    });
  });

  it('routes to EyeRest when feature is eye', () => {
    const navigate = jest.fn();
    const response = makeResponse({ feature: 'eye' });

    routeNotificationResponse(
      response as Parameters<typeof routeNotificationResponse>[0],
      navigate,
    );

    expect(navigate).toHaveBeenCalledWith(RouteNames.EyeRest, {
      feature: 'eye',
    });
  });

  it('does not navigate when feature is unknown', () => {
    const navigate = jest.fn();
    const response = makeResponse({ feature: 'posture' });

    routeNotificationResponse(
      response as Parameters<typeof routeNotificationResponse>[0],
      navigate,
    );

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when data is missing', () => {
    const navigate = jest.fn();
    const response = makeResponse();

    routeNotificationResponse(
      response as Parameters<typeof routeNotificationResponse>[0],
      navigate,
    );

    expect(navigate).not.toHaveBeenCalled();
  });
});
