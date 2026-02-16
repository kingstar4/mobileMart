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

type ExistingImage = { id: string; url: string };

function sanitizeFiles(files: FileList | null) {
    if (!files) return [];
    return Array.from(files).filter((f) => f.type.startsWith("image/"));
}

export default function EditProductClient({
    vendorId,
    vendorName,
    product,
    existingImages,
}: {
    vendorId: string;
    vendorName: string;
    product: {
        id: string;
        title: string;
        description: string;
        price: number;
        currency: string;
        quantity: number;
        is_active: boolean;
    };
    existingImages: ExistingImage[];
}) {
    const supabase = supabaseBrowser();
    const router = useRouter();

    const [title, setTitle] = React.useState(product.title);
    const [description, setDescription] = React.useState(product.description);
    const [currency, setCurrency] = React.useState(product.currency);
    const [price, setPrice] = React.useState<string>(String(product.price));
    const [quantity, setQuantity] = React.useState<string>(
        String(product.quantity)
    );
    const [isActive, setIsActive] = React.useState(product.is_active);

    // Existing images that haven't been removed
    const [kept, setKept] = React.useState<ExistingImage[]>(existingImages);
    // Newly selected files
    const [newFiles, setNewFiles] = React.useState<File[]>([]);
    const [newPreviews, setNewPreviews] = React.useState<string[]>([]);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Generate previews for new files
    React.useEffect(() => {
        const urls = newFiles.map((f) => URL.createObjectURL(f));
        setNewPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newFiles]);

    async function uploadImages(productId: string, imageFiles: File[]) {
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

            const { data } = supabase.storage
                .from("product-images")
                .getPublicUrl(path);
            if (!data?.publicUrl)
                throw new Error("Failed to get public URL for uploaded image.");

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
            // 1) Update product row
            const { error: pErr } = await supabase
                .from("products")
                .update({
                    title: parsed.data.title,
                    description: parsed.data.description ?? "",
                    price: parsed.data.price,
                    currency: parsed.data.currency,
                    quantity: parsed.data.quantity,
                    is_active: parsed.data.is_active,
                })
                .eq("id", product.id)
                .eq("vendor_id", vendorId);

            if (pErr) throw pErr;

            // 2) Delete removed images from product_images table
            const keptIds = kept.map((img) => img.id);
            const removedImages = existingImages.filter(
                (img) => !keptIds.includes(img.id)
            );

            if (removedImages.length > 0) {
                const { error: delErr } = await supabase
                    .from("product_images")
                    .delete()
                    .in(
                        "id",
                        removedImages.map((img) => img.id)
                    );
                if (delErr) throw delErr;
            }

            // 3) Upload new images (if any)
            if (newFiles.length > 0) {
                const urls = await uploadImages(product.id, newFiles);

                const startOrder = kept.length;
                const rows = urls.map((url, idx) => ({
                    product_id: product.id,
                    url,
                    sort_order: startOrder + idx,
                }));

                const { error: imgErr } = await supabase
                    .from("product_images")
                    .insert(rows);
                if (imgErr) throw imgErr;
            }

            // 4) Navigate back to products list
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
                    <h1 className="text-2xl font-semibold">Edit Product</h1>
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
                            onChange={(e) =>
                                setQuantity(e.target.value.replace(/[^\d]/g, ""))
                            }
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

                {/* Existing images */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Current Images</label>
                    {kept.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {kept.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative overflow-hidden rounded-xl border bg-black/5"
                                >
                                    <img
                                        src={img.url}
                                        alt="Product"
                                        className="aspect-square w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs"
                                        onClick={() =>
                                            setKept((prev) => prev.filter((x) => x.id !== img.id))
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-black/60">No existing images.</p>
                    )}
                </div>

                {/* New images */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add New Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const picked = sanitizeFiles(e.target.files);
                            setNewFiles(picked);
                        }}
                    />

                    {newPreviews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {newPreviews.map((src, idx) => (
                                <div
                                    key={src}
                                    className="relative overflow-hidden rounded-xl border bg-black/5"
                                >
                                    <img
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        className="aspect-square w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs"
                                        onClick={() => {
                                            setNewFiles((prev) => prev.filter((_, i) => i !== idx));
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : null}
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
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </main>
    );
}
