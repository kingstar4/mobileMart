"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browserClient";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { ThemeToggle } from "@/components/theme-toggle";

type Vendor = {
    id: string;
    name: string;
    whatsapp_number: string;
};

/**
 * Try to split a stored international number into { dialCode, localNumber }.
 * e.g. "2348105898930" → { dialCode: "+234", localNumber: "8105898930" }
 */
function splitPhone(full: string): { dialCode: string; localNumber: string } {
    // Sort dial codes longest-first so we match most specific
    const sorted = [...COUNTRY_CODES].sort(
        (a, b) => b.dial_code.length - a.dial_code.length
    );

    const digits = full.replace(/\D/g, "");

    for (const cc of sorted) {
        const prefix = cc.dial_code.replace("+", "");
        if (digits.startsWith(prefix)) {
            return {
                dialCode: cc.dial_code,
                localNumber: digits.slice(prefix.length),
            };
        }
    }

    // Fallback: assume Nigeria (+234) and return the whole thing as local
    return { dialCode: "+234", localNumber: digits };
}

export default function VendorSettingsClient({
    vendor,
    role,
}: {
    vendor: Vendor;
    role: "owner" | "admin" | "staff";
}) {
    const supabase = supabaseBrowser();
    const router = useRouter();

    const initial = splitPhone(vendor.whatsapp_number);

    const [name, setName] = useState(vendor.name);
    const [countryCode, setCountryCode] = useState(initial.dialCode);
    const [localNumber, setLocalNumber] = useState(initial.localNumber);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const canEdit = role === "owner" || role === "admin";

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const trimmedName = name.trim();
        const cleanLocal = localNumber.replace(/^0+/, "").replace(/\D/g, "");

        if (trimmedName.length < 2) {
            setError("Store name must be at least 2 characters.");
            return;
        }
        if (!/^\d{6,15}$/.test(cleanLocal)) {
            setError("Please enter a valid phone number (digits only, 6-15 digits).");
            return;
        }

        const fullNumber = countryCode.replace("+", "") + cleanLocal;

        setSaving(true);
        const { error: upErr } = await supabase
            .from("vendors")
            .update({
                name: trimmedName,
                whatsapp_number: fullNumber,
            })
            .eq("id", vendor.id);

        if (upErr) {
            setError(upErr.message);
        } else {
            setSuccess(true);
            router.refresh();
            // Clear success after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }

        setSaving(false);
    }

    return (
        <main className="mx-auto max-w-2xl p-6">
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Store Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your store details and WhatsApp number.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <a
                        href={`/admin/vendor/${vendor.id}/products`}
                        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                        ← Back to Products
                    </a>
                </div>
            </header>

            <form
                onSubmit={handleSave}
                className="rounded-2xl border border-border bg-card p-6 space-y-5"
            >
                {/* Store name */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Store Name
                    </label>
                    <input
                        className="w-full rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Your store name"
                    />
                </div>

                {/* WhatsApp number */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                        <select
                            className="w-[140px] shrink-0 rounded-xl border border-input bg-background text-foreground px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            disabled={!canEdit}
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.dial_code}>
                                    {c.flag} {c.dial_code} ({c.code})
                                </option>
                            ))}
                        </select>
                        <input
                            className="flex-1 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            placeholder="e.g. 8105898930"
                            value={localNumber}
                            onChange={(e) =>
                                setLocalNumber(e.target.value.replace(/\D/g, ""))
                            }
                            inputMode="tel"
                            disabled={!canEdit}
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Enter your number without the leading zero.
                    </p>
                </div>

                {/* Feedback */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        Settings saved successfully!
                    </div>
                )}

                {/* Actions */}
                {canEdit ? (
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold disabled:opacity-60 hover:bg-primary/90 transition-colors"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">
                        Only owners and admins can edit store settings.
                    </p>
                )}
            </form>
        </main>
    );
}
