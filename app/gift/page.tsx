import { supabase } from '@/utils/supabase/client';
import { GiftClient } from './client';
import { Header } from '@/components/common/Header';
import Link from 'next/link';
import { Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GiftPage() {
    const { data: gifts, error } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase fetch error:', error.message);
    }

    return (
        <main className="min-h-screen bg-white text-gray-900 p-6 md:p-12 relative overflow-hidden">
            <Header />

            {/* Top-left Home Link */}
            <div className="absolute top-8 left-8">
                <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors font-gamja text-xl flex items-center gap-2">
                    <Home size={20} /> Home
                </Link>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex flex-col items-center gap-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-noto font-bold tracking-tight text-gray-900">
                        Gift
                    </h1>
                    <p className="text-gray-500 font-gamja text-xl">
                        축하의 마음을 선물해요🎁
                    </p>
                </header>

                <GiftClient initialGifts={(gifts as any) || []} />
            </div>
        </main>
    );
}
