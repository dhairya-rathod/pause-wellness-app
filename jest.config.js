/** Jest config for Pause. The jest-expo preset already provides the right
 * transformIgnorePatterns (covers react-navigation, @expo-google-fonts, expo)
 * and native-module mocks; we only add a post-env setup for app-specific
 * mocks and keep native build dirs out of the test runner. */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/.expo/'],
};
