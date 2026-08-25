// Jest setup. Add global mocks here as native modules are introduced (ads, haptics, storage).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
