// ==========================================
// KYC VALIDATION DETAIL PAGE (Écran 9 - MANQUANT)
// ==========================================
// apps/web/app/(admin)/kyc/[id]/page.tsx

'use client';

import { use } from 'react';
import { useKycDetail, useApproveKyc, useRejectKyc, useRequestKycReview } from '@/hooks/admin/useKyc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function KycDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const { data: kyc, isLoading } = useKycDetail(id);
  const approveMutation = useApproveKyc();
  const rejectMutation = useRejectKyc();
  const requestReviewMutation = useRequestKycReview();

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this KYC verification?')) return;

    try {
      await approveMutation.mutateAsync({ id, notes: 'Approved by admin' });
      toast({
        title: 'KYC Approved',
        description: 'User has been verified successfully.',
      });
      router.push('/admin/kyc');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve KYC.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason });
      toast({
        title: 'KYC Rejected',
        description: 'User has been notified.',
      });
      router.push('/admin/kyc');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject KYC.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestReview = async () => {
    const notes = prompt('Notes for senior review:');
    if (!notes) return;

    try {
      await requestReviewMutation.mutateAsync({ id, notes });
      toast({
        title: 'Review Requested',
        description: 'This KYC has been escalated for senior review.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request review.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">KYC verification not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">Review and validate user identity documents</p>
        </div>
        <Badge className={getStatusColor(kyc.status)}>
          {kyc.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={kyc.user.avatar} />
                <AvatarFallback>{kyc.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{kyc.user.username}</p>
                <p className="text-sm text-gray-600">{kyc.user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow label="Full Name" value={kyc.personalData.fullName} />
              <InfoRow label="Date of Birth" value={kyc.personalData.dateOfBirth} />
              <InfoRow label="Nationality" value={kyc.personalData.nationality} />
              <InfoRow label="ID Number" value={kyc.personalData.idNumber} />
              <InfoRow label="Expiration" value={kyc.personalData.expirationDate} />
            </div>
          </Card>

          {/* AI Confidence Analysis */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Confidence Analysis</h2>
            
            <div className="space-y-4">
              <ConfidenceBar
                label="Identity Match"
                score={kyc.aiScores.identityMatch}
              />
              <ConfidenceBar
                label="Liveness Detection"
                score={kyc.aiScores.liveness}
              />
              <ConfidenceBar
                label="Document Authenticity"
                score={kyc.aiScores.documentAuthenticity}
              />
            </div>

            <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                AI scores are for reference only. Always verify documents manually.
              </p>
            </div>
          </Card>
        </div>

        {/* Middle & Right Columns: Documents */}
        <div className="col-span-2 space-y-6">
          {/* Document Viewer */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Identity Documents</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <DocumentCard
                title="ID Front"
                url={kyc.documents.front}
                onClick={() => setSelectedDocument(kyc.documents.front)}
              />
              <DocumentCard
                title="ID Back"
                url={kyc.documents.back}
                onClick={() => setSelectedDocument(kyc.documents.back)}
              />
              <DocumentCard
                title="Selfie / Liveness"
                url={kyc.documents.selfie}
                onClick={() => setSelectedDocument(kyc.documents.selfie)}
              />
              <DocumentCard
                title="Proof of Address"
                url={kyc.documents.proof}
                onClick={() => setSelectedDocument(kyc.documents.proof)}
              />
            </div>
          </Card>

          {/* Verification Checklist */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Checklist</h2>
            
            <div className="space-y-3">
              <ChecklistItem text="Photo on ID matches selfie" />
              <ChecklistItem text="ID is not expired" />
              <ChecklistItem text="All text is clearly readable" />
              <ChecklistItem text="No signs of tampering or editing" />
              <ChecklistItem text="Liveness detection passed" />
              <ChecklistItem text="Address proof matches ID" />
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 bg-gray-50">
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={approveMutation.isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve KYC
              </Button>
              <Button
                onClick={() => setRejectDialogOpen(true)}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={rejectMutation.isLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject KYC
              </Button>
              <Button
                onClick={handleRequestReview}
                variant="outline"
                className="flex-1"
                disabled={requestReviewMutation.isLoading}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Senior Review
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={selectedDocument}
                alt="Document"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => window.open(selectedDocument, '_blank')}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a detailed reason for rejection. This will be sent to the user.
            </p>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ConfidenceBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500';
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function DocumentCard({ title, url, onClick }: { title: string; url: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-500 transition group"
    >
      <img src={url} alt={title} className="w-full h-48 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="p-3 bg-white">
        <p className="text-sm font-medium text-gray-900">{title}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <input type="checkbox" className="w-5 h-5 text-cyan-600 rounded" />
      <span className="text-sm text-gray-700">{text}</span>
    </label>
  );
}

function getStatusColor(status: string): string {
  const colors = {
    PENDING: 'bg-orange-100 text-orange-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// ==========================================
// TEXTAREA COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/ui/textarea.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8A9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

// ==========================================
// SKELETON COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/ui/skeleton.tsx

import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };

// ==========================================
// TOASTER COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/ui/toaster.tsx

'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// ==========================================
// TOAST PRIMITIVES (MANQUANT)
// ==========================================
// apps/web/components/ui/toast.tsx

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-gray-900',
        destructive:
          'destructive group border-red-500 bg-red-50 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

// ==========================================
// USE TOAST HOOK (MANQUANT)
// ==========================================
// apps/web/hooks/use-toast.ts

import * as React from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ ...props }: Omit<ToasterToast, 'id'>) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };

// ==========================================
// USE DEBOUNCE HOOK (MANQUANT)
// ==========================================
// apps/web/hooks/use-debounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}