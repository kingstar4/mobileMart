'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WhatsAppCTAButton } from './WhatsAppCTAButton';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Store, Menu, X } from 'lucide-react';

type Vendor = { id: string; name: string };

interface NavbarProps {
  vendors?: Vendor[];
}

export function Navbar({ vendors = [] }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVendorClick = (vendorId: string) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/v/${vendorId}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
        : 'bg-background border-b border-border/30'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-xl text-foreground hover:text-primary transition-colors duration-300 tracking-tight"
        >
          CartBridge
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Vendors dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded-md focus-visible:px-2 focus-visible:py-1"
            >
              <Store className="h-4 w-4" />
              Vendors
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown panel */}
            <div
              className={`absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/60 bg-background shadow-xl transition-all duration-200 origin-top-right ${isDropdownOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
                }`}
            >
              <div className="p-1.5 max-h-64 overflow-y-auto">
                {vendors.length > 0 ? (
                  vendors.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVendorClick(v.id)}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors duration-150"
                    >
                      {v.name}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                    No vendors available
                  </p>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
          >
            About
          </Link>
          <div className="h-6 w-px bg-border/50" />
          <ThemeToggle />
          <WhatsAppCTAButton size="sm" />
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <WhatsAppCTAButton size="sm" />
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden border-t border-border/30 bg-background transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vendors
          </p>
          {vendors.length > 0 ? (
            vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => handleVendorClick(v.id)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors duration-150 flex items-center gap-2"
              >
                <Store className="h-3.5 w-3.5" />
                {v.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              No vendors available
            </p>
          )}
          <div className="h-px bg-border/30 my-2" />
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors duration-150"
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
}
