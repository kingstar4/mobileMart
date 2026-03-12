"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/browserClient";

const schema = z.object({
    name: z.string().min(2),
    whatsapp_number: z.string().regex(/^\d{8,15}$/), // digits only
});

export default function OnboardingPage() {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <main className="mx-auto max-w-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">Create your store</h1>

            <form
                className="rounded-2xl border bg-white p-6 space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setErr(null);

                    const parsed = schema.safeParse({ name, whatsapp_number: whatsapp });
                    if (!parsed.success) {
                        setErr("Please enter a valid store name and WhatsApp number (digits only).");
                        return;
                    }

                    setLoading(true);
                    try {
                        const { data: u } = await supabase.auth.getUser();
                        const user = u.user;
                        if (!user) throw new Error("Not logged in");

                        const { data: vendor, error: vErr } = await supabase
                            .from("vendors")
                            .insert({
                                name: parsed.data.name,
                                whatsapp_number: parsed.data.whatsapp_number,
                                created_by: user.id,
                                owner_user_id: user.id,
                            } as any)
                            .select("id")
                            .single();

                        if (vErr) throw vErr;

                        const { error: mErr } = await supabase
                            .from("vendor_members")
                            .insert({
                                vendor_id: vendor.id,
                                user_id: user.id,
                                role: "owner",
                            });

                        if (mErr) throw mErr;

                        router.push(`/admin/vendor/${vendor.id}/products`);
                        router.refresh();
                    } catch (e: any) {
                        setErr(e.message ?? "Failed");
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                <input className="w-full rounded-xl border px-3 py-2" placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="w-full rounded-xl border px-3 py-2" placeholder="WhatsApp number (digits only)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                {err ? <p className="text-sm text-red-600">{err}</p> : null}
                <button disabled={loading} className="w-full rounded-xl bg-black py-3 text-white font-semibold disabled:opacity-60">
                    {loading ? "Creating..." : "Create store"}
                </button>
            </form>
        </main>
    );
}
