/**
 * usePlayback Hook - F5 Anti-Leak
 * Manages playback tokens with auto-refresh before expiry
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlaybackToken } from '@/types/protection';
import { playbackApi } from '@/lib/api/playback';
import { isTokenExpired, getTimeUntilExpiry } from '@/lib/protection/tokens';
import { useToast } from '@/hooks/use-toast';

/**
 * Refresh threshold: refresh token 60 seconds before expiry
 */
const REFRESH_THRESHOLD_SECONDS = 60;

interface UsePlaybackOptions {
  mediaId: string;
  ttlMinutes?: number;
  autoRefresh?: boolean;
  // For testing: inject time functions
  nowFn?: () => number;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  setIntervalFn?: typeof setInterval;
  clearIntervalFn?: typeof clearInterval;
}

interface UsePlaybackReturn {
  token: PlaybackToken | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isExpired: boolean;
}

/**
 * Hook to manage playback token lifecycle
 * - Fetches initial token
 * - Auto-refreshes 60s before expiry
 * - Shows toast on error or expiry
 * - Returns token, loading state, and refresh function
 */
export function usePlayback({
  mediaId,
  ttlMinutes,
  autoRefresh = true,
  nowFn = Date.now,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
}: UsePlaybackOptions): UsePlaybackReturn {
  const [token, setToken] = useState<PlaybackToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const { toast } = useToast();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch new token
   */
  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsExpired(false);

      const newToken = await playbackApi.fetchToken(mediaId, ttlMinutes);
      setToken(newToken);

      return newToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch token');
      setError(error);

      toast({
        title: 'Playback Error',
        description: error.message,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }, [mediaId, ttlMinutes, toast]);

  /**
   * Refresh token (callable from outside)
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const newToken = await playbackApi.refreshToken(mediaId, ttlMinutes);
      setToken(newToken);
      setIsExpired(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh token');
      setError(error);

      toast({
        title: 'Token Refresh Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [mediaId, ttlMinutes, toast]);

  /**
   * Schedule refresh before token expires
   */
  const scheduleRefresh = useCallback(
    (currentToken: PlaybackToken) => {
      if (!autoRefresh) return;

      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeoutFn(refreshTimerRef.current);
      }

      const timeUntilExpiry = getTimeUntilExpiry(currentToken.expiresAt, nowFn);

      // If already expired, don't schedule
      if (timeUntilExpiry <= 0) {
        setIsExpired(true);
        toast({
          title: 'Token Expired',
          description: 'Your playback session has expired. Please reload.',
          variant: 'destructive',
        });
        return;
      }

      // Calculate when to refresh (60s before expiry)
      const refreshIn = Math.max(0, timeUntilExpiry - REFRESH_THRESHOLD_SECONDS);
      const refreshMs = refreshIn * 1000;

      refreshTimerRef.current = setTimeoutFn(() => {
        refresh();
      }, refreshMs) as unknown as NodeJS.Timeout;
    },
    [autoRefresh, refresh, toast, nowFn, setTimeoutFn, clearTimeoutFn]
  );

  /**
   * Initial token fetch
   */
  useEffect(() => {
    fetchToken()
      .then((newToken) => {
        if (newToken) {
          scheduleRefresh(newToken);
        }
      })
      .catch(() => {
        // Error already handled in fetchToken
      });

    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeoutFn(refreshTimerRef.current);
      }
    };
  }, [fetchToken, scheduleRefresh, clearTimeoutFn]);

  /**
   * Schedule refresh when token changes
   */
  useEffect(() => {
    if (token && autoRefresh) {
      scheduleRefresh(token);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeoutFn(refreshTimerRef.current);
      }
    };
  }, [token, autoRefresh, scheduleRefresh, clearTimeoutFn]);

  /**
   * Check expiry periodically
   */
  useEffect(() => {
    if (!token) return;

    const checkExpiry = setIntervalFn(() => {
      if (isTokenExpired(token.expiresAt, nowFn)) {
        setIsExpired(true);
        clearIntervalFn(checkExpiry);

        toast({
          title: 'Session Expired',
          description: 'Your playback session has expired.',
          variant: 'destructive',
        });
      }
    }, 5000) as unknown as NodeJS.Timeout; // Check every 5 seconds

    return () => clearIntervalFn(checkExpiry);
  }, [token, toast, nowFn, setIntervalFn, clearIntervalFn]);

  return {
    token,
    loading,
    error,
    refresh,
    isExpired,
  };
}
