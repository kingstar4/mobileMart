import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminHome() {
    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user!;

    const { data: memberships } = await supabase
        .from("vendor_members")
        .select("vendor_id, role")
        .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) redirect("/admin/onboarding");
    if (memberships.length === 1) redirect(`/admin/vendor/${memberships[0].vendor_id}/products`);

    // Multiple vendors: show picker
    const vendorIds = memberships.map(m => m.vendor_id);

    const { data: vendors } = await supabase
        .from("vendors")
        .select("id,name,whatsapp_number")
        .in("id", vendorIds);

    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="text-2xl font-semibold mb-4">Select a Vendor</h1>
            <div className="grid gap-4 sm:grid-cols-2">
                {(vendors ?? []).map(v => (
                    <a key={v.id} href={`/admin/vendor/${v.id}/products`} className="rounded-2xl border bg-white p-5 hover:shadow">
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-sm text-black/60">{v.whatsapp_number}</div>
                    </a>
                ))}
            </div>
        </main>
    );
}
