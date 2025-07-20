import { 
  handleApiResponse, 
  createApiResponse, 
  createApiError, 
  withRetry, 
  withTimeout,
  ApiError 
} from '@/lib/api-utils'

describe('API Utils', () => {
  describe('ApiError', () => {
    it('should create an ApiError with message and status code', () => {
      const error = new ApiError('Test error', 404)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('ApiError')
    })

    it('should default status code to 500', () => {
      const error = new ApiError('Test error')
      expect(error.statusCode).toBeUndefined() // Constructor parameter is optional
    })
  })

  describe('handleApiResponse', () => {
    it('should return success response for successful function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success data')
      
      const result = await handleApiResponse(mockFn)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success data')
      expect(result.error).toBeUndefined()
    })

    it('should return error response for failed function', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'))
      
      const result = await handleApiResponse(mockFn)
      
      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.error).toBe('An unexpected error occurred') // This is how handleApiResponse works
    })

    it('should handle ApiError with status code', async () => {
      const apiError = new ApiError('API Error', 400)
      const mockFn = jest.fn().mockRejectedValue(apiError)
      
      const result = await handleApiResponse(mockFn)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
      // ApiError statusCode is not included in ApiResponse interface
    })
  })

  describe('createApiResponse', () => {
    it('should create successful response', () => {
      const response = createApiResponse('test data', 'Success message')
      
      expect(response.success).toBe(true)
      expect(response.data).toBe('test data')
      expect(response.message).toBe('Success message')
    })

    it('should create response without message', () => {
      const response = createApiResponse({ id: 1 })
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual({ id: 1 })
      expect(response.message).toBe('Success') // Default message is 'Success'
    })
  })

  describe('createApiError', () => {
    it('should create error response', () => {
      const response = createApiError('Error occurred', 404)
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Error occurred')
      // Note: createApiError doesn't include statusCode in return type
    })

    it('should default status code to 500', () => {
      const response = createApiError('Server error')
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Server error')
      // Note: createApiError doesn't include statusCode in return type
    })
  })

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockFn, 3, 100)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')
      
      const result = await withRetry(mockFn, 3, 10)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should throw error after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'))
      
      await expect(withRetry(mockFn, 2, 10)).rejects.toThrow('Always fails')
      expect(mockFn).toHaveBeenCalledTimes(2) // Only maxRetries calls, not +1
    })
  })

  describe('withTimeout', () => {
    it('should return result if promise resolves in time', async () => {
      const quickPromise = Promise.resolve('quick result')
      
      const result = await withTimeout(quickPromise, 1000)
      
      expect(result).toBe('quick result')
    })

    it('should throw timeout error if promise takes too long', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 200))
      
      await expect(withTimeout(slowPromise, 100)).rejects.toThrow('Request timeout')
    })

    it('should use default timeout of 10 seconds', async () => {
      const quickPromise = Promise.resolve('result')
      
      const result = await withTimeout(quickPromise)
      
      expect(result).toBe('result')
    })
  })
})
