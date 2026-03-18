import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageCircle, ArrowLeft, Share2 } from "lucide-react";
import { ImageGallery } from "@/components/ImageGallery";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatWhatsAppNumber } from "@/lib/formatWhatsAppNumber";

type PageProps = {
    vendorId: string;
    productId: string;
};

export default async function ProductDetailsPage({ vendorId, productId }: PageProps) {
    const supabase = await createSupabaseServer();

    // Fetch vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, name, whatsapp_number")
        .eq("id", vendorId)
        .single();

    if (!vendor) notFound();

    // Fetch product + images
    const { data: product } = await supabase
        .from("products")
        .select(
            `id, vendor_id, title, description, price, currency, quantity, is_active,
       product_images ( url, sort_order )`
        )
        .eq("id", productId)
        .eq("vendor_id", vendorId)
        .single();

    if (!product || !product.is_active) notFound();

    // Sort images
    const images = ((product as any).product_images ?? [])
        .slice()
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img: any) => img.url as string);

    const formattedPrice = `${product.currency} ${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cartbridge.netlify.app";
    const whatsappMessage = `Hi, I want to buy: ${product.title} (${formattedPrice}). Here's the link: ${siteUrl}/v/${vendorId}/p/${productId}`;

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
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <a
                            href={`https://wa.me/${formatWhatsAppNumber(vendor.whatsapp_number)}?text=${encodeURIComponent("Hi, I'm interested in your products!")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Chat on WhatsApp</span>
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                {/* Back link */}
                <Link
                    href={`/v/${vendor.id}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {vendor.name}
                </Link>

                {/* Product layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Images */}
                    <div>
                        <ImageGallery images={images} title={product.title} />
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                {product.quantity > 0 ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                                        In Stock ({product.quantity} available)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="border-y border-border py-6">
                            <p className="text-4xl md:text-5xl font-bold text-foreground" suppressHydrationWarning>
                                {formattedPrice}
                            </p>
                        </div>

                        {/* Description */}
                        {product.description ? (
                            <div>
                                <h2 className="font-semibold text-foreground mb-3">
                                    Description
                                </h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        ) : null}

                        {/* CTA */}
                        <div className="space-y-3 pt-4">
                            <a
                                href={`https://wa.me/${formatWhatsAppNumber(vendor.whatsapp_number)}?text=${encodeURIComponent(whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-base font-semibold text-white transition-colors hover:bg-green-700"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Order via WhatsApp
                            </a>
                            <ShareButton title={product.title} />
                        </div>

                        {/* Vendor info */}
                        <div className="rounded-xl border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                Sold by{" "}
                                <Link
                                    href={`/v/${vendor.id}`}
                                    className="font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                    {vendor.name}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto bg-muted py-8">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                        © {new Date().getFullYear()} {vendor.name}. Powered by CartBridge.
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* ——— Client share button (needs 'use client' isolation) ——— */
function ShareButton({ title }: { title: string }) {
    return (
        <ShareButtonClient title={title} />
    );
}

/* We inline a small client component so the rest of the page stays a server component */
import { ShareButtonClient } from "./share-button-client";
