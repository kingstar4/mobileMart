import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HomeSearchClient } from "./home-search-client";

export default async function Home() {
  const supabase = await createSupabaseServer();

  /* Fetch vendors for the Navbar dropdown */
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, name")
    .order("name", { ascending: true });

  /* Fetch latest 8 active products across ALL vendors */
  const { data: products } = await supabase
    .from("products")
    .select(
      `id, vendor_id, title, price, currency, quantity, is_active, created_at,
       product_images ( url, sort_order )`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  /* Normalize images */
  const items = (products ?? []).map((p: any) => {
    const imgs = (p.product_images ?? [])
      .slice()
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      id: p.id as string,
      vendorId: p.vendor_id as string,
      title: p.title as string,
      price: p.price as number,
      currency: p.currency as string,
      quantity: p.quantity as number,
      thumb: (imgs[0]?.url ?? null) as string | null,
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar vendors={vendors ?? []} />
      <main className="flex-1">
        <HeroSection />

        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Browse Our Collection
            </h2>
            <p className="text-muted-foreground">
              Latest products from all vendors — click any item to learn more.
            </p>
          </div>

          <HomeSearchClient items={items} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
