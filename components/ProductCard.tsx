'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-full border border-border/50 hover:border-border group bg-card flex flex-col">
        <div className="relative bg-muted overflow-hidden aspect-square">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.title}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        </div>
        <div className="p-3 pt-2.5 pb-3 space-y-1.5 flex flex-col flex-1">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <p className="text-sm font-bold text-foreground">
              {product.currency} {product.price.toFixed(2)}
            </p>
            <Badge variant="secondary" className="text-[11px] capitalize font-medium">
              {product.category}
            </Badge>
          </div>
          <Badge
            variant={product.inStock !== false ? 'secondary' : 'destructive'}
            className={`text-[11px] font-medium w-fit ${
              product.inStock !== false
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : ''
            }`}
          >
            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
