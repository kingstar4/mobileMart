'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Category } from '@/lib/types';

const categories: { label: string; value: Category }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Actions', value: 'actions' },
  { label: 'Food', value: 'food' },
  { label: 'Fashion', value: 'fashion' },
];

interface CategoryFilterProps {
  value: Category;
  onChange: (category: Category) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const selectedLabel = categories.find((c) => c.value === value)?.label || 'All Categories';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 gap-2 bg-card border-border/50 hover:border-border/80 hover:bg-card text-foreground font-medium transition-all duration-300 rounded-lg"
        >
          {selectedLabel}
          <ChevronDown className="w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-lg border-border/50">
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.value}
            onClick={() => onChange(category.value)}
            className="cursor-pointer transition-colors duration-200"
          >
            {category.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
