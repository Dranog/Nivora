'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { resolveReportSchema, type ResolveReportInput } from '@/lib/validations/admin-actions';
import { AlertTriangle, CheckCircle, Shield, Ban } from 'lucide-react';

interface ResolveReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportedUser: string;
  reportReason: string;
  onSuccess?: () => void;
}

export function ResolveReportModal({
  open,
  onOpenChange,
  reportId,
  reportedUser,
  reportReason,
  onSuccess,
}: ResolveReportModalProps) {
  const [action, setAction] = useState<'dismiss' | 'warn' | 'suspend' | 'ban'>('dismiss');
  const [reason, setReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const input: ResolveReportInput = {
        reportId,
        action,
        reason,
        suspendDuration: action === 'suspend' ? suspendDuration : undefined,
      };

      const validated = resolveReportSchema.parse(input);

      setIsSubmitting(true);
      console.log('🛡️ [RESOLVE REPORT] Resolving report:', validated);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const actionLabels = {
        dismiss: 'Signalement rejeté',
        warn: 'Avertissement envoyé',
        suspend: `Utilisateur suspendu pour ${suspendDuration} jours`,
        ban: 'Utilisateur banni définitivement',
      };

      toast.success(actionLabels[action]);
      console.log('✅ [RESOLVE REPORT] Report resolved successfully');

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ [RESOLVE REPORT] Validation error:', error);
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la résolution du signalement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'dismiss':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'suspend':
        return <Shield className="w-5 h-5 text-orange-600" />;
      case 'ban':
        return <Ban className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            Résoudre le signalement
          </DialogTitle>
          <DialogDescription>
            Choisissez une action à appliquer suite à ce signalement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-1">Utilisateur signalé</p>
            <p className="text-sm text-gray-700">{reportedUser}</p>
            <p className="text-sm font-medium text-gray-900 mt-3 mb-1">Motif du signalement</p>
            <p className="text-sm text-gray-700">{reportReason}</p>
          </div>

          {/* Action selection */}
          <div>
            <Label htmlFor="action">Action à prendre *</Label>
            <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dismiss">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Rejeter le signalement
                  </div>
                </SelectItem>
                <SelectItem value="warn">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Envoyer un avertissement
                  </div>
                </SelectItem>
                <SelectItem value="suspend">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Suspendre temporairement
                  </div>
                </SelectItem>
                <SelectItem value="ban">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Bannir définitivement
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suspend duration */}
          {action === 'suspend' && (
            <div>
              <Label htmlFor="duration">Durée de suspension (jours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(parseInt(e.target.value) || 7)}
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">
              Raison de votre décision * <span className="text-xs text-gray-500">(min 10 caractères)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez votre décision..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length} / 1000 caractères</p>
          </div>

          {/* Warning for severe actions */}
          {(action === 'ban' || action === 'suspend') && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900 font-medium">
                ⚠️ Attention : Cette action affectera immédiatement l'accès de l'utilisateur
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.length < 10}
            className={
              action === 'ban'
                ? 'bg-red-600 hover:bg-red-700'
                : action === 'suspend'
                ? 'bg-orange-600 hover:bg-orange-700'
                : action === 'warn'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : ''
            }
          >
            {isSubmitting ? 'Traitement...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
