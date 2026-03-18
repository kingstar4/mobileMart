import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import VendorSettingsClient from "./vendor-settings-client";

type PageProps = {
    params: Promise<{ vendorId: string }>;
};

export default async function VendorSettingsPage({ params }: PageProps) {
    const supabase = await createSupabaseServer();

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) redirect("/admin/login");

    const { vendorId } = await params;

    // Check membership
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
                <p className="mt-2 text-sm text-muted-foreground">
                    You don&apos;t have access to this vendor.
                </p>
            </main>
        );
    }

    // Fetch vendor
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

    return (
        <VendorSettingsClient
            vendor={vendor}
            role={member.role as "owner" | "admin" | "staff"}
        />
    );
}
