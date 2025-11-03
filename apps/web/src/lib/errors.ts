/**
 * Error Mapping - F3 Centralized Error Handling
 * Maps API errors to toast-friendly messages
 */

import { type AxiosError } from 'axios';
import { ZodError } from 'zod';

export interface ToastError {
  title: string;
  message: string;
}

/**
 * Map any error to toast format
 */
export function mapErrorToToast(error: unknown): ToastError {
  // Axios HTTP errors
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> };

    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: data?.message || 'The request contains invalid data',
        };

      case 401:
        return {
          title: 'Session Expired',
          message: 'Please log in again to continue',
        };

      case 403:
        return {
          title: 'Access Denied',
          message: data?.message || "You don't have permission to perform this action",
        };

      case 404:
        return {
          title: 'Not Found',
          message: data?.message || 'The requested resource was not found',
        };

      case 422: {
        // Validation errors
        const errorMessages = data?.errors
          ? Object.entries(data.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
              .join('; ')
          : data?.message || 'Validation failed';

        return {
          title: 'Validation Error',
          message: errorMessages,
        };
      }

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Please slow down and try again later',
        };

      case 500:
      case 502:
      case 503:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later',
        };

      default:
        return {
          title: 'Request Failed',
          message: data?.message || error.message || 'An unexpected error occurred',
        };
    }
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const errorMessages = error.issues
      .map((issue) => {
        const path = issue.path.map(String).join('.');
        return `${path}: ${issue.message}`;
      })
      .join('; ');

    return {
      title: 'Validation Error',
      message: errorMessages,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
    };
  }

  // Unknown error
  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred',
  };
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}

/**
 * Handle API error and throw with user-friendly message
 * Stub implementation - will be enhanced
 */
export function handleApiError(error: unknown): never {
  const { title, message } = mapErrorToToast(error);
  throw new Error(`${title}: ${message}`);
}
