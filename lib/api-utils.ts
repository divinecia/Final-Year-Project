export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleApiResponse<T>(
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const result = await fn()
    return {
      success: true,
      data: result,
      message: 'Operation completed successfully'
    }
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        message: error.message
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred',
      message: 'Something went wrong. Please try again.'
    }
  }
}

export function createApiResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message: message || 'Success'
  }
}

export function createApiError(
  message: string,
  statusCode?: number
): ApiResponse {
  return {
    success: false,
    error: message,
    message
  }
}

// Retry utility for failed requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError!
}

// Request timeout utility
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}
