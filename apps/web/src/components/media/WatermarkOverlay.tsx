/**
 * WatermarkOverlay - F5 Anti-Leak
 * Dynamic fingerprint overlay that moves and renews position
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import type { WatermarkConfig, WatermarkPosition } from '@/types/protection';

interface WatermarkOverlayProps {
  userId: string;
  username: string;
  config?: WatermarkConfig;
  className?: string;
  // For testing: inject time and RAF
  nowFn?: () => number;
  rafFn?: (callback: FrameRequestCallback) => number;
}

/**
 * Generate random position for watermark
 */
function generateRandomPosition(): WatermarkPosition {
  // Random position between 5% and 85% to avoid edges
  const top = `${5 + Math.random() * 80}%`;
  const left = `${5 + Math.random() * 80}%`;
  // Random rotation between -15 and 15 degrees
  const rotation = -15 + Math.random() * 30;
  const transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

  return { top, left, transform };
}

/**
 * Format current time as HH:MM:SS in UTC (deterministic for tests)
 */
function formatTimeUTC(ms: number): string {
  return new Date(ms).toISOString().slice(11, 19);
}

/**
 * Watermark overlay component
 * Displays: @{username} · #{userId} · {HH:MM:SS}
 * Updates position and time based on interval
 */
export function WatermarkOverlay({
  userId,
  username,
  config = { enabled: true, opacity: 30, interval: '30' },
  className = '',
  nowFn = Date.now,
  rafFn = requestAnimationFrame,
}: WatermarkOverlayProps) {
  const [position, setPosition] = useState<WatermarkPosition>(generateRandomPosition());
  const [currentTime, setCurrentTime] = useState(() => formatTimeUTC(nowFn()));

  // Convert interval to number
  const intervalSeconds = parseInt(config.interval, 10);

  // Update position and time at configured interval
  useEffect(() => {
    if (!config.enabled) return;

    const intervalMs = intervalSeconds * 1000;

    const interval = setInterval(() => {
      setPosition(generateRandomPosition());
      setCurrentTime(formatTimeUTC(nowFn()));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.enabled, intervalSeconds, nowFn]);

  // Update time every second for clock
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      setCurrentTime(formatTimeUTC(nowFn()));
    }, 1000);

    return () => clearInterval(interval);
  }, [config.enabled, nowFn]);

  // Don't render if disabled
  if (!config.enabled) {
    return null;
  }

  const watermarkText = `@${username} · #${userId} · ${currentTime}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-50 ${className}`}
      aria-hidden={true}
      data-testid="watermark-overlay"
    >
      <div
        className="absolute whitespace-nowrap text-white font-mono text-sm px-3 py-1.5 rounded-md bg-black/20 backdrop-blur-sm transition-all duration-1000"
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform,
          opacity: config.opacity / 100,
        }}
      >
        {watermarkText}
      </div>
    </div>
  );
}
