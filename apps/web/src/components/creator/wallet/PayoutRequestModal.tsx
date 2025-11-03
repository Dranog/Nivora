/**
 * PayoutRequestModal Component
 * Single form with multi-step flow for creating payout requests
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayouts, useKycStatus } from '@/hooks/usePayouts';
import type { PayoutMode, CryptoNetwork } from '@/types/wallet';
import { AlertTriangle } from 'lucide-react';

interface PayoutRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

export function PayoutRequestModal({
  open,
  onOpenChange,
  availableBalance,
}: PayoutRequestModalProps) {
  const { createPayout, isCreating } = usePayouts();
  const { status: kycStatus } = useKycStatus();

  // Step management (1=mode, 2=destination, 3=amount, 4=summary)
  const [step, setStep] = useState(1);

  // Form state
  const [mode, setMode] = useState<PayoutMode>('standard');
  const [iban, setIban] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<CryptoNetwork>('ETH');
  const [amount, setAmount] = useState('');

  // Validation errors
  const [ibanError, setIbanError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setMode('standard');
      setIban('');
      setAddress('');
      setNetwork('ETH');
      setAmount('');
      setIbanError('');
      setAmountError('');
    }
  }, [open]);

  // Calculate fees and net amount
  const fees = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return 0;

    if (mode === 'standard') {
      return Math.max(amt * 0.015, 1.0);
    } else if (mode === 'express') {
      return Math.max(amt * 0.029, 2.0);
    } else {
      return amt * 0.012 + 0.5;
    }
  }, [mode, amount]);

  const net = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    return Math.max(amt - fees, 0);
  }, [amount, fees]);

  const eta = useMemo(() => {
    if (mode === 'standard') return '3-5 business days';
    if (mode === 'express') return '24 hours';
    return '1-2 hours';
  }, [mode]);

  // Validation
  const validateIban = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length < 15 || cleaned.length > 34) {
      setIbanError('Invalid IBAN format');
      return false;
    }
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i.test(cleaned)) {
      setIbanError('Invalid IBAN format');
      return false;
    }
    setIbanError('');
    return true;
  };

  const validateAmount = (value: string): boolean => {
    const amt = parseFloat(value);
    if (isNaN(amt) || amt < 10) {
      setAmountError('Minimum payout amount is €10');
      return false;
    }
    if (amt > availableBalance) {
      setAmountError('Amount exceeds available balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  // Check if step is valid
  const isStepValid = useMemo(() => {
    if (step === 1) {
      return mode !== null;
    } else if (step === 2) {
      if (mode === 'crypto') {
        return address.trim().length > 0 && network !== null;
      } else {
        return iban.trim().length > 0 && !ibanError;
      }
    } else if (step === 3) {
      return amount.trim().length > 0 && !amountError && parseFloat(amount) >= 10;
    }
    return true;
  }, [step, mode, iban, ibanError, address, network, amount, amountError]);

  // Navigation handlers
  const handleNext = () => {
    if (step === 2 && mode !== 'crypto') {
      if (!validateIban(iban)) return;
    }
    if (step === 3) {
      if (!validateAmount(amount)) return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPayout({
        mode,
        amount: parseFloat(amount),
        destination: mode === 'crypto'
          ? { type: 'crypto', cryptoAddress: address, cryptoNetwork: network }
          : { type: 'iban', iban: iban.replace(/\s/g, '') },
      });

      // Success handled by usePayouts (toast + invalidations)
      onOpenChange(false);
    } catch (error) {
      // Error handled by usePayouts (toast)
    }
  };

  // Step titles
  const stepTitle = {
    1: 'Select Payout Mode',
    2: 'Enter Destination',
    3: 'Specify Payout',
    4: 'Confirm Payout',
  }[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stepTitle}</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose how you want to receive your funds'}
            {step === 2 && (mode === 'crypto' ? 'Provide your crypto wallet address' : 'Provide your bank account details')}
            {step === 3 && `Available balance: €${availableBalance.toFixed(2)}`}
            {step === 4 && 'Review your payout details before submitting'}
          </DialogDescription>
        </DialogHeader>

        <form data-testid="payout-form" onSubmit={handleSubmit}>
          {/* Step 1: Mode selection */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex-1">
                    <div className="font-medium">Standard</div>
                    <div className="text-sm text-muted-foreground">1.5% fee, 3-5 business days</div>
                  </div>
                  <input
                    type="radio"
                    name="mode"
                    value="standard"
                    checked={mode === 'standard'}
                    onChange={(e) => setMode(e.target.value as PayoutMode)}
                    className="ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex-1">
                    <div className="font-medium">Express</div>
                    <div className="text-sm text-muted-foreground">2.9% fee, 24 hours</div>
                  </div>
                  <input
                    type="radio"
                    name="mode"
                    value="express"
                    checked={mode === 'express'}
                    onChange={(e) => setMode(e.target.value as PayoutMode)}
                    className="ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex-1">
                    <div className="font-medium">Crypto</div>
                    <div className="text-sm text-muted-foreground">1.2% + €0.50 fee, 1-2 hours</div>
                  </div>
                  <input
                    type="radio"
                    name="mode"
                    value="crypto"
                    checked={mode === 'crypto'}
                    onChange={(e) => setMode(e.target.value as PayoutMode)}
                    className="ml-4"
                  />
                </label>
              </div>

              {/* KYC Warning */}
              {mode === 'crypto' && kycStatus !== 'verified' && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">KYC Verification Required</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Crypto payouts require KYC verification. You can still proceed, but verification will be needed before processing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Destination */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              {mode !== 'crypto' ? (
                <div className="space-y-2">
                  <label htmlFor="iban" className="text-sm font-medium">
                    IBAN
                  </label>
                  <input
                    id="iban"
                    name="iban"
                    type="text"
                    value={iban}
                    onChange={(e) => {
                      setIban(e.target.value);
                      setIbanError('');
                    }}
                    onBlur={(e) => validateIban(e.target.value)}
                    placeholder="FR76 1234 5678 9012 3456 7890 12"
                    aria-invalid={ibanError ? 'true' : 'false'}
                    aria-describedby="iban-error"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {ibanError && (
                    <p role="alert" id="iban-error" className="text-sm text-red-600">
                      {ibanError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter your IBAN in the format: FR76 1234 5678 9012 3456 7890 12
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Crypto Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value.trim())}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your Ethereum wallet address (0x followed by 40 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="network" className="text-sm font-medium">
                      Network
                    </label>
                    <select
                      id="network"
                      name="network"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value as CryptoNetwork)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Amount */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="10"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError('');
                    }}
                    onBlur={(e) => validateAmount(e.target.value)}
                    placeholder="10.00"
                    aria-invalid={amountError ? 'true' : 'false'}
                    aria-describedby="amount-error"
                    className="w-full pl-8 pr-3 py-2 border rounded-md"
                  />
                </div>
                {amountError && (
                  <p role="alert" id="amount-error" className="text-sm text-red-600">
                    {amountError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum: €10.00 | Available: €{availableBalance.toFixed(2)}
                </p>
              </div>

              {/* Live Fee Calculation */}
              {parseFloat(amount) >= 10 && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">€{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fees:</span>
                    <span className="font-medium text-red-600">-€{fees.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">You receive:</span>
                    <span className="font-bold text-lg">€{net.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-xs text-muted-foreground">
                    <span>Estimated arrival:</span>
                    <span className="font-medium">{eta}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div data-testid="summary" className="space-y-4 py-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium capitalize">{mode}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{eta}</span>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">Destination</p>
                  {mode === 'crypto' ? (
                    <div>
                      <p className="font-mono text-sm">{address}</p>
                      <p className="text-xs text-muted-foreground mt-1">Network: {network}</p>
                    </div>
                  ) : (
                    <p className="font-mono text-sm">{iban}</p>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    <span className="font-medium">€{parseFloat(amount).toFixed(2)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Fees:</span>{' '}
                    <span className="font-medium">€{fees.toFixed(2)}</span>
                  </p>
                  <p className="text-base font-semibold border-t pt-2">
                    <span className="text-muted-foreground">Net:</span>{' '}
                    <span>€{net.toFixed(2)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">ETA:</span>{' '}
                    <span className="font-medium">{eta}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                data-testid="back-btn"
                onClick={handleBack}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < 4 && (
              <button
                type="button"
                data-testid="next-btn"
                onClick={handleNext}
                disabled={!isStepValid}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button
                type="submit"
                data-testid="submit-btn"
                disabled={isCreating}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Processing...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
