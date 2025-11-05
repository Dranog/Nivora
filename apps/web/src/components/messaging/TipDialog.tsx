'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const tipSchema = z.object({
  amount: z
    .number()
    .min(1, 'Montant minimum 1€')
    .max(1000, 'Montant maximum 1000€'),
  message: z.string().max(500, 'Message trop long (max 500 caractères)').optional(),
});

type TipFormData = z.infer<typeof tipSchema>;

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

export function TipDialog({
  open,
  onOpenChange,
  creatorId,
  creatorName,
}: TipDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = [5, 10, 20, 50];

  const form = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      amount: 10,
      message: '',
    },
  });

  const onSubmit = async (data: TipFormData) => {
    try {
      setIsLoading(true);

      // TODO: Appel API vers votre endpoint /api/tips
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          amount: data.amount,
          message: data.message,
        }),
      });

      if (!response.ok) throw new Error('Payment failed');

      toast.success(t('toasts.tips.success'), {
        description: t('toasts.tips.successDescription', { amount: data.amount }),
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(t('toasts.tips.error'), {
        description: t('toasts.tips.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('messages.tips.title')}</DialogTitle>
          <DialogDescription>
            {t('messages.tips.description', { creator: creatorName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Montants rapides */}
          <div className="space-y-2">
            <Label>{t('messages.tips.quickAmounts')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue('amount', amount)}
                  className={
                    form.watch('amount') === amount
                      ? 'border-primary bg-primary/10'
                      : ''
                  }
                >
                  {amount}€
                </Button>
              ))}
            </div>
          </div>

          {/* Montant personnalisé */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('messages.tips.amount')}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="1"
                max="1000"
                step="1"
                className="pl-9"
                {...form.register('amount', { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Message optionnel */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('messages.tips.message')}</Label>
            <Textarea
              id="message"
              placeholder={t('messages.tips.messagePlaceholder', {
                creator: creatorName,
              })}
              rows={3}
              maxLength={500}
              {...form.register('message')}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('messages.tips.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
