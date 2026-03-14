import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/products';

export function Footer() {
  return (
    <footer className="bg-muted mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">CartBridge</h3>
            <p className="text-muted-foreground text-sm">
              Your trusted online shop for quality products across multiple categories.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-primary" />
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} CartBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
