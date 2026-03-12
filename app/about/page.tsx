import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { WHATSAPP_NUMBER } from '@/lib/products';
import { Mail, MessageCircle } from 'lucide-react';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function About() {
  const supabase = await createSupabaseServer();
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar vendors={vendors ?? []} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted to-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              About Vendor Shop
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Bridging the gap between vendors and customers — so buying and selling is simpler for everyone.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* What We Do */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">What We Do</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Vendor Shop is a platform built to connect vendors with their customers in a smarter, more convenient way.
              Instead of vendors repeatedly posting products in groups and customers constantly asking
              &quot;how much?&quot; or &quot;is it still available?&quot;, everything they need is right here — prices,
              availability, and product details — all in one place.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              When a customer finds what they want, they simply reach out to the vendor directly on WhatsApp to complete
              the transaction. It&apos;s personal, secure, and hassle-free — the way buying and selling should be.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* WhatsApp Contact */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageCircle className="w-8 h-8 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Contact via WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Have questions about the platform? Reach out to us directly on WhatsApp for quick responses.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </Card>

            {/* Email Contact */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Contact via Email</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Prefer email? Send us a message and we&apos;ll get back to you as soon as possible.
                  </p>
                  <a
                    href="mailto:davidinobemhe1@gmail.com"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send an Email
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Why Vendor Shop */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Why Vendor Shop?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">No More Repetitive Posting</h3>
                <p className="text-muted-foreground">Vendors list their products once and customers can browse anytime — no need to repost in groups over and over.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Prices Upfront</h3>
                <p className="text-muted-foreground">Every product shows its price clearly, so customers never have to ask &quot;how much?&quot; again.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Real-Time Availability</h3>
                <p className="text-muted-foreground">Stock status is displayed on every product — no more messaging vendors just to ask &quot;is it still available?&quot;</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Secure Transactions</h3>
                <p className="text-muted-foreground">All purchases are handled directly between vendor and customer via WhatsApp — private, personal, and secure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
