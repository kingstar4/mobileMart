"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Search, ArrowUpDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Product = {
    id: string;
    title: string;
    price: number;
    currency: string;
    quantity: number;
    created_at: string;
    thumb: string | null;
};

type Vendor = {
    id: string;
    name: string;
    whatsapp_number: string;
};

type Props = {
    vendor: Vendor;
    products: Product[];
};

export default function VendorStoreClient({ vendor, products }: Props) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        let result = q
            ? products.filter((p) => p.title.toLowerCase().includes(q))
            : products;

        if (sort === "price-low") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            result = [...result].sort((a, b) => b.price - a.price);
        } else {
            result = [...result].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
        }

        return result;
    }, [products, query, sort]);

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
                            href={`https://wa.me/${vendor.whatsapp_number}?text=${encodeURIComponent("Hi, I'm interested in your products!")}`}
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
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full sm:w-auto appearance-none rounded-xl border border-border bg-card pl-10 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-muted-foreground mb-6">
                    {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </p>

                {/* Product grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filtered.map((p) => (
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
                            {query.trim()
                                ? `No products found matching "${query.trim()}".`
                                : "This store doesn't have any products yet."}
                        </p>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-muted py-8">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {vendor.name}. Powered by CartBridge.
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
