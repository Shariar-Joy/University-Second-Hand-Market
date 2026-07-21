import { ApiError } from '../services/apiClient'

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return fallback
}
