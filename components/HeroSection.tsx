'use client';

import { useState, useEffect, useRef } from 'react';

// Sample product cards for the orbital display
const HERO_PRODUCTS = [
  { id: 1, name: 'Premium Watch', category: 'Accessories', price: '$299', emoji: '⌚' },
  { id: 6, name: 'French Fries', category: 'Food', price: '$449', emoji: '🍟' },
  { id: 2, name: 'Wireless Earbuds', category: 'Electronics', price: '$149', emoji: '🎧' },
  { id: 3, name: 'Leather Bag', category: 'Fashion', price: '$189', emoji: '👜' },
  { id: 4, name: 'Running Shoes', category: 'Sports', price: '$129', emoji: '👟' },
  { id: 5, name: 'T-Shirt', category: 'Clothing', price: '$89', emoji: '👕' },

];

/* ── Scroll-driven floating card ── */
function FloatingCard({
  product,
  index,
  scrollProgress,
  totalCards,
}: {
  product: (typeof HERO_PRODUCTS)[number];
  index: number;
  scrollProgress: number;
  totalCards: number;
}) {
  const angle = (index / totalCards) * Math.PI * 2;
  const radius = 280;

  // Orbit driven by scroll
  const scrollAngle = scrollProgress * Math.PI * 2;
  const currentAngle = angle + scrollAngle;
  const x = Math.cos(currentAngle) * radius;
  const z = Math.sin(currentAngle) * radius;
  const scale = 0.7 + ((z + radius) / (radius * 2)) * 0.45;
  const opacity = 0.4 + ((z + radius) / (radius * 2)) * 0.6;
  const zIndex = Math.round((z + radius) * 10);

  // Cards expand in the middle of the scroll journey
  const isExpanded = scrollProgress > 0.3 && scrollProgress < 0.7;
  const cardScale = isExpanded ? scale * 1.1 : scale;

  return (
    <div
      suppressHydrationWarning
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50%)) scale(${cardScale})`,
        opacity,
        zIndex,
        transition: 'transform 0.05s linear',
        willChange: 'transform',
      }}
    >
      <div
        className="border border-border/30 bg-card/85 backdrop-blur-xl shadow-2xl"
        style={{
          width: 180,
          borderRadius: 20,
          padding: '20px 16px',
        }}
      >
        {/* Glow dot */}
        <div
          className="bg-primary"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            boxShadow: '0 0 12px var(--color-primary)',
            marginBottom: 12,
          }}
        />

        {/* Emoji */}
        <div style={{ fontSize: 36, marginBottom: 10, lineHeight: 1 }}>{product.emoji}</div>

        {/* Category tag */}
        <div
          className="text-primary bg-primary/10"
          style={{
            display: 'inline-block',
            fontSize: 9,
            fontFamily: 'var(--font-mono-display)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          {product.category}
        </div>

        {/* Product name */}
        <div
          className="text-foreground"
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            marginBottom: 4,
          }}
        >
          {product.name}
        </div>

        {/* Price row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 10,
          }}
        >
          <span
            className="text-primary"
            style={{
              fontSize: 16,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {product.price}
          </span>
          <div
            className="border border-primary/40 bg-primary/15 text-primary"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat badge ── */
function StatBadge({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center',
      }}
      className="border-r border-border/30 last:border-r-0 px-3 sm:px-5 md:px-7"
    >
      <div
        className="text-primary text-xl sm:text-2xl md:text-4xl"
        style={{
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
        }}
      >
        {value}
      </div>
      <div
        className="text-muted-foreground text-[8px] sm:text-[9px] md:text-[10px]"
        style={{
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono-display)',
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Scroll-driven story text ── */
function ScrollStory({ progress }: { progress: number }) {
  const stories = [
    { at: 0, text: 'Browse Products.', sub: 'Prices, availability — all in one place.', align: 'center' as const },
    { at: 0.25, text: 'No More Asking.', sub: '"How much?" is a thing of the past.', align: 'left' as const },
    { at: 0.55, text: 'Every Category.', sub: 'Fashion, tech, accessories & more.', align: 'right' as const },
    { at: 0.85, text: 'Connect & Buy.', sub: 'Chat directly with vendors on WhatsApp.', align: 'center' as const },
  ];

  return (
    <>
      {stories.map((story, i) => {
        const dist = Math.abs(progress - story.at);
        const visible = dist < 0.12;
        const opacity = visible ? Math.max(0, 1 - dist / 0.12) : 0;
        const y = visible ? 0 : progress < story.at ? 30 : -30;

        const alignStyle: React.CSSProperties =
          story.align === 'center'
            ? { left: '50%', transform: `translateX(-50%) translateY(${y}px)`, textAlign: 'center' }
            : story.align === 'left'
              ? { left: 60, transform: `translateY(${y}px)`, textAlign: 'left' }
              : { right: 60, transform: `translateY(${y}px)`, textAlign: 'right' };

        return (
          <div
            key={i}
            className="absolute z-40 pointer-events-none"
            style={{
              top: '18%',
              opacity,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              ...alignStyle,
            }}
          >
            <div
              className="text-foreground"
              style={{
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 16px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
              }}
            >
              {story.text}
            </div>
            <div
              className="text-muted-foreground"
              style={{
                fontSize: 'clamp(13px, 1.5vw, 16px)',
                fontFamily: 'var(--font-mono-display)',
                marginTop: 10,
                letterSpacing: '0.05em',
                textShadow: '0 1px 12px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.25)',
              }}
            >
              {story.sub}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ── Main Hero ── */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; size: number; speed: number; opacity: number; delay: number }>
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 400);
    // Generate particles client-side only to avoid hydration mismatch
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 20 + 10,
        opacity: Math.random() * 0.4 + 0.1,
        delay: Math.random() * 20,
      }))
    );
    return () => clearTimeout(timer);
  }, []);

  // Scroll-driven progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div ref={containerRef} style={{ height: '500vh', position: 'relative' }}>
      {/* Sticky viewport — stays fixed while user scrolls through 500vh */}
      <div
        className="bg-background overflow-hidden"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
        }}
      >
        {/* Animated grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-primary, oklch(0.6 0.15 50)) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-primary, oklch(0.6 0.15 50)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            opacity: 0.04,
            animation: 'heroGridShimmer 4s ease-in-out infinite',
          }}
        />

        {/* Radial glow — follows mouse */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
            opacity: 0.08,
            borderRadius: '50%',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-primary"
            style={{
              left: `${p.x}%`,
              bottom: `-${p.size * 2}px`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              opacity: p.opacity,
              animation: `heroFloatUp ${p.speed}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Scroll story text — pops from different sides */}
        <ScrollStory progress={scrollProgress} />

        {/* 3D Orbital card system — driven by scroll */}
        <div
          className="absolute hidden md:block"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
            width: 0,
            height: 0,
            transition: 'transform 0.3s ease',
          }}
        >
          {HERO_PRODUCTS.map((product, i) => (
            <FloatingCard
              key={product.id}
              product={product}
              index={i}
              scrollProgress={scrollProgress}
              totalCards={HERO_PRODUCTS.length}
            />
          ))}

          {/* Center orb */}
          <div
            className="absolute bg-primary/20 border border-primary/30"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              boxShadow: '0 0 40px var(--color-primary), inset 0 0 40px var(--color-primary)',
              opacity: 0.25,
              animation: 'heroPulse 3s ease-in-out infinite',
            }}
          />

          {/* Orbit rings */}
          {[320, 380].map((size, i) => (
            <div
              key={i}
              className="absolute border border-primary/10"
              style={{
                left: '50%',
                top: '50%',
                width: size,
                height: size / 3,
                borderRadius: '50%',
                animation: `heroSpin ${20 + i * 5}s linear infinite`,
              }}
            />
          ))}
        </div>

        {/* Bottom stats */}
        <div
          className="absolute bottom-6 sm:bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 flex items-center bg-card/60 backdrop-blur-xl border border-border/30 rounded-xl sm:rounded-2xl z-10"
          style={{
            padding: '12px 0',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.8s ease 1s',
          }}
        >
          <StatBadge value="500+" label="Active Vendors" delay={600} />
          <StatBadge value="10K+" label="Products Listed" delay={800} />
          <StatBadge value="24/7" label="Always Open" delay={1000} />
        </div>

        {/* Scroll indicator — fades out once scrolling starts */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{
            opacity: scrollProgress < 0.05 ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          <div
            className="text-muted-foreground"
            style={{
              fontFamily: 'var(--font-mono-display)',
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Scroll to explore
          </div>
          <div
            className="bg-primary"
            style={{
              width: 1,
              height: 40,
              opacity: 0.6,
              animation: 'heroPulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Scroll progress bar */}
        <div
          className="absolute top-0 left-0 bg-primary"
          style={{
            height: 2,
            width: `${scrollProgress * 100}%`,
            boxShadow: '0 0 10px var(--color-primary)',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
}
