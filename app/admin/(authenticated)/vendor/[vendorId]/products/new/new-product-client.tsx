"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/browserClient";
import { ThemeToggle } from "@/components/theme-toggle";

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
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Create previews
    React.useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    function addFiles(newFiles: File[]) {
        const sanitized = newFiles.filter((f) => f.type.startsWith("image/"));
        setFiles((prev) => {
            const combined = [...prev, ...sanitized];
            return combined.slice(0, 6); // max 6 images
        });
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

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
                    <p className="text-sm text-muted-foreground">Vendor: {vendorName}</p>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <a
                        href={`/admin/vendor/${vendorId}/products`}
                        className="rounded-xl border px-4 py-2 text-sm"
                    >
                        Back
                    </a>
                </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., iPhone 13 Pro Max"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="min-h-[120px] w-full rounded-xl border border-border bg-background text-foreground px-3 py-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Details, condition, specs, delivery notes..."
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Currency</label>
                        <input
                            className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            placeholder="NGN"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Price</label>
                        <input
                            inputMode="decimal"
                            className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2"
                            value={price}
                            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Quantity</label>
                        <input
                            inputMode="numeric"
                            className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2"
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

                <div className="space-y-3">
                    <label className="text-sm font-medium">Images</label>

                    {/* Hidden native file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                            const picked = sanitizeFiles(e.target.files);
                            addFiles(picked);
                            // Reset so the same file can be re-selected
                            e.target.value = "";
                        }}
                    />

                    {/* Drop zone */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                            group flex w-full flex-col items-center justify-center gap-3
                            rounded-xl border-2 border-dashed px-6 py-10
                            transition-all duration-200 cursor-pointer
                            ${isDragging
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                : "border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50"
                            }
                        `}
                    >
                        {/* Upload icon */}
                        <div className={`
                            flex h-12 w-12 items-center justify-center rounded-full
                            transition-colors duration-200
                            ${isDragging ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"}
                        `}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>

                        <div className="text-center">
                            <p className={`text-sm font-medium ${isDragging ? "text-blue-600" : "text-foreground/70"}`}>
                                {isDragging ? "Drop images here" : "Click to upload or drag & drop"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                PNG, JPG, WEBP up to 6 images
                            </p>
                        </div>
                    </button>

                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {previews.map((src, idx) => (
                                <div key={src} className="group/img relative overflow-hidden rounded-xl border bg-black/5">
                                    <img src={src} alt={`Preview ${idx + 1}`} className="aspect-square w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover/img:bg-black/20" />
                                    <button
                                        type="button"
                                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black/60 opacity-0 shadow-sm transition-all hover:bg-red-500 hover:text-white group-hover/img:opacity-100"
                                        onClick={() => {
                                            setFiles((prev) => prev.filter((_, i) => i !== idx));
                                        }}
                                        title="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
                                        {idx + 1}
                                    </span>
                                </div>
                            ))}

                            {/* Add more button */}
                            {files.length < 6 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <span className="text-[10px] font-medium">Add</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                ) : null}

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-foreground py-3 font-semibold text-background disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save Product"}
                </button>
            </form>
        </main>
    );
}
