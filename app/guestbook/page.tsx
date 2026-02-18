import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import { GuestbookClient } from './client';

export const dynamic = 'force-dynamic';

export default async function GuestbookPage() {
    const { data: letters, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching letters:', error);
    }

    return (
        <main className="min-h-screen bg-paper text-brown-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Link href="/" className="text-brown-900/60 hover:text-brown-900 transition-colors font-gamja text-lg">
                            ← 홈으로 돌아가기
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-jua mt-2 text-brown-900">
                            축하의 한마디 📜
                        </h1>
                        <p className="text-brown-900/80 font-gamja text-lg mt-1">
                            졸업을 축하하는 마음을 남겨주세요!
                        </p>
                    </div>

                    {/* Client component will handle the 'Write' button and Modal */}
                </header>

                <GuestbookClient initialLetters={(letters as any) || []} />
            </div>
        </main>
    );
}
