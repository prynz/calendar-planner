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
    setNotificationCategoryAsync: jest.fn(() => Promise.resolve(null)),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    getLastNotificationResponse: jest.fn(() => null),
    clearLastNotificationResponse: jest.fn(),
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
});

// Router: screens are tested in isolation; navigation calls are recorded.
const mockRouter = { navigate: jest.fn(), push: jest.fn(), back: jest.fn(), replace: jest.fn(), setParams: jest.fn() };
/** Route params a test wants a screen to see (reset in afterEach below). */
const mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  Stack: { Screen: () => null },
  __router: mockRouter,
  __params: mockParams,
}));
afterEach(() => {
  for (const k of Object.keys(mockParams)) delete mockParams[k];
});

// Calendar files (CAL-09): picker, file system and share sheet are native; tests drive them through these mocks.
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));
jest.mock('expo-file-system', () => {
  const files = new Map<string, string>();
  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }
    create() {
      files.set(this.uri, '');
    }
    async write(text: string) {
      files.set(this.uri, text);
    }
    async text() {
      return files.get(this.uri) ?? '';
    }
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } }, __files: files };
});
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn(async () => undefined) }));
