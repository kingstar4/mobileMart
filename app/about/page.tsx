import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppCTAButton } from '@/components/WhatsAppCTAButton';
import { Card } from '@/components/ui/card';
import { WHATSAPP_NUMBER } from '@/lib/products';
import { Clock, MapPin, MessageCircle } from 'lucide-react';
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
            <p className="text-muted-foreground text-lg md:text-xl">
              Your trusted destination for quality products
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Vendor Story */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              We are a dedicated single vendor business committed to providing our customers with the highest quality
              products across multiple categories. From premium tech accessories to gourmet food items and fashion
              essentials, we carefully curate every product to ensure customer satisfaction.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our mission is to make online shopping convenient, reliable, and enjoyable. We believe in transparency,
              fair pricing, and exceptional customer service. Every product in our catalog is personally selected to meet
              our high standards.
            </p>
          </div>

          {/* Contact & Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* WhatsApp Contact */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageCircle className="w-8 h-8 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Contact via WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Have questions? Reach out to us directly on WhatsApp for quick responses.
                  </p>
                  <WhatsAppCTAButton className="w-full" />
                </div>
              </div>
            </Card>

            {/* WhatsApp Number */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">+</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">WhatsApp Number</h3>
                  <p className="text-muted-foreground text-sm mb-2">Message us anytime during business hours</p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {WHATSAPP_NUMBER}
                  </a>
                </div>
              </div>
            </Card>

            {/* Operating Hours */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Operating Hours</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Info */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Service Coverage</h3>
                  <p className="text-muted-foreground text-sm">
                    We serve customers nationwide with reliable WhatsApp ordering and support. Contact us for delivery
                    details.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Why Choose Us */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Quality Assurance</h3>
                <p className="text-muted-foreground">Every product is carefully inspected before delivery</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Direct Communication</h3>
                <p className="text-muted-foreground">Chat directly with us on WhatsApp for personalized service</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Fair Pricing</h3>
                <p className="text-muted-foreground">Competitive prices without hidden charges</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Easy Ordering</h3>
                <p className="text-muted-foreground">Simple WhatsApp-based ordering process</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
