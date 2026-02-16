import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AuthenticatedAdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/admin/login");
    return <>{children}</>;
}
