'use client';

import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryBadgeProps {
  category: Category;
  variant?: 'default' | 'secondary' | 'outline';
}

export function CategoryBadge({ category, variant = 'secondary' }: CategoryBadgeProps) {
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {category.icon && <span>{category.icon}</span>}
      <span>{category.name}</span>
    </Badge>
  );
}
