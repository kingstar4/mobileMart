import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const supabaseBrowser = () => {
    if (client) return client;

    client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return client;
};
