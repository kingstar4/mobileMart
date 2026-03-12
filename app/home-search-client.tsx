"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown } from "@/components/SortDropdown";
import { SortOption } from "@/lib/types";

type Item = {
    id: string;
    vendorId: string;
    title: string;
    price: number;
    currency: string;
    quantity: number;
    thumb: string | null;
};

export function HomeSearchClient({ items }: { items: Item[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("newest");

    const filtered = useMemo(() => {
        let result = [...items];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((p) => p.title.toLowerCase().includes(q));
        }

        if (sortOption === "price-low") result.sort((a, b) => a.price - b.price);
        else if (sortOption === "price-high") result.sort((a, b) => b.price - a.price);

        return result;
    }, [items, searchQuery, sortOption]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8">
                <div className="md:col-span-5">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                <div className="md:col-span-3">
                    <SortDropdown value={sortOption} onChange={setSortOption} />
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filtered.map((p) => (
                        <Link
                            key={p.id}
                            href={`/v/${p.vendorId}/p/${p.id}`}
                            className="group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-border"
                        >
                            <div className="relative aspect-square bg-muted overflow-hidden">
                                {p.thumb ? (
                                    <Image
                                        src={p.thumb}
                                        alt={p.title}
                                        width={300}
                                        height={300}
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
                                    <p className="text-lg font-bold text-foreground" suppressHydrationWarning>
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
                        {searchQuery
                            ? `No products found matching "${searchQuery}".`
                            : "No products available yet. Check back soon!"}
                    </p>
                </div>
            )}
        </>
    );
}
