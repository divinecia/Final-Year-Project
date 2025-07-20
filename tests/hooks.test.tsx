import { renderHook, act } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/hooks/use-auth'
import { onAuthStateChanged } from 'firebase/auth'
import '@testing-library/jest-dom'

// Mock Firebase auth
jest.mock('firebase/auth')
jest.mock('@/lib/firebase', () => ({
  app: {},
}))

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const mockUnsubscribe = jest.fn()
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Don't call callback immediately to simulate loading
      return mockUnsubscribe
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should update user state when authenticated', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }
    const mockUnsubscribe = jest.fn()

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate immediate authentication
      if (typeof callback === 'function') {
        callback(mockUser as any)
      }
      return mockUnsubscribe
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    // The auth state should be updated synchronously in our mock
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.loading).toBe(false)
  })

  it('should update user state when not authenticated', async () => {
    const mockUnsubscribe = jest.fn()

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate no user
      if (typeof callback === 'function') {
        callback(null)
      }
      return mockUnsubscribe
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    // The auth state should be updated synchronously in our mock
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { unmount } = renderHook(() => useAuth(), { wrapper })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
