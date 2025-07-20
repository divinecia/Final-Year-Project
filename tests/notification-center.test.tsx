import { render } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { NotificationCenter } from '../components/notification-center'
import { useAuth } from '../hooks/use-auth'
import { useToast } from '../hooks/use-toast'

// Mock dependencies
jest.mock('@/hooks/use-auth')
jest.mock('@/hooks/use-toast')
jest.mock('@/lib/firebase', () => ({
  db: {},
}))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
  })),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('NotificationCenter', () => {
  const mockToast = jest.fn()
  const mockUser = { uid: 'test-user' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    })
    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
    })
  })

  it('should render notification bell icon', () => {
    render(<NotificationCenter />)
    
    const bellButton = screen.getByRole('button')
    expect(bellButton).toBeInTheDocument()
  })

  it('should show loading state when user is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(<NotificationCenter />)
    
    const bellButton = screen.getByRole('button')
    expect(bellButton).toBeDisabled()
  })

  it('should not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(<NotificationCenter />)
    
    const bellButton = screen.queryByRole('button')
    expect(bellButton).not.toBeInTheDocument()
  })

  it('should open popover when bell is clicked', async () => {
    render(<NotificationCenter />)
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
  })
})
