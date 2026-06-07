module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)',
  ],
};