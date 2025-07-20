import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('@/hooks/use-auth')
jest.mock('@/hooks/use-toast')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

// Simple integration test component
function TestApp() {
  const { user, loading } = useAuth()
  const { toast } = useToast()

  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }

  if (!user) {
    return <div data-testid="not-authenticated">Please log in</div>
  }

  return (
    <div data-testid="authenticated">
      <h1>Welcome, {user.email}!</h1>
      <button onClick={() => toast({ title: 'Hello!' })}>
        Test Toast
      </button>
    </div>
  )
}

describe('Integration Tests', () => {
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    })
  })

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(<TestApp />)
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show login prompt when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(<TestApp />)
    
    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument()
    expect(screen.getByText('Please log in')).toBeInTheDocument()
  })

  it('should show welcome message when authenticated', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
    })

    render(<TestApp />)
    
    expect(screen.getByTestId('authenticated')).toBeInTheDocument()
    expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
  })

  it('should handle toast interactions', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
    })

    render(<TestApp />)
    
    const toastButton = screen.getByText('Test Toast')
    toastButton.click()

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({ title: 'Hello!' })
    })
  })
})
