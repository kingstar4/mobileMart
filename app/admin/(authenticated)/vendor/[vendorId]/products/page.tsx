import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import ProductsClient from "./products-clients";

type PageProps = {
    params: Promise<{ vendorId: string }>;
    searchParams?: Promise<{ q?: string; status?: string; sort?: string }>;
};

export default async function VendorProductsPage({ params, searchParams }: PageProps) {
    const supabase = await createSupabaseServer();

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) redirect("/admin/login");

    const { vendorId } = await params;

    // Membership check (UX + safety). RLS also protects, but this gives a clean screen.
    const { data: member } = await supabase
        .from("vendor_members")
        .select("role")
        .eq("vendor_id", vendorId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!member) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <h1 className="text-2xl font-semibold">Not authorized</h1>
                <p className="mt-2 text-sm text-black/60">
                    You don't have access to this vendor.
                </p>
            </main>
        );
    }

    // Vendor info
    const { data: vendor, error: vErr } = await supabase
        .from("vendors")
        .select("id,name,whatsapp_number")
        .eq("id", vendorId)
        .single();

    if (vErr || !vendor) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <h1 className="text-2xl font-semibold">Vendor not found</h1>
            </main>
        );
    }

    // Build products query with search/filter/sort
    const resolvedSearchParams = await searchParams;
    const q = (resolvedSearchParams?.q ?? "").trim();
    const status = resolvedSearchParams?.status ?? "all"; // all | active | hidden
    const sort = resolvedSearchParams?.sort ?? "newest";  // newest | price | quantity

    let query = supabase
        .from("products")
        .select(
            `
      id, vendor_id, title, price, currency, quantity, is_active, updated_at,
      product_images ( url, sort_order )
    `
        )
        .eq("vendor_id", vendorId);

    if (q) query = query.ilike("title", `%${q}%`);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "hidden") query = query.eq("is_active", false);

    if (sort === "price") query = query.order("price", { ascending: true });
    else if (sort === "quantity") query = query.order("quantity", { ascending: true });
    else query = query.order("created_at", { ascending: false });

    const { data: products, error: pErr } = await query;

    if (pErr) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <h1 className="text-2xl font-semibold">Error</h1>
                <p className="mt-2 text-sm text-red-600">{pErr.message}</p>
            </main>
        );
    }

    // Normalize images: pick first by sort_order
    const normalized =
        (products ?? []).map((p: any) => {
            const imgs = (p.product_images ?? []).slice().sort(
                (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );
            return { ...p, thumb: imgs[0]?.url ?? null };
        }) ?? [];

    return (
        <ProductsClient
            vendor={vendor}
            role={member.role as "owner" | "admin" | "staff"}
            initialProducts={normalized}
            initialQuery={{ q, status, sort }}
        />
    );
}
