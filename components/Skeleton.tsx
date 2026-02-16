import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = 'w-full h-12', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} bg-muted animate-shimmer rounded-lg`}
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            backgroundSize: '1000px 100%',
          }}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card animate-fadeInUp">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="w-3/4 h-5" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-1/4 h-5" />
        </div>
      </div>
    </div>
  );
}
