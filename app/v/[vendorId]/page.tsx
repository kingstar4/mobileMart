import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Search, ArrowUpDown } from "lucide-react";

type PageProps = {
    params: Promise<{ vendorId: string }>;
    searchParams?: Promise<{ q?: string; sort?: string }>;
};

export default async function VendorStorePage({ params, searchParams }: PageProps) {
    const supabase = await createSupabaseServer();
    const { vendorId } = await params;
    const resolvedSearch = await searchParams;

    // Fetch vendor
    const { data: vendor, error: vErr } = await supabase
        .from("vendors")
        .select("id, name, whatsapp_number")
        .eq("id", vendorId)
        .single();

    if (vErr || !vendor) notFound();

    // Build product query — only active products
    const q = (resolvedSearch?.q ?? "").trim();
    const sort = resolvedSearch?.sort ?? "newest";

    let query = supabase
        .from("products")
        .select(
            `id, vendor_id, title, price, currency, quantity, is_active, created_at,
       product_images ( url, sort_order )`
        )
        .eq("vendor_id", vendorId)
        .eq("is_active", true);

    if (q) query = query.ilike("title", `%${q}%`);

    if (sort === "price-low") query = query.order("price", { ascending: true });
    else if (sort === "price-high") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data: products } = await query;

    // Normalize: pick first image
    const items = (products ?? []).map((p: any) => {
        const imgs = (p.product_images ?? [])
            .slice()
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        return { ...p, thumb: imgs[0]?.url ?? null };
    });

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/v/${vendor.id}`}
                        className="font-semibold text-xl text-foreground hover:text-primary transition-colors tracking-tight"
                    >
                        {vendor.name}
                    </Link>
                    <a
                        href={`https://wa.me/${vendor.whatsapp_number}?text=${encodeURIComponent("Hi, I'm interested in your products!")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Chat on WhatsApp</span>
                    </a>
                </div>
            </header>

            {/* Hero banner */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        {vendor.name}
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Browse our collection and order directly via WhatsApp — fast, easy, no middleman.
                    </p>
                </div>
            </section>

            {/* Search + Sort */}
            <section className="max-w-7xl mx-auto w-full px-4 py-8">
                <form method="get" className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                            name="q"
                            defaultValue={q}
                            placeholder="Search products..."
                            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <select
                                name="sort"
                                defaultValue={sort}
                                className="w-full sm:w-auto appearance-none rounded-xl border border-border bg-card pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low → High</option>
                                <option value="price-high">Price: High → Low</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Results count */}
                <p className="text-sm text-muted-foreground mb-6">
                    {items.length} product{items.length !== 1 ? "s" : ""} found
                </p>

                {/* Product grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {items.map((p: any) => (
                            <Link
                                key={p.id}
                                href={`/v/${vendor.id}/p/${p.id}`}
                                className="group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-border"
                            >
                                <div className="relative aspect-square bg-muted overflow-hidden">
                                    {p.thumb ? (
                                        <Image
                                            src={p.thumb}
                                            alt={p.title}
                                            width={400}
                                            height={400}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                                            No image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                </div>
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
                                        {p.title}
                                    </h3>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            Price
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {p.currency}{" "}
                                            {Number(p.price).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                    {p.quantity < 1 && (
                                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                            Out of stock
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-card p-12 text-center">
                        <p className="text-muted-foreground">
                            {q
                                ? `No products found matching "${q}".`
                                : "This store doesn't have any products yet."}
                        </p>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-muted py-8">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {vendor.name}. Powered by MobileMart.
                    </p>
                    <a
                        href={`https://wa.me/${vendor.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <MessageCircle className="h-3 w-3" /> Chat on WhatsApp
                    </a>
                </div>
            </footer>
        </div>
    );
}
