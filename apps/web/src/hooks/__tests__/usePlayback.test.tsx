/**
 * usePlayback Hook Tests - F5 Anti-Leak
 * Test 2: Token expired => 401 mock => UI blocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlayback } from '@/hooks/usePlayback';
import * as playbackApi from '@/lib/api/playback';
import { clearUsedTokens } from '@/lib/protection/tokens';
import { clock } from '@/__tests__/fakes/clock';
import { interval } from '@/__tests__/fakes/interval';
import type { PlaybackToken } from '@/types/protection';

// Mock the playback API
vi.mock('@/lib/api/playback', () => ({
  playbackApi: {
    fetchToken: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('usePlayback - F5', () => {
  beforeEach(() => {
    clock.now.mockReturnValue(0);
    interval.clearAll();
    mockToast.mockClear();
    clearUsedTokens();
    vi.clearAllMocks();
  });

  afterEach(() => {
    interval.clearAll();
    clearUsedTokens();
  });

  describe('Test 2: Token expiry handling and UI blocking', () => {
    it('fetches token on mount', async () => {
      const mockToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=test-jti',
        expiresAt: 900000, // 15 minutes from clock=0
        jti: 'test-jti',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(mockToken);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.token).toBe(null);

      // Wait for token to be fetched
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.token).toEqual(mockToken);
      expect(result.current.error).toBe(null);
      expect(result.current.isExpired).toBe(false);
    });

    it('shows error toast and blocks UI when token fetch fails (401)', async () => {
      const error = new Error('Unauthorized');
      vi.mocked(playbackApi.playbackApi.fetchToken).mockRejectedValue(error);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Token should be null (blocked)
      expect(result.current.token).toBe(null);
      expect(result.current.error).toEqual(error);

      // Toast should be shown
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Playback Error',
        description: error.message,
        variant: 'destructive',
      });
    });

    it('detects expired token and sets isExpired flag', async () => {
      clock.now.mockReturnValue(0);

      const expiredToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=expired-jti',
        expiresAt: -1000, // Already expired
        jti: 'expired-jti',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(expiredToken);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Advance time to trigger expiry check (runs every 5 seconds)
      act(() => {
        clock.now.mockReturnValue(5000);
        interval.tick(5000);
      });

      await waitFor(() => {
        expect(result.current.isExpired).toBe(true);
      });

      // Toast should be shown
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
          variant: 'destructive',
        })
      );
    });

    it('auto-refreshes token 60 seconds before expiry (TTL=90s)', async () => {
      vi.useFakeTimers();
      clock.now.mockReturnValue(0);

      // Token expires at 90000ms (90s), refresh should happen at 30000ms (30s = 60s before expiry)
      const initialToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=initial',
        expiresAt: 90000, // Expires at 90s
        jti: 'initial',
      };

      const refreshedToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=refreshed',
        expiresAt: 180000, // Expires at 180s
        jti: 'refreshed',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(initialToken);
      vi.mocked(playbackApi.playbackApi.refreshToken).mockResolvedValue(refreshedToken);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await vi.waitFor(() => {
        expect(result.current.token?.jti).toBe('initial');
      });

      // Advance to 30000ms (60s before 90s expiry, should trigger refresh)
      act(() => {
        clock.now.mockReturnValue(30000);
        vi.advanceTimersByTime(30000);
      });

      await vi.waitFor(() => {
        expect(playbackApi.playbackApi.refreshToken).toHaveBeenCalledWith('test-media', 15);
      });

      await vi.waitFor(() => {
        expect(result.current.token?.jti).toBe('refreshed');
      });

      vi.useRealTimers();
    });

    it('blocks playback when token expires (UI blocking)', async () => {
      clock.now.mockReturnValue(0);

      const shortLivedToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=short-lived',
        expiresAt: 90000, // Expires at 90s
        jti: 'short-lived',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(shortLivedToken);
      vi.mocked(playbackApi.playbackApi.refreshToken).mockRejectedValue(
        new Error('Refresh failed')
      );

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await waitFor(() => {
        expect(result.current.token).toEqual(shortLivedToken);
      });

      expect(result.current.isExpired).toBe(false);

      // Advance to 95s (past 90s expiry, next 5s interval check will detect it)
      act(() => {
        clock.now.mockReturnValue(95000);
        interval.tick(95000);
      });

      await waitFor(() => {
        expect(result.current.isExpired).toBe(true);
      });

      // UI should be blocked
      expect(result.current.isExpired).toBe(true);

      // Toast should be shown
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
          variant: 'destructive',
        })
      );
    });

    it('allows manual refresh via refresh function', async () => {
      clock.now.mockReturnValue(0);

      const initialToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=initial',
        expiresAt: 900000,
        jti: 'initial',
      };

      const refreshedToken: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=manual-refresh',
        expiresAt: 900000,
        jti: 'manual-refresh',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(initialToken);
      vi.mocked(playbackApi.playbackApi.refreshToken).mockResolvedValue(refreshedToken);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: true,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await waitFor(() => {
        expect(result.current.token).toEqual(initialToken);
      });

      // Manually refresh
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.token).toEqual(refreshedToken);
      });

      expect(result.current.isExpired).toBe(false);
    });

    it('does not auto-refresh when autoRefresh is false', async () => {
      clock.now.mockReturnValue(0);

      const token: PlaybackToken = {
        url: '/api/media/test-media/stream?jti=no-refresh',
        expiresAt: 90000,
        jti: 'no-refresh',
      };

      vi.mocked(playbackApi.playbackApi.fetchToken).mockResolvedValue(token);

      const { result } = renderHook(() =>
        usePlayback({
          mediaId: 'test-media',
          ttlMinutes: 15,
          autoRefresh: false,
          nowFn: clock.now,
          setIntervalFn: interval.set as any,
          clearIntervalFn: interval.clear as any,
        })
      );

      await waitFor(() => {
        expect(result.current.token).toEqual(token);
      });

      // Advance time past refresh threshold
      act(() => {
        clock.now.mockReturnValue(35000);
      });

      // Wait a bit to ensure no refresh happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have called refreshToken
      expect(playbackApi.playbackApi.refreshToken).not.toHaveBeenCalled();
    });
  });
});
