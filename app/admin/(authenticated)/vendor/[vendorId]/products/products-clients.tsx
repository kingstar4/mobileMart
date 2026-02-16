"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browserClient";

type Vendor = {
    id: string;
    name: string;
    whatsapp_number: string;
};

type ProductRow = {
    id: string;
    vendor_id: string;
    title: string;
    price: number;
    currency: string;
    quantity: number;
    is_active: boolean;
    updated_at: string;
    thumb: string | null;
};

function formatMoney(currency: string, price: number) {
    try {
        return `${currency} ${Number(price).toLocaleString()}`;
    } catch {
        return `${currency} ${price}`;
    }
}

export default function ProductsClient({
    vendor,
    role,
    initialProducts,
    initialQuery,
}: {
    vendor: Vendor;
    role: "owner" | "admin" | "staff";
    initialProducts: ProductRow[];
    initialQuery: { q: string; status: string; sort: string };
}) {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const [products, setProducts] = React.useState<ProductRow[]>(initialProducts);
    const [busyId, setBusyId] = React.useState<string | null>(null);

    const [q, setQ] = React.useState(initialQuery.q);
    const [status, setStatus] = React.useState(initialQuery.status);
    const [sort, setSort] = React.useState(initialQuery.sort);

    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    // Update URL query params (so server page re-fetches correctly)
    function applyQuery(next: { q?: string; status?: string; sort?: string }) {
        const params = new URLSearchParams(sp.toString());

        const nq = next.q ?? q;
        const ns = next.status ?? status;
        const nso = next.sort ?? sort;

        if (nq) params.set("q", nq);
        else params.delete("q");

        if (ns && ns !== "all") params.set("status", ns);
        else params.delete("status");

        if (nso && nso !== "newest") params.set("sort", nso);
        else params.delete("sort");

        router.push(`${pathname}?${params.toString()}`);
        router.refresh();
    }

    // Optimistic helpers
    function patchProduct(id: string, patch: Partial<ProductRow>) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }

    async function toggleActive(id: string, nextActive: boolean) {
        setError(null);
        setBusyId(id);

        const prev = products.find((p) => p.id === id);
        patchProduct(id, { is_active: nextActive });

        const { error: upErr } = await supabase
            .from("products")
            .update({ is_active: nextActive })
            .eq("id", id)
            .eq("vendor_id", vendor.id);

        if (upErr) {
            // rollback
            if (prev) patchProduct(id, { is_active: prev.is_active });
            setError(upErr.message);
        } else {
            router.refresh();
        }

        setBusyId(null);
    }

    async function setQuantity(id: string, nextQty: number) {
        setError(null);
        setBusyId(id);

        const safeQty = Number.isFinite(nextQty) ? Math.max(0, Math.floor(nextQty)) : 0;

        const prev = products.find((p) => p.id === id);
        patchProduct(id, { quantity: safeQty });

        const { error: upErr } = await supabase
            .from("products")
            .update({ quantity: safeQty })
            .eq("id", id)
            .eq("vendor_id", vendor.id);

        if (upErr) {
            // rollback
            if (prev) patchProduct(id, { quantity: prev.quantity });
            setError(upErr.message);
        } else {
            router.refresh();
        }

        setBusyId(null);
    }

    async function deleteProduct(id: string) {
        setError(null);
        setBusyId(id);

        // Optimistic remove
        const prev = products;
        setProducts((p) => p.filter((x) => x.id !== id));

        const { error: delErr } = await supabase
            .from("products")
            .delete()
            .eq("id", id)
            .eq("vendor_id", vendor.id);

        if (delErr) {
            setProducts(prev); // rollback
            setError(delErr.message);
        } else {
            router.refresh();
        }

        setBusyId(null);
        setDeleteId(null);
    }

    const canDelete = role === "owner" || role === "admin";

    return (
        <main className="mx-auto max-w-6xl p-6">
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{vendor.name}</h1>
                    <p className="text-sm text-black/60">
                        WhatsApp: {vendor.whatsapp_number} • Role: {role}
                    </p>
                </div>

                <div className="flex gap-2">
                    <a
                        href={`/v/${vendor.id}`}
                        className="rounded-xl border px-4 py-2 text-sm"
                    >
                        View Storefront
                    </a>
                    <a
                        href={`/admin/vendor/${vendor.id}/products/new`}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                        + Add Product
                    </a>
                </div>
            </header>

            {/* Toolbar */}
            <section className="mb-4 grid gap-3 sm:grid-cols-3">
                <input
                    className="w-full rounded-xl border px-3 py-2"
                    placeholder="Search products by title..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") applyQuery({ q });
                    }}
                />

                <select
                    className="w-full rounded-xl border px-3 py-2"
                    value={status}
                    onChange={(e) => {
                        const v = e.target.value;
                        setStatus(v);
                        applyQuery({ status: v });
                    }}
                >
                    <option value="all">All</option>
                    <option value="active">Active only</option>
                    <option value="hidden">Hidden only</option>
                </select>

                <select
                    className="w-full rounded-xl border px-3 py-2"
                    value={sort}
                    onChange={(e) => {
                        const v = e.target.value;
                        setSort(v);
                        applyQuery({ sort: v });
                    }}
                >
                    <option value="newest">Newest</option>
                    <option value="price">Price (low → high)</option>
                    <option value="quantity">Quantity (low → high)</option>
                </select>
            </section>

            <div className="mb-6 flex gap-2">
                <button
                    className="rounded-xl border px-3 py-2 text-sm"
                    onClick={() => applyQuery({ q })}
                >
                    Apply search
                </button>
                <button
                    className="rounded-xl border px-3 py-2 text-sm"
                    onClick={() => {
                        setQ("");
                        setStatus("all");
                        setSort("newest");
                        router.push(pathname);
                        router.refresh();
                    }}
                >
                    Reset
                </button>
            </div>

            {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border bg-white sm:block">
                <table className="w-full text-sm">
                    <thead className="bg-black/5">
                        <tr>
                            <th className="p-3 text-left font-semibold">Product</th>
                            <th className="p-3 text-left font-semibold">Price</th>
                            <th className="p-3 text-left font-semibold">Quantity</th>
                            <th className="p-3 text-left font-semibold">Status</th>
                            <th className="p-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-black/5">
                                            {p.thumb ? (
                                                <img src={p.thumb} alt={p.title} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                        <div>
                                            <div className="font-medium">{p.title}</div>
                                            <div className="text-xs text-black/50" suppressHydrationWarning>
                                                Updated: {new Date(p.updated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-3">{formatMoney(p.currency, p.price)}</td>

                                <td className="p-3">
                                    <QuantityControl
                                        value={p.quantity}
                                        disabled={busyId === p.id}
                                        onChange={(val) => setQuantity(p.id, val)}
                                    />
                                </td>

                                <td className="p-3">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={p.is_active}
                                            disabled={busyId === p.id}
                                            onChange={(e) => toggleActive(p.id, e.target.checked)}
                                        />
                                        <span className={`text-xs font-semibold ${p.is_active ? "text-green-700" : "text-black/60"}`}>
                                            {p.is_active ? "Active" : "Hidden"}
                                        </span>
                                    </label>
                                </td>

                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <a
                                            href={`/admin/vendor/${vendor.id}/products/${p.id}/edit`}
                                            className="rounded-xl border px-3 py-2"
                                        >
                                            Edit
                                        </a>

                                        <button
                                            disabled={!canDelete || busyId === p.id}
                                            className="rounded-xl border px-3 py-2 text-red-600 disabled:opacity-50"
                                            onClick={() => setDeleteId(p.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {products.length === 0 ? (
                            <tr>
                                <td className="p-6 text-center text-black/60" colSpan={5}>
                                    No products found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
                {products.map((p) => (
                    <div key={p.id} className="rounded-2xl border bg-white p-4">
                        <div className="flex gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-xl bg-black/5">
                                {p.thumb ? (
                                    <img src={p.thumb} alt={p.title} className="h-full w-full object-cover" />
                                ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold line-clamp-1">{p.title}</div>
                                <div className="text-sm">{formatMoney(p.currency, p.price)}</div>
                                <div className="text-xs text-black/50" suppressHydrationWarning>
                                    Updated: {new Date(p.updated_at).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-black/60">Quantity</span>
                                <QuantityControl
                                    value={p.quantity}
                                    disabled={busyId === p.id}
                                    onChange={(val) => setQuantity(p.id, val)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-black/60">Visible</span>
                                <input
                                    type="checkbox"
                                    checked={p.is_active}
                                    disabled={busyId === p.id}
                                    onChange={(e) => toggleActive(p.id, e.target.checked)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <a
                                    href={`/admin/vendor/${vendor.id}/products/${p.id}/edit`}
                                    className="flex-1 rounded-xl border px-3 py-2 text-center"
                                >
                                    Edit
                                </a>
                                <button
                                    disabled={!canDelete || busyId === p.id}
                                    className="flex-1 rounded-xl border px-3 py-2 text-red-600 disabled:opacity-50"
                                    onClick={() => setDeleteId(p.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-6 text-center text-black/60">
                        No products found.
                    </div>
                ) : null}
            </div>

            {/* Delete confirm modal */}
            {deleteId ? (
                <ConfirmDialog
                    title="Delete product?"
                    description="This will permanently delete the product (and its images rows)."
                    onCancel={() => setDeleteId(null)}
                    onConfirm={() => deleteProduct(deleteId)}
                    loading={busyId === deleteId}
                    confirmText="Delete"
                />
            ) : null}
        </main>
    );
}

function QuantityControl({
    value,
    disabled,
    onChange,
}: {
    value: number;
    disabled?: boolean;
    onChange: (next: number) => void;
}) {
    const [draft, setDraft] = React.useState<string>(String(value));

    React.useEffect(() => {
        setDraft(String(value));
    }, [value]);

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={disabled}
                className="h-9 w-9 rounded-xl border disabled:opacity-50"
                onClick={() => onChange(Math.max(0, value - 1))}
            >
                −
            </button>

            <input
                inputMode="numeric"
                disabled={disabled}
                className="h-9 w-20 rounded-xl border px-2 text-center disabled:opacity-50"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
                onBlur={() => {
                    const n = draft === "" ? 0 : Math.max(0, parseInt(draft, 10));
                    onChange(n);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const n = draft === "" ? 0 : Math.max(0, parseInt(draft, 10));
                        onChange(n);
                    }
                }}
            />

            <button
                type="button"
                disabled={disabled}
                className="h-9 w-9 rounded-xl border disabled:opacity-50"
                onClick={() => onChange(value + 1)}
            >
                +
            </button>
        </div>
    );
}

function ConfirmDialog({
    title,
    description,
    confirmText,
    onCancel,
    onConfirm,
    loading,
}: {
    title: string;
    description: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow">
                <div className="text-lg font-semibold">{title}</div>
                <p className="mt-1 text-sm text-black/60">{description}</p>

                <div className="mt-4 flex gap-2">
                    <button
                        className="flex-1 rounded-xl border px-4 py-2"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
