'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="mb-4"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
