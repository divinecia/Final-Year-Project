// Global test setup and mocks

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock Firebase config
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';

// Mock Next.js modules that are problematic in tests
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  })),
}));

// Mock Firebase modules globally
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
};

const mockAuth = {
  currentUser: mockUser,
  signOut: jest.fn().mockResolvedValue(undefined),
};

const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn().mockReturnValue(mockApp),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn().mockReturnValue(mockApp),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue(mockAuth),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: mockUser,
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: mockUser,
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  PhoneAuthProvider: {
    credential: jest.fn().mockReturnValue({}),
  },
  GithubAuthProvider: jest.fn(),
  signInWithPopup: jest.fn().mockResolvedValue({
    user: mockUser,
  }),
}));

const mockDocSnapshot = {
  exists: jest.fn().mockReturnValue(true),
  data: jest.fn().mockReturnValue({ id: 'test-doc-id', name: 'Test Document' }),
};

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn().mockReturnValue({
    id: 'test-doc-id',
    exists: () => true,
    data: () => ({ id: 'test-doc-id', name: 'Test Document' }),
  }),
  getDoc: jest.fn().mockResolvedValue(mockDocSnapshot),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    empty: false,
    docs: [mockDocSnapshot],
  }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  addDoc: jest.fn().mockResolvedValue({ id: 'new-doc-id' }),
  Timestamp: {
    now: jest.fn().mockReturnValue({ seconds: 1234567890, nanoseconds: 0 }),
  },
}));

// Global console override for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
