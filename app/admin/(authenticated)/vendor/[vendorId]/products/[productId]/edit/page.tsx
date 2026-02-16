import { redirect, notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import EditProductClient from "./edit-product-client";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ vendorId: string; productId: string }>;
}) {
    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (!user) redirect("/admin/login");

    const { vendorId, productId } = await params;

    // verify membership
    const { data: member } = await supabase
        .from("vendor_members")
        .select("role")
        .eq("vendor_id", vendorId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!member) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold">Not authorized</h1>
                <p className="mt-2 text-sm text-black/60">
                    You don&apos;t have access to this vendor.
                </p>
            </main>
        );
    }

    // fetch vendor name
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, name")
        .eq("id", vendorId)
        .single();

    if (!vendor) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold">Vendor not found</h1>
            </main>
        );
    }

    // fetch product + images
    const { data: product } = await supabase
        .from("products")
        .select(
            `id, vendor_id, title, description, price, currency, quantity, is_active,
       product_images ( id, url, sort_order )`
        )
        .eq("id", productId)
        .eq("vendor_id", vendorId)
        .single();

    if (!product) notFound();

    // sort images
    const existingImages = ((product as any).product_images ?? [])
        .slice()
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img: any) => ({ id: img.id as string, url: img.url as string }));

    return (
        <EditProductClient
            vendorId={vendorId}
            vendorName={vendor.name}
            product={{
                id: product.id,
                title: product.title,
                description: product.description ?? "",
                price: product.price,
                currency: product.currency,
                quantity: product.quantity,
                is_active: product.is_active,
            }}
            existingImages={existingImages}
        />
    );
}
