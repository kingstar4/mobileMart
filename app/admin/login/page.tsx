"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browserClient";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    // If the user is already logged in, redirect to /admin immediately
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                router.replace("/admin");
            } else {
                setChecking(false);
            }
        });
    }, []);

    async function signInWithGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    }

    if (checking) {
        return (
            <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
                <p className="text-black/60">Checking session...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
            <div className="w-full space-y-4 rounded-2xl border bg-white p-6">
                <h1 className="text-xl font-semibold">Admin Login</h1>

                <button
                    onClick={signInWithGoogle}
                    className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white"
                >
                    Continue with Google
                </button>

                <p className="text-xs text-black/60">
                    Only approved vendor admins can access the dashboard.
                </p>
            </div>
        </main>
    );
}
