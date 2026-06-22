import type { LinkingOptions } from '@react-navigation/native';

import { RouteNames, type RootStackParamList } from './routes';

/**
 * Deep-link config. The EyeRest / WaterLog paths are reserved now; slices 04
 * and 06 wire notification responses to `navigation.navigate` with the
 * `feature` param, and the OS opens the app straight into the matching modal.
 *
 * The scheme is declared in app.config.ts (`scheme: 'pause'`); prefixes cover
 * both the custom scheme and a hypothetical https host.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['pause://', 'https://pause.app'],
  config: {
    screens: {
      [RouteNames.Tabs]: '',
      [RouteNames.Onboarding]: 'onboarding',
      [RouteNames.EyeRest]: 'eyerest/:feature?',
      [RouteNames.WaterLog]: 'waterlog/:feature?',
    },
  },
};
