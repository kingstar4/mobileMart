'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/products';

interface WhatsAppCTAButtonProps {
  productTitle?: string;
  pageUrl?: string;
  whatsappNumber?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WhatsAppCTAButton({
  productTitle,
  pageUrl,
  whatsappNumber,
  variant = 'default',
  className,
  size = 'default',
}: WhatsAppCTAButtonProps) {
  const phone = whatsappNumber || WHATSAPP_NUMBER;

  const handleWhatsAppClick = () => {
    let message = 'Hi, I\'m interested in your products!';

    if (productTitle) {
      const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
      message = `Hi, I want to buy: ${productTitle}. Here's the link: ${currentUrl}`;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      variant={variant}
      size={size}
      className={className}
      aria-label={productTitle ? `Chat vendor about ${productTitle} on WhatsApp` : 'Chat on WhatsApp'}
    >
      <MessageCircle className="w-4 h-4" />
      {size !== 'icon' && <span className="ml-2">Chat on WhatsApp</span>}
    </Button>
  );
}
