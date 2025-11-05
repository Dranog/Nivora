/**
 * HTTP Client - Production-Ready API Client
 * - JWT token management with automatic refresh
 * - Global error handling with toast notifications
 * - Type-safe requests
 */

import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import type { AuthResponse } from '@/lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Token management helpers
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    console.log('[getAccessToken] ⚠️ Window is undefined (SSR context)');
    return null;
  }

  const token = localStorage.getItem('accessToken');
  console.log('[getAccessToken] Reading token from localStorage:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    allKeys: Object.keys(localStorage),
  });

  return token;
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Create axios instance
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Request interceptor: Add JWT token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // Debug logging
    console.log('[HTTP Interceptor] Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      willAddAuth: !!(token && config.headers),
    });

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[HTTP Interceptor] ✅ Authorization header added');
    } else {
      console.warn('[HTTP Interceptor] ⚠️ No token available or headers missing!', {
        hasToken: !!token,
        hasHeaders: !!config.headers,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and token refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 Unauthorized: Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(httpClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token available, logout
        clearTokens();
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data;
        setTokens(accessToken, newRefreshToken);

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Notify all pending requests
        onTokenRefreshed(accessToken);
        isRefreshing = false;

        // Retry original request
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        isRefreshing = false;
        clearTokens();

        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          toast.error('Session expirée', {
            description: 'Veuillez vous reconnecter',
          });
          window.location.href = '/admin/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Accès refusé', {
        description: 'Vous n\'avez pas les permissions nécessaires',
      });
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Ressource introuvable', {
        description: 'La ressource demandée n\'existe pas',
      });
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      toast.error('Erreur serveur', {
        description: 'Une erreur est survenue côté serveur. Veuillez réessayer.',
      });
    }

    // 422 Validation Error
    if (error.response?.status === 422) {
      const data = error.response.data as any;
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || 'Données invalides';

      toast.error('Validation échouée', {
        description: message,
      });
    }

    // Network Error
    if (!error.response) {
      toast.error('Erreur réseau', {
        description: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Type-safe HTTP request wrapper
 */
export async function httpRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  const response = await httpClient.request<T>(config);
  return response.data;
}

/**
 * HTTP methods shortcuts
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    httpRequest<T>({ ...config, method: 'DELETE', url }),
};

/**
 * Auth helpers - Token management
 */
export const authHelpers = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};
