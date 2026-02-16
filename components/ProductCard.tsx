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
      <Card className="overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-full border border-border/50 hover:border-border group bg-card">
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
        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Price</p>
              <p className="text-xl font-bold text-foreground">
                {product.currency} {product.price.toFixed(2)}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs capitalize font-medium">
              {product.category}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
