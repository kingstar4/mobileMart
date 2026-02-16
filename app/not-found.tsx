import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function NotFound() {
  const supabase = await createSupabaseServer();
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar vendors={vendors ?? []} />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sorry, the page you're looking for doesn't exist. Let's get you back on track.
          </p>
          <Link href="/">
            <Button size="lg">Return to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
