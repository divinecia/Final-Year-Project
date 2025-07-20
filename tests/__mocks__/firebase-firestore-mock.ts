const mockDoc = {
  id: 'test-doc-id',
  exists: () => true,
  data: () => ({ id: 'test-doc-id', name: 'Test Document' }),
};

const mockDocSnapshot = {
  exists: jest.fn().mockReturnValue(true),
  data: jest.fn().mockReturnValue({ id: 'test-doc-id', name: 'Test Document' }),
};

export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn();
export const doc = jest.fn().mockReturnValue(mockDoc);
export const getDoc = jest.fn().mockResolvedValue(mockDocSnapshot);
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const getDocs = jest.fn().mockResolvedValue({
  empty: false,
  docs: [mockDocSnapshot],
});
export const updateDoc = jest.fn().mockResolvedValue(undefined);
export const addDoc = jest.fn().mockResolvedValue({ id: 'new-doc-id' });
export const Timestamp = {
  now: jest.fn().mockReturnValue({ seconds: 1234567890, nanoseconds: 0 }),
};
