import { useState, useEffect, useRef } from "react";

const PRODUCTS = [
  { id: 1, name: "Premium Watch", vendor: "LuxTime Co.", price: "$299", category: "Accessories", color: "#FF6B35", emoji: "⌚" },
  { id: 2, name: "Wireless Earbuds", vendor: "SoundWave", price: "$149", category: "Electronics", color: "#4ECDC4", emoji: "🎧" },
  { id: 3, name: "Leather Bag", vendor: "CraftHouse", price: "$189", category: "Fashion", color: "#FFE66D", emoji: "👜" },
  { id: 4, name: "Running Shoes", vendor: "StridePro", price: "$129", category: "Sports", color: "#A8E6CF", emoji: "👟" },
  { id: 5, name: "Desk Lamp", vendor: "LumiDesign", price: "$89", category: "Home", color: "#DDA0DD", emoji: "💡" },
  { id: 6, name: "Camera Lens", vendor: "OptiCraft", price: "$449", category: "Photography", color: "#F7DC6F", emoji: "📷" },
];

function FloatingCard({ product, index, scrollProgress, totalCards }) {
  const angle = (index / totalCards) * Math.PI * 2;
  const radius = 280;

  // Orbit + scroll interaction
  const scrollAngle = scrollProgress * Math.PI * 2;
  const currentAngle = angle + scrollAngle;
  const x = Math.cos(currentAngle) * radius;
  const z = Math.sin(currentAngle) * radius;
  const scale = 0.7 + (z + radius) / (radius * 2) * 0.45;
  const opacity = 0.4 + (z + radius) / (radius * 2) * 0.6;
  const zIndex = Math.round((z + radius) * 10);

  const isExpanded = scrollProgress > 0.3 && scrollProgress < 0.7;
  const cardScale = isExpanded ? scale * 1.1 : scale;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50%)) scale(${cardScale})`,
        opacity,
        zIndex,
        transition: "transform 0.05s linear",
        willChange: "transform",
      }}
    >
      <div
        style={{
          width: 180,
          background: "rgba(20, 20, 20, 0.85)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${product.color}30`,
          borderRadius: 20,
          padding: "20px 16px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${product.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
          cursor: "pointer",
        }}
      >
        {/* Glow dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: product.color,
          boxShadow: `0 0 12px ${product.color}`,
          marginBottom: 12,
        }} />

        {/* Emoji */}
        <div style={{ fontSize: 36, marginBottom: 10, lineHeight: 1 }}>{product.emoji}</div>

        {/* Category tag */}
        <div style={{
          display: "inline-block",
          fontSize: 9,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: product.color,
          background: `${product.color}15`,
          padding: "3px 8px",
          borderRadius: 4,
          marginBottom: 8,
        }}>
          {product.category}
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
          {product.vendor}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 10,
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: product.color, fontFamily: "'Syne', sans-serif" }}>
            {product.price}
          </span>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: `${product.color}20`,
            border: `1px solid ${product.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: product.color,
          }}>
            →
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ value, label, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      textAlign: "center",
      padding: "0 32px",
      borderRight: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        fontSize: 40, fontWeight: 900, fontFamily: "'Syne', sans-serif",
        background: "linear-gradient(135deg, #FF6B35, #FF8C42)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function ScrollStory({ progress }) {
  const stories = [
    { at: 0, text: "Your Store.", sub: "Market anything, anywhere.", align: "center" },
    { at: 0.25, text: "Zero Friction.", sub: "List products in minutes.", align: "left" },
    { at: 0.55, text: "Every Category.", sub: "Fashion, tech, home & more.", align: "right" },
    { at: 0.85, text: "Start Selling.", sub: "Your first product is free.", align: "center" },
  ];

  return (
    <>
      {stories.map((story, i) => {
        const dist = Math.abs(progress - story.at);
        const visible = dist < 0.12;
        const opacity = visible ? Math.max(0, 1 - dist / 0.12) : 0;
        const y = visible ? 0 : dist > 0 && progress < story.at ? 30 : -30;

        const alignStyle = story.align === "center"
          ? { left: "50%", transform: `translateX(-50%) translateY(${y}px)`, textAlign: "center" }
          : story.align === "left"
          ? { left: 60, transform: `translateY(${y}px)`, textAlign: "left" }
          : { right: 60, transform: `translateY(${y}px)`, textAlign: "right" };

        return (
          <div key={i} style={{
            position: "absolute",
            top: "18%",
            opacity,
            transition: "opacity 0.4s ease, transform 0.4s ease",
            pointerEvents: "none",
            ...alignStyle,
          }}>
            <div style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              fontWeight: 900,
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {story.text}
            </div>
            <div style={{
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'DM Mono', monospace",
              marginTop: 10,
              letterSpacing: "0.05em",
            }}>
              {story.sub}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function VendorShopHero() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Particle field
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 20 + 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #080808; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 2px; }

        @keyframes floatUp {
          0% { transform: translateY(0px); opacity: 0.6; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridShimmer {
          0% { opacity: 0.03; }
          50% { opacity: 0.07; }
          100% { opacity: 0.03; }
        }
      `}</style>

      {/* Font preload */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />

      <div ref={containerRef} style={{ height: "500vh", position: "relative" }}>
        {/* Sticky viewport */}
        <div style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          background: "#080808",
          overflow: "hidden",
        }}>

          {/* Animated grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,107,53,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,107,53,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridShimmer 4s ease-in-out infinite",
          }} />

          {/* Radial glow center */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%) translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            transition: "transform 0.3s ease",
            pointerEvents: "none",
          }} />

          {/* Floating particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: "absolute",
              left: `${p.x}%`,
              bottom: `-${p.size * 2}px`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#FF6B35",
              opacity: p.opacity,
              animation: `floatUp ${p.speed}s linear infinite`,
              animationDelay: `${Math.random() * 20}s`,
            }} />
          ))}

          {/* NAV */}
          <nav style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "24px 48px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900,
              }}>V</div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                Vendor<span style={{ color: "#FF6B35" }}>Shop</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {["Vendors", "Categories", "About"].map(item => (
                <span key={item} style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12, letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  textTransform: "uppercase",
                }}>
                  {item}
                </span>
              ))}
              <button style={{
                background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                border: "none", borderRadius: 8,
                padding: "10px 20px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11, letterSpacing: "0.1em",
                textTransform: "uppercase", fontWeight: 500,
                color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
              }}>
                Start Selling
              </button>
            </div>
          </nav>

          {/* Scroll story text */}
          <ScrollStory progress={scrollProgress} />

          {/* 3D Orbital card system */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%) perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
            width: 0, height: 0,
            transition: "transform 0.3s ease",
          }}>
            {PRODUCTS.map((product, i) => (
              <FloatingCard
                key={product.id}
                product={product}
                index={i}
                scrollProgress={scrollProgress}
                totalCards={PRODUCTS.length}
              />
            ))}

            {/* Center orb */}
            <div style={{
              position: "absolute",
              left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: 80, height: 80,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,107,53,0.3), transparent)",
              border: "1px solid rgba(255,107,53,0.3)",
              boxShadow: "0 0 40px rgba(255,107,53,0.3), inset 0 0 40px rgba(255,107,53,0.1)",
              animation: "pulse 3s ease-in-out infinite",
            }} />

            {/* Orbit rings */}
            {[320, 380].map((size, i) => (
              <div key={i} style={{
                position: "absolute",
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                width: size, height: size / 3,
                border: `1px solid rgba(255,107,53,${0.08 - i * 0.02})`,
                borderRadius: "50%",
                animation: `spin ${20 + i * 5}s linear infinite`,
              }} />
            ))}
          </div>

          {/* Bottom stats */}
          <div style={{
            position: "absolute",
            bottom: 60, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "20px 0",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease 1s",
          }}>
            <StatBadge value="500+" label="Active Vendors" delay={600} />
            <StatBadge value="10K+" label="Products Listed" delay={800} />
            <div style={{
              opacity: 1, textAlign: "center", padding: "0 32px",
            }}>
              <div style={{
                fontSize: 40, fontWeight: 900, fontFamily: "'Syne', sans-serif",
                background: "linear-gradient(135deg, #FF6B35, #FF8C42)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>24/7</div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                Support
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute",
            bottom: 20, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            opacity: scrollProgress < 0.05 ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
            }}>Scroll to explore</div>
            <div style={{
              width: 1, height: 40,
              background: "linear-gradient(to bottom, rgba(255,107,53,0.6), transparent)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
          </div>

          {/* Scroll progress bar */}
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            height: 2,
            width: `${scrollProgress * 100}%`,
            background: "linear-gradient(90deg, #FF3D00, #FF6B35)",
            boxShadow: "0 0 10px rgba(255,107,53,0.8)",
            transition: "width 0.1s linear",
          }} />
        </div>
      </div>

      {/* After scroll section */}
      <div style={{
        background: "#080808",
        padding: "120px 60px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: 20,
          }}>
            For Every Vendor
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 900, color: "#fff",
            lineHeight: 1.05, letterSpacing: "-0.03em",
            marginBottom: 24,
          }}>
            Your products deserve<br />
            <span style={{ color: "#FF6B35" }}>to be seen.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 15, color: "rgba(255,255,255,0.4)",
            maxWidth: 480, margin: "0 auto 48px",
            lineHeight: 1.8, letterSpacing: "0.02em",
          }}>
            Join thousands of vendors who market their products online without the stress. 
            Set up in minutes, sell to the world.
          </p>
          <button style={{
            background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
            border: "none", borderRadius: 12,
            padding: "18px 48px",
            fontFamily: "'Syne', sans-serif",
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
            color: "#fff", cursor: "pointer",
            boxShadow: "0 8px 40px rgba(255,107,53,0.4)",
          }}>
            Create Your Store →
          </button>
        </div>
      </div>
    </>
  );
}
