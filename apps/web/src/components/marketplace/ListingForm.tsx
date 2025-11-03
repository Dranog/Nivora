'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CategorySelect } from '@/components/category/CategorySelect';

interface ListingFormProps {
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function ListingForm({ categories, onSubmit, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price ? (initialData.price / 100).toString() : '',
    categoryId: initialData?.categoryId || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Category</Label>
        <CategorySelect
          categories={categories}
          value={formData.categoryId}
          onChange={(value) => setFormData({ ...formData, categoryId: value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : initialData ? 'Update Listing' : 'Create Listing'}
      </Button>
    </form>
  );
}
