"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/browserClient";

const ProductSchema = z.object({
    title: z.string().min(1, "Title is required").max(120),
    description: z.string().max(4000).optional().default(""),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    currency: z.string().min(3).max(5).default("NGN"),
    quantity: z.coerce.number().int().min(0, "Quantity must be >= 0"),
    is_active: z.coerce.boolean().default(true),
});

function sanitizeFiles(files: FileList | null) {
    if (!files) return [];
    return Array.from(files).filter((f) => f.type.startsWith("image/"));
}

export default function NewProductClient({
    vendorId,
    vendorName,
}: {
    vendorId: string;
    vendorName: string;
}) {
    const supabase = supabaseBrowser();
    const router = useRouter();

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [currency, setCurrency] = React.useState("NGN");
    const [price, setPrice] = React.useState<string>("0");
    const [quantity, setQuantity] = React.useState<string>("0");
    const [isActive, setIsActive] = React.useState(true);

    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<string[]>([]);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Create previews
    React.useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    async function uploadImages(productId: string, imageFiles: File[]) {
        // Upload each file -> get public URL -> return URLs in order
        const urls: string[] = [];

        for (const file of imageFiles) {
            const ext = file.name.split(".").pop() || "jpg";
            const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from("product-images")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                });

            if (upErr) throw upErr;

            const { data } = supabase.storage.from("product-images").getPublicUrl(path);
            if (!data?.publicUrl) throw new Error("Failed to get public URL for uploaded image.");

            urls.push(data.publicUrl);
        }

        return urls;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsed = ProductSchema.safeParse({
            title,
            description,
            price,
            currency,
            quantity,
            is_active: isActive,
        });

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
            return;
        }

        setLoading(true);
        try {
            // 1) Insert product
            const { data: product, error: pErr } = await supabase
                .from("products")
                .insert({
                    vendor_id: vendorId,
                    title: parsed.data.title,
                    description: parsed.data.description ?? "",
                    price: parsed.data.price,
                    currency: parsed.data.currency,
                    quantity: parsed.data.quantity,
                    is_active: parsed.data.is_active,
                })
                .select("id")
                .single();

            if (pErr) throw pErr;
            if (!product?.id) throw new Error("Product creation failed.");

            // 2) Upload images (optional)
            const imageFiles = files;
            if (imageFiles.length > 0) {
                const urls = await uploadImages(product.id, imageFiles);

                // 3) Insert product_images rows
                const rows = urls.map((url, idx) => ({
                    product_id: product.id,
                    url,
                    sort_order: idx,
                }));

                const { error: imgErr } = await supabase.from("product_images").insert(rows);
                if (imgErr) throw imgErr;
            }

            // 4) Navigate back to list
            router.push(`/admin/vendor/${vendorId}/products`);
            router.refresh();
        } catch (err: any) {
            setError(err?.message ?? "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl p-6">
            <header className="mb-6 flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Add Product</h1>
                    <p className="text-sm text-black/60">Vendor: {vendorName}</p>
                </div>

                <a
                    href={`/admin/vendor/${vendorId}/products`}
                    className="rounded-xl border px-4 py-2 text-sm"
                >
                    Back
                </a>
            </header>

            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., iPhone 13 Pro Max"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="min-h-[120px] w-full rounded-xl border px-3 py-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Details, condition, specs, delivery notes..."
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Currency</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            placeholder="NGN"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Price</label>
                        <input
                            inputMode="decimal"
                            className="w-full rounded-xl border px-3 py-2"
                            value={price}
                            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Quantity</label>
                        <input
                            inputMode="numeric"
                            className="w-full rounded-xl border px-3 py-2"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="0"
                        />
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Visible on storefront (is_active)
                </label>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const picked = sanitizeFiles(e.target.files);
                            setFiles(picked);
                        }}
                    />

                    {previews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {previews.map((src, idx) => (
                                <div key={src} className="relative overflow-hidden rounded-xl border bg-black/5">
                                    <img src={src} alt={`Preview ${idx + 1}`} className="aspect-square w-full object-cover" />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs"
                                        onClick={() => {
                                            setFiles((prev) => prev.filter((_, i) => i !== idx));
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-black/60">Upload 1–6 clear images for best results.</p>
                    )}
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save Product"}
                </button>
            </form>
        </main>
    );
}
