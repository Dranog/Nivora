/**
 * StageSelect Component
 * Select fan stage with confirmation
 */

'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { FanStage } from '@/types/crm';
import { FAN_STAGES } from '@/types/crm';

interface StageSelectProps {
  currentStage: FanStage;
  onStageChange: (stage: FanStage) => void;
  disabled?: boolean;
}

export function StageSelect({ currentStage, onStageChange, disabled = false }: StageSelectProps) {
  const [pendingStage, setPendingStage] = useState<FanStage | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStageSelect = (value: string) => {
    const newStage = value as FanStage;
    setPendingStage(newStage);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingStage) {
      onStageChange(pendingStage);
    }
    setShowConfirm(false);
    setPendingStage(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingStage(null);
  };

  const currentStageLabel = FAN_STAGES.find((s) => s.value === currentStage)?.label || currentStage;
  const pendingStageLabel = FAN_STAGES.find((s) => s.value === pendingStage)?.label || pendingStage;

  return (
    <>
      <Select value={currentStage} onValueChange={handleStageSelect} disabled={disabled}>
        <SelectTrigger className="w-[180px]" data-testid="stage-select">
          <SelectValue placeholder="Select stage" />
        </SelectTrigger>
        <SelectContent>
          {FAN_STAGES.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${stage.color}`} />
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Fan Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this fan from <strong>{currentStageLabel}</strong> to{' '}
              <strong>{pendingStageLabel}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} data-testid="confirm-stage-change">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
