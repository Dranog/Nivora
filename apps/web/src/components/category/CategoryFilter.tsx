'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected?: string;
  onSelect: (categoryId: string | undefined) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!selected ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(undefined)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selected === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(category.id)}
          className={cn('flex items-center gap-1')}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
}
