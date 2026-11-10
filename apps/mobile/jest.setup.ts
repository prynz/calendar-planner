import { setUpTests } from 'react-native-reanimated';

setUpTests();

// eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories must use require
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Haptics have no engine in Jest; keep the promise contract.
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

// Local notifications: in-memory fake of the parts we use.
jest.mock('expo-notifications', () => {
  const scheduled: { identifier: string; content: { data: unknown } }[] = [];
  return {
    __scheduled: scheduled,
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, canAskAgain: true })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, canAskAgain: true })),
    getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([...scheduled])),
    cancelScheduledNotificationAsync: jest.fn((id: string) => {
      const i = scheduled.findIndex((n) => n.identifier === id);
      if (i >= 0) scheduled.splice(i, 1);
      return Promise.resolve();
    }),
    scheduleNotificationAsync: jest.fn((req: { identifier: string; content: { data: unknown } }) => {
      scheduled.push({ identifier: req.identifier, content: req.content });
      return Promise.resolve(req.identifier);
    }),
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
});

// Router: screens are tested in isolation; navigation calls are recorded.
const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  Stack: { Screen: () => null },
  __router: mockRouter,
}));
