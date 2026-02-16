import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import NewProductClient from "./new-product-client";

export default async function NewProductPage({
    params,
}: {
    params: Promise<{ vendorId: string }>;
}) {
    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (!user) redirect("/admin/login");

    const { vendorId } = await params;

    // verify membership (nice UX; RLS also protects)
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
                    You don’t have access to this vendor.
                </p>
            </main>
        );
    }

    const { data: vendor, error: vErr } = await supabase
        .from("vendors")
        .select("id,name")
        .eq("id", vendorId)
        .single();

    if (vErr || !vendor) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold">Vendor not found</h1>
            </main>
        );
    }

    return <NewProductClient vendorId={vendorId} vendorName={vendor.name} />;
}
