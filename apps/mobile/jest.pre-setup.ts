// Jest has no Worklets UI runtime, but Gesture Handler 3 binds to it as soon as it is imported. Must run
// before Gesture Handler's own jestSetup. Gestures are not exercised in unit tests: every swipe has an
// equal button (polls.md), which the tests use instead.
jest.mock('react-native-gesture-handler/lib/module/handlers/gestures/installUIRuntimeBindings', () => ({
  installUIRuntimeBindings: () => undefined,
}));
