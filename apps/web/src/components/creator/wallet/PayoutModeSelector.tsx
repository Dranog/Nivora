/**
 * Payout Mode Selector - F7 Wallet
 * Select payout mode (standard/express/crypto) with fee preview
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Zap, Coins, CheckCircle2 } from 'lucide-react';
import type { PayoutMode } from '@/types/wallet';
import { PAYOUT_FEES, PAYOUT_ETA } from '@/types/wallet';
import { calculatePayoutFees, calculateNetAmount, formatCurrency } from '@/lib/api/wallet';

interface PayoutModeSelectorProps {
  amount: number;
  selectedMode: PayoutMode;
  onModeChange: (mode: PayoutMode) => void;
  className?: string;
}

interface ModeOption {
  mode: PayoutMode;
  icon: typeof Clock;
  label: string;
  description: string;
  iconColor: string;
  bgColor: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
}

const modeOptions: ModeOption[] = [
  {
    mode: 'standard',
    icon: Clock,
    label: 'Standard',
    description: 'Bank transfer with lower fees',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    badgeVariant: 'secondary',
  },
  {
    mode: 'express',
    icon: Zap,
    label: 'Express',
    description: 'Fast processing, higher fees',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    badgeVariant: 'default',
  },
  {
    mode: 'crypto',
    icon: Coins,
    label: 'Crypto',
    description: 'Cryptocurrency withdrawal',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    badgeVariant: 'outline',
  },
];

export function PayoutModeSelector({
  amount,
  selectedMode,
  onModeChange,
  className,
}: PayoutModeSelectorProps) {
  const calculations = useMemo(() => {
    return modeOptions.reduce((acc, option) => {
      const fees = calculatePayoutFees(amount, option.mode);
      const net = calculateNetAmount(amount, option.mode);
      const eta = PAYOUT_ETA[option.mode];
      const feeConfig = PAYOUT_FEES[option.mode];

      acc[option.mode] = {
        fees,
        net,
        eta,
        feeConfig,
      };

      return acc;
    }, {} as Record<PayoutMode, { fees: number; net: number; eta: string; feeConfig: typeof PAYOUT_FEES[PayoutMode] }>);
  }, [amount]);

  return (
    <div className={cn('space-y-3', className)}>
      {modeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedMode === option.mode;
        const calc = calculations[option.mode];

        return (
          <Card
            key={option.mode}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => onModeChange(option.mode)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', option.bgColor)}>
                  <Icon className={cn('h-6 w-6', option.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{option.label}</h4>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <Badge variant={option.badgeVariant}>{calc.eta}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{option.description}</p>

                  {/* Fee breakdown */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-medium">
                          {calc.feeConfig.percentage}%
                          {calc.feeConfig.fixed && ` + ${formatCurrency(calc.feeConfig.fixed)}`}
                        </span>
                      </div>
                      {calc.feeConfig.minimum > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Minimum:</span>
                          <span className="font-medium">{formatCurrency(calc.feeConfig.minimum)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-muted-foreground">You receive</div>
                      <div className="font-bold text-lg">{formatCurrency(calc.net)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      {selectedMode && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(calculations[selectedMode].fees)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-xs">Final Amount</div>
                <div className="font-bold text-xl text-primary">
                  {formatCurrency(calculations[selectedMode].net)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
