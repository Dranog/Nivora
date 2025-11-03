"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onConfirm: () => void;
  disabled?: boolean;
}

export function WithdrawDialog({
  open,
  onOpenChange,
  amount,
  onConfirm,
  disabled = false,
}: WithdrawDialogProps) {
  const formatCurrency = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Withdrawal</DialogTitle>
          <DialogDescription>
            Withdraw {formatCurrency(amount)} to your default payout method?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="oliver-btn-primary"
          >
            {disabled ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
