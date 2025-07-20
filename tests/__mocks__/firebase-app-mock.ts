const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

export const initializeApp = jest.fn().mockReturnValue(mockApp);
export const getApps = jest.fn().mockReturnValue([]);
export const getApp = jest.fn().mockReturnValue(mockApp);
