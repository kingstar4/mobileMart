export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  description: string;
  images: string[];
  rating?: number;
  inStock?: boolean;
}

export type Category = 'all' | 'actions' | 'food' | 'fashion';
export type SortOption = 'newest' | 'price-low' | 'price-high';
