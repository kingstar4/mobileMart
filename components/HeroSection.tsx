'use client';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-card via-background to-background py-20 md:py-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 text-center space-y-8 animate-fadeInUp">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Discover Quality
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-pretty leading-tight">
            Curated Collections for Your Style
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Explore our handpicked selection of premium products across multiple categories. Find exactly what you need with ease and elegance.
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex flex-col md:flex-row gap-8 justify-center pt-8 pb-4">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Products</p>
          </div>
          <div className="hidden md:block w-px bg-border/50" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">100%</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Quality Assured</p>
          </div>
          <div className="hidden md:block w-px bg-border/50" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
