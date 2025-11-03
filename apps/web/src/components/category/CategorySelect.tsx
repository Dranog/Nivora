'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategorySelectProps {
  categories: Category[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Select a category',
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="flex items-center gap-2">
              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
