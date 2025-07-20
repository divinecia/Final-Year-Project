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

export const getAuth = jest.fn(() => mockAuth);

export const createUserWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: mockUser,
});

export const signInWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: mockUser,
});

export const signOut = jest.fn().mockResolvedValue(undefined);

export const PhoneAuthProvider = {
  credential: jest.fn().mockReturnValue({}),
};

export const GithubAuthProvider = jest.fn();

export const signInWithPopup = jest.fn().mockResolvedValue({
  user: mockUser,
});
