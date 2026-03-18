"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/browserClient";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@/lib/country-codes";

const schema = z.object({
    name: z.string().min(2),
    whatsapp_number: z.string().regex(/^\d{6,15}$/), // digits only, local part
});

export default function OnboardingPage() {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const [name, setName] = useState("");
    const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE.dial_code);
    const [whatsapp, setWhatsapp] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <main className="mx-auto max-w-lg p-6">
            <h1 className="text-2xl font-semibold mb-4 text-foreground">Create your store</h1>

            <form
                className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setErr(null);

                    // Strip leading 0 from local number
                    const localNumber = whatsapp.replace(/^0+/, "");
                    const parsed = schema.safeParse({ name, whatsapp_number: localNumber });
                    if (!parsed.success) {
                        setErr("Please enter a valid store name and WhatsApp number (digits only, no leading zero).");
                        return;
                    }

                    setLoading(true);
                    try {
                        const { data: u } = await supabase.auth.getUser();
                        const user = u.user;
                        if (!user) throw new Error("Not logged in");

                        // Store with country code (strip the + from dial_code)
                        const fullNumber = countryCode.replace("+", "") + parsed.data.whatsapp_number;

                        const { data: vendor, error: vErr } = await supabase
                            .from("vendors")
                            .insert({
                                name: parsed.data.name,
                                whatsapp_number: fullNumber,
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
                <input
                    className="w-full rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Store name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Country code + WhatsApp number */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                        <select
                            className="w-[140px] shrink-0 rounded-xl border border-input bg-background text-foreground px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.dial_code}>
                                    {c.flag} {c.dial_code} ({c.code})
                                </option>
                            ))}
                        </select>
                        <input
                            className="flex-1 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. 8105898930"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                            inputMode="tel"
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Enter your number without the leading zero.
                    </p>
                </div>

                {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}
                <button disabled={loading} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold disabled:opacity-60 hover:bg-primary/90 transition-colors">
                    {loading ? "Creating..." : "Create store"}
                </button>
            </form>
        </main>
    );
}
