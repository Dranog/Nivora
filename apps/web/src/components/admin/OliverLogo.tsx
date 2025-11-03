'use client';

import * as React from 'react';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'gradient' | 'solid';

type Props = {
  /** You can use either size or explicit width/height */
  size?: Size;                      // 'sm' | 'md' | 'lg'
  width?: number | string;
  height?: number | string;

  /** Visuals */
  variant?: Variant;                // 'gradient' | 'solid'
  color?: string;                   // used when variant='solid'
  label?: string;                   // a11y label
  showText?: boolean;               // show “OLIVER Admin” text
  className?: string;               // extra class
};

function toStr(v: number | string | undefined, fallback: number): string {
  if (v === undefined || v === null) return String(fallback);
  if (typeof v === 'string') return v.trim() === '' ? String(fallback) : v;
  return Number.isFinite(v) ? String(v) : String(fallback);
}

const SIZE_MAP: Record<Size, { w: number; h: number }> = {
  sm: { w: 96,  h: 28 },
  md: { w: 120, h: 36 },
  lg: { w: 144, h: 44 },
};

export default function OliverLogo({
  size = 'md',
  width,
  height,
  variant = 'gradient',
  color = '#00B8A9',
  label = 'Oliver Admin',
  showText = true,
  className,
}: Props) {
  const base = SIZE_MAP[size] ?? SIZE_MAP.md;
  const w = toStr(width, base.w);
  const h = toStr(height, base.h);

  const gradientId = React.useId();

  return (
    <svg
      role="img"
      aria-label={label}
      width={w}
      height={h}
      viewBox="0 0 220 36"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* defs */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00B8A9" />
          <stop offset="100%" stopColor="#00A395" />
        </linearGradient>
      </defs>

      {/* Icon */}
      <g transform="translate(0,2)">
        <rect
          x="0"
          y="0"
          rx="8"
          ry="8"
          width="32"
          height="32"
          fill={variant === 'gradient' ? `url(#${gradientId})` : color}
        />
        <path
          d="M9 22 L16 9 L23 22 Z"
          fill="white"
          opacity="0.95"
        />
      </g>

      {/* Text */}
      {showText && (
        <text
          x="44"
          y="23"
          fontSize="16"
          fontWeight="700"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
          fill={variant === 'gradient' ? '#0f172a' : '#111827'}
        >
          OLIVER <tspan fontWeight="600" opacity="0.7">Admin</tspan>
        </text>
      )}
    </svg>
  );
}
