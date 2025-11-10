import { NotificationInstance } from "antd/es/notification/interface";
import Strings from "./localizations/Strings";

/**
 * Network error types
 */
// eslint-disable-next-line no-unused-vars
export enum NetworkErrorType {
  // eslint-disable-next-line no-unused-vars
  CONNECTION_LOST = 'CONNECTION_LOST',
  // eslint-disable-next-line no-unused-vars
  TIMEOUT = 'TIMEOUT',
  // eslint-disable-next-line no-unused-vars
  SERVER_ERROR = 'SERVER_ERROR',
  // eslint-disable-next-line no-unused-vars
  UNAUTHORIZED = 'UNAUTHORIZED',
  // eslint-disable-next-line no-unused-vars
  NOT_FOUND = 'NOT_FOUND',
  // eslint-disable-next-line no-unused-vars
  UNKNOWN = 'UNKNOWN'
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2 // Exponential backoff
};

/**
 * Check if the error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  // Check for common network error indicators
  if (!error) return false;

  // RTK Query errors
  if (error.status === 'FETCH_ERROR' || error.status === 'PARSING_ERROR') {
    return true;
  }

  // Axios/Fetch errors
  if (error.message === 'Network Error' || error.message === 'Failed to fetch') {
    return true;
  }

  // No response from server
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
    return true;
  }

  return false;
};

/**
 * Determine the type of network error
 */
export const getNetworkErrorType = (error: any): NetworkErrorType => {
  if (isNetworkError(error)) {
    return NetworkErrorType.CONNECTION_LOST;
  }

  const status = error?.status || error?.response?.status;

  if (status === 401 || status === 403) {
    return NetworkErrorType.UNAUTHORIZED;
  }

  if (status === 404) {
    return NetworkErrorType.NOT_FOUND;
  }

  if (status === 408 || error.code === 'ETIMEDOUT') {
    return NetworkErrorType.TIMEOUT;
  }

  if (status >= 500 && status < 600) {
    return NetworkErrorType.SERVER_ERROR;
  }

  return NetworkErrorType.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type
 */
export const getErrorMessage = (errorType: NetworkErrorType): string => {
  switch (errorType) {
    case NetworkErrorType.CONNECTION_LOST:
      return Strings.networkConnectionLost;
    case NetworkErrorType.TIMEOUT:
      return Strings.networkTimeout;
    case NetworkErrorType.SERVER_ERROR:
      return Strings.serverError;
    case NetworkErrorType.UNAUTHORIZED:
      return Strings.unauthorizedError;
    case NetworkErrorType.NOT_FOUND:
      return Strings.notFoundError;
    default:
      return Strings.unknownError;
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const { maxRetries, retryDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  };

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a network error
      if (!isNetworkError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt);

      console.log(`[NetworkErrorHandler] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Show network error notification
 */
export const showNetworkError = (
  notification: NotificationInstance,
  error: any,
  customMessage?: string
) => {
  const errorType = getNetworkErrorType(error);
  const message = customMessage || getErrorMessage(errorType);

  // Extract additional error details if available
  let description = message;
  if (error?.data?.message) {
    description = error.data.message;
  } else if (error?.message && !isNetworkError(error)) {
    description = error.message;
  }

  notification.error({
    message: Strings.error,
    description,
    duration: 5,
  });
};

/**
 * Parse RTK Query error to extract meaningful information
 */
export const parseRTKError = (error: any): string => {
  // Handle RTK Query specific error structure
  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.error) {
    return error.error;
  }

  if (error?.message) {
    return error.message;
  }

  // Handle object errors like [object Object]
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return Strings.unknownError;
    }
  }

  return String(error);
};

export default {
  isNetworkError,
  getNetworkErrorType,
  getErrorMessage,
  retryWithBackoff,
  showNetworkError,
  parseRTKError
};
