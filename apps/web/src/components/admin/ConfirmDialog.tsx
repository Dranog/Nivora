'use client';

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
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
  details?: string[];
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  variant = 'default',
  details,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {variant === 'danger' ? (
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <AlertDialogTitle className={variant === 'danger' ? 'text-red-900' : 'text-gray-900'}>
              {title}
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="space-y-3">
            {typeof description === 'string' ? <p>{description}</p> : description}
            {details && details.length > 0 && (
              <ul className="space-y-2 text-sm">
                {details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={variant === 'danger' ? 'text-red-500' : 'text-blue-500'}>•</span>
                    <span className="flex-1">{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : 'bg-[#00B8A9] hover:bg-[#00A89A]'
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
