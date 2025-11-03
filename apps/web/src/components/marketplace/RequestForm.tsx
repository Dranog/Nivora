'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RequestFormProps {
  onSubmit: (data: any) => Promise<void>;
  listingId?: string;
  creatorId?: string;
}

export function RequestForm({ onSubmit, listingId, creatorId }: RequestFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        budget: formData.budget ? Math.round(parseFloat(formData.budget) * 100) : undefined,
        listingId,
        creatorId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Request Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What do you need?"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your request in detail..."
          rows={5}
          required
        />
      </div>

      <div>
        <Label htmlFor="budget">Budget (USD, optional)</Label>
        <Input
          id="budget"
          type="number"
          step="0.01"
          min="0"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          placeholder="Your budget"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Send Request'}
      </Button>
    </form>
  );
}
