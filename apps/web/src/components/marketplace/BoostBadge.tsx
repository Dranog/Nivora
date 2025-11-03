'use client';

import { Badge } from '@/components/ui/badge';

interface BoostBadgeProps {
  expiresAt?: string;
}

export function BoostBadge({ expiresAt }: BoostBadgeProps) {
  if (!expiresAt) return null;

  const daysLeft = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) return null;

  return (
    <Badge variant="default" className="flex items-center gap-1">
      <span>⚡</span>
      <span>Boosted ({daysLeft}d left)</span>
    </Badge>
  );
}
