'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageGallery } from '@/components/ImageGallery';
import { WhatsAppCTAButton } from '@/components/WhatsAppCTAButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.id === params.id);
  const [shared, setShared] = useState(false);

  if (!product) {
    notFound();
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out: ${product.title}`;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: text,
        url: url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to products
          </Button>
        </Link>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery images={product.images} title={product.title} />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="text-base capitalize">
                  {product.category}
                </Badge>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                  </div>
                )}
                {product.inStock !== false && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="border-y border-border py-6">
              <p className="text-5xl font-bold text-foreground">
                {product.currency} {product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-6">
              <WhatsAppCTAButton
                productTitle={product.title}
                pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
                size="lg"
                className="w-full h-12"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="flex-1 gap-2 bg-transparent"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                  {shared ? 'Copied!' : 'Share'}
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            {product.images.length > 1 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Multiple images available:</strong> Scroll through the gallery
                  above to see more product images.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
