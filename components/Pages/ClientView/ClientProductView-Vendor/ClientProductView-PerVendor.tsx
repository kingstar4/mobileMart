import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import VendorStoreClient from "./VendorStoreClient";

type VendorStoreProps = {
    params: Promise<{ vendorId: string }>;
};

export default async function VendorStorePage({ params }: VendorStoreProps) {
    const supabase = await createSupabaseServer();
    const { vendorId } = await params;

    // Fetch vendor
    const { data: vendor, error: vErr } = await supabase
        .from("vendors")
        .select("id, name, whatsapp_number")
        .eq("id", vendorId)
        .single();

    if (vErr || !vendor) notFound();

    // Fetch all active products (filtering & sorting handled client-side)
    const { data: products } = await supabase
        .from("products")
        .select(
            `id, vendor_id, title, price, currency, quantity, is_active, created_at,
       product_images ( url, sort_order )`
        )
        .eq("vendor_id", vendorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    // Normalize: pick first image
    const items = (products ?? []).map((p: any) => {
        const imgs = (p.product_images ?? [])
            .slice()
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        return {
            id: p.id,
            title: p.title,
            price: p.price,
            currency: p.currency,
            quantity: p.quantity,
            created_at: p.created_at,
            thumb: imgs[0]?.url ?? null,
        };
    });

    return <VendorStoreClient vendor={vendor} products={items} />;
}
