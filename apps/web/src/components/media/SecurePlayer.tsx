/**
 * SecurePlayer - F5 Anti-Leak
 * HLS video player with watermark overlay, anti-right-click, anti-drag
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import type { WatermarkConfig } from '@/types/protection';
import { WatermarkOverlay } from './WatermarkOverlay';
import { usePlayback } from '@/hooks/usePlayback';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurePlayerProps {
  mediaId: string;
  userId: string;
  username: string;
  locked?: boolean;
  watermarkConfig?: WatermarkConfig;
  poster?: string;
  className?: string;
  ttlMinutes?: number;
  autoPlay?: boolean;
  controls?: boolean;
}

/**
 * Secure video player component
 * Features:
 * - HLS playback (mock with HTML5 video)
 * - Watermark overlay (if unlocked)
 * - Blur teaser if locked
 * - Anti-right-click
 * - Anti-drag
 * - Auto-refresh token before expiry
 */
export function SecurePlayer({
  mediaId,
  userId,
  username,
  locked = false,
  watermarkConfig,
  poster,
  className = '',
  ttlMinutes,
  autoPlay = false,
  controls = true,
}: SecurePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch and manage playback token
  const { token, loading, error, isExpired, refresh } = usePlayback({
    mediaId,
    ttlMinutes,
    autoRefresh: true,
  });

  /**
   * Prevent context menu (right-click)
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  /**
   * Prevent drag
   */
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  /**
   * Handle play/pause events
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  /**
   * Pause video if token expires
   */
  useEffect(() => {
    if (isExpired && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isExpired]);

  // Loading state
  if (loading && !token) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 bg-muted text-muted-foreground p-8',
          className
        )}
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm font-medium">Failed to load video</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 bg-muted text-muted-foreground p-8',
          className
        )}
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm font-medium">Playback session expired</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden bg-black', className)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full select-none',
          locked && 'filter blur-[20px]'
        )}
        poster={poster}
        controls={controls && !locked}
        autoPlay={autoPlay && !locked}
        playsInline
        draggable={false}
        controlsList="nodownload"
        disablePictureInPicture
        style={{
          pointerEvents: locked ? 'none' : 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        {token && !locked && (
          <source src={token.url} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>

      {/* Watermark overlay (only if unlocked and playing) */}
      {!locked && token && (
        <WatermarkOverlay
          userId={userId}
          username={username}
          config={watermarkConfig}
        />
      )}

      {/* Locked indicator */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-white mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-white text-lg font-semibold">Locked Video</p>
            <p className="text-white/70 text-sm mt-2">Unlock to watch</p>
          </div>
        </div>
      )}

      {/* Prevent selection overlay */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        aria-hidden={true}
      />
    </div>
  );
}
