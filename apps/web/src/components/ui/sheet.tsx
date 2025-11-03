'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {children}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { side?: 'top' | 'right' | 'bottom' | 'left' }
>(({ className, side = 'right', children, ...props }, ref) => {
  const position: Record<string, string> = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 border-r',
    right: 'inset-y-0 right-0 border-l',
  };
  const animation: Record<string, string> = {
    top: 'slide-in-from-top',
    bottom: 'slide-in-from-bottom',
    left: 'slide-in-from-left',
    right: 'slide-in-from-right',
  };
  return (
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-white shadow-lg transition-all duration-300 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
        position[side],
        animation[side],
        'w-full sm:max-w-md',
        className
      )}
      {...props}
    >
      <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </Dialog.Close>
      {children}
    </Dialog.Content>
  );
});
SheetContent.displayName = 'SheetContent';

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Dialog.Title className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </Dialog.Title>
  );
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Dialog.Description className={cn('text-sm text-gray-500 mt-1', className)}>
      {children}
    </Dialog.Description>
  );
}

export function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 p-4 border-t bg-gray-50', className)}>
      {children}
    </div>
  );
}
