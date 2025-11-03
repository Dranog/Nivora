/**
 * KYC Status Banner - F7 Wallet
 * Shows KYC verification status with action button
 */

'use client';

import { useKycStatus } from '@/hooks/usePayouts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { KycStatus as KycStatusType } from '@/types/wallet';

interface KycStatusProps {
  className?: string;
}

export function KycStatus({ className }: KycStatusProps) {
  const { status, message, isLoading, startVerification, isStarting } = useKycStatus();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = (status: KycStatusType) => {
    switch (status) {
      case 'not_started':
        return {
          icon: AlertCircle,
          variant: 'warning' as const,
          title: 'Verification Required',
          description: 'Complete KYC verification to enable payouts',
          action: 'Start Verification',
          showAction: true,
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          title: 'Verification Pending',
          description: 'Your verification is being reviewed. This usually takes 1-2 business days.',
          action: null,
          showAction: false,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
      case 'verified':
        return {
          icon: CheckCircle,
          variant: 'success' as const,
          title: 'Verified',
          description: 'Your account is verified. You can request payouts anytime.',
          action: null,
          showAction: false,
          iconColor: 'text-success',
          bgColor: 'bg-success/10',
        };
      case 'rejected':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          title: 'Verification Failed',
          description: message || 'Your verification was rejected. Please contact support for details.',
          action: 'Retry Verification',
          showAction: true,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{config.title}</h4>
              <Badge variant={config.variant}>{status.replace('_', ' ').toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {config.showAction && (
            <Button
              size="sm"
              onClick={() => startVerification()}
              disabled={isStarting}
            >
              {config.action}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
