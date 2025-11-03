'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BoostButtonProps {
  listingId: string;
  onBoost: (duration: number, amount: number) => Promise<void>;
}

export function BoostButton({ listingId, onBoost }: BoostButtonProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState('7');
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    try {
      const days = parseInt(duration);
      const amount = days * 500; // $5 per day
      await onBoost(days, amount);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">⚡ Boost Listing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Boost Your Listing</DialogTitle>
          <DialogDescription>
            Boosted listings appear at the top of search results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Cost: ${(parseInt(duration) * 5).toFixed(2)} USD
            </p>
          </div>
          <Button onClick={handleBoost} disabled={loading} className="w-full">
            {loading ? 'Processing...' : 'Boost Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
