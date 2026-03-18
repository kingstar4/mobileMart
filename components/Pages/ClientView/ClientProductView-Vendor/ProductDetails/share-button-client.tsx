"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cartbridge.netlify.app";

export function ShareButtonClient({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Build the public URL from the production domain + current path
        const path = typeof window !== "undefined" ? window.location.pathname : "";
        const url = `${SITE_URL}${path}`;
        const text = `Check out: ${title}`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch {
                // User dismissed the share sheet — ignore
            }
        } else {
            // Fallback: copy link to clipboard
            try {
                await navigator.clipboard.writeText(url);
            } catch {
                window.prompt("Copy this link:", url);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
            <Share2 className="h-4 w-4" />
            {copied ? "Link copied!" : "Share"}
        </button>
    );
}

