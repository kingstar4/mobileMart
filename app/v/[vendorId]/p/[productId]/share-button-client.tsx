"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButtonClient({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const text = `Check out: ${title}`;

        if (navigator.share) {
            navigator.share({ title, text, url });
        } else {
            await navigator.clipboard.writeText(`${text} ${url}`);
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
