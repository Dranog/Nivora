/**
 * WatermarkOverlay Tests - F5 Anti-Leak
 * Test 1: Overlay visible and changes position after 30 seconds
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WatermarkOverlay } from '@/components/media/WatermarkOverlay';
import { clock } from '@/__tests__/fakes/clock';
import { raf } from '@/__tests__/fakes/raf';
import { clearUsedTokens } from '@/lib/protection/tokens';

describe('WatermarkOverlay - F5', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('1970-01-01T00:00:00Z'));
    clock.now.mockReturnValue(0);
    clearUsedTokens();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    raf.clear();
    clearUsedTokens();
  });

  describe('Test 1: Overlay position changes after interval', () => {
    it('renders watermark with user info and timestamp', () => {
      render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const overlay = screen.getByTestId('watermark-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent('@testuser');
      expect(overlay).toHaveTextContent('#user123');
      // Time at 0ms = 00:00:00 UTC
      expect(overlay).toHaveTextContent('00:00:00');
    });

    it('changes position after 30 seconds', async () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      // Get initial position
      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap') as HTMLElement;
      expect(watermarkElement).toBeInTheDocument();

      const initialTop = watermarkElement.style.top;
      const initialLeft = watermarkElement.style.left;
      const initialTransform = watermarkElement.style.transform;

      // Advance time by 30 seconds and trigger RAF
      await act(async () => {
        clock.now.mockReturnValue(30000);
        vi.advanceTimersByTime(30000);
        raf.tick();
      });

      // Position should have changed
      const updatedTop = watermarkElement.style.top;
      const updatedLeft = watermarkElement.style.left;
      const updatedTransform = watermarkElement.style.transform;

      const positionChanged =
        updatedTop !== initialTop ||
        updatedLeft !== initialLeft ||
        updatedTransform !== initialTransform;

      expect(positionChanged).toBe(true);
    });

    it('updates position at configured interval (15s)', async () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '15',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap') as HTMLElement;
      const initialTop = watermarkElement.style.top;

      // Advance time by 15 seconds and trigger RAF
      await act(async () => {
        clock.now.mockReturnValue(15000);
        vi.advanceTimersByTime(15000);
        raf.tick();
      });

      const updatedTop = watermarkElement.style.top;
      expect(updatedTop).not.toBe(initialTop);
    });

    it('updates timestamp every second', async () => {
      render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const overlay = screen.getByTestId('watermark-overlay');
      expect(overlay).toHaveTextContent('00:00:00');

      // Advance time by 1 second and trigger RAF
      await act(async () => {
        clock.now.mockReturnValue(1000);
        vi.advanceTimersByTime(1000);
        raf.tick();
      });

      // Time should now be 00:00:01
      expect(overlay).toHaveTextContent('00:00:01');
    });

    it('does not render when disabled', () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: false,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap');
      expect(watermarkElement).not.toBeInTheDocument();
    });

    it('applies correct opacity from config', () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 50,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap') as HTMLElement;
      expect(watermarkElement.style.opacity).toBe('0.5');
    });

    it('generates random positions within bounds', async () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap') as HTMLElement;
      const positions: Array<{ top: string; left: string }> = [];

      // Capture initial position
      positions.push({
        top: watermarkElement.style.top,
        left: watermarkElement.style.left,
      });

      // Capture positions over multiple intervals
      for (let i = 1; i <= 4; i++) {
        await act(async () => {
          clock.now.mockReturnValue(i * 30000);
          vi.advanceTimersByTime(30000);
          raf.tick();
        });

        positions.push({
          top: watermarkElement.style.top,
          left: watermarkElement.style.left,
        });
      }

      // Check that positions vary (at least 3 different positions out of 5)
      const uniquePositions = new Set(positions.map(p => `${p.top}-${p.left}`));
      expect(uniquePositions.size).toBeGreaterThanOrEqual(3);
    });

    it('includes rotation in transform', () => {
      const { container } = render(
        <WatermarkOverlay
          userId="user123"
          username="testuser"
          config={{
            enabled: true,
            opacity: 30,
            interval: '30',
          }}
          nowFn={clock.now}
          rafFn={raf.request}
        />
      );

      const watermarkElement = container.querySelector('.absolute.whitespace-nowrap') as HTMLElement;
      const transform = watermarkElement.style.transform;

      // Should include translate and rotate
      expect(transform).toContain('translate(-50%, -50%)');
      expect(transform).toContain('rotate(');
      expect(transform).toContain('deg)');
    });
  });
});
