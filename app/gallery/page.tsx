import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import { GalleryClient } from './client';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching photos:', error);
    }

    // Generate public URLs for photos
    const photosWithUrls = (photos as any)?.map((photo: any) => {
        const { data } = supabase.storage.from('photos').getPublicUrl(photo.storage_path);
        return {
            ...photo,
            publicUrl: data.publicUrl
        };
    }) || [];

    return (
        <main className="min-h-screen bg-paper text-brown-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Link href="/" className="text-brown-900/60 hover:text-brown-900 transition-colors font-gamja text-lg">
                            ← 홈으로 돌아가기
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-jua mt-2 text-brown-900">
                            추억 갤러리 📸
                        </h1>
                        <p className="text-brown-900/80 font-gamja text-lg mt-1">
                            승섭이와의 추억을 공유해주세요!
                        </p>
                    </div>
                    {/* Upload Button handled by Client */}
                </header>

                <GalleryClient initialPhotos={photosWithUrls} />
            </div>
        </main>
    );
}
