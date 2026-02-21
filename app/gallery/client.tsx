'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Maximize2, X, Camera, ShieldAlert, Lock, ShieldCheck } from 'lucide-react';
import { Database } from '@/types/database.types';
import { FourCutModal } from '@/components/gallery/FourCutModal';
import { format } from 'date-fns';
import { deletePhoto } from '@/app/actions/gallery';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';

type Photo = Database['public']['Tables']['photos']['Row'] & { publicUrl: string };

export function GalleryClient({ initialPhotos }: { initialPhotos: Photo[] }) {
    const { isAdmin } = useAdmin();
    const router = useRouter();
    const [isFourCutModalOpen, setIsFourCutModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // photoId
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!isDeleting) return;
        setDeleteError(null);
        console.log('[Gallery] Deleting photo:', isDeleting);

        // Find the photo to get its password for admin bypass
        const photoToDelete = initialPhotos.find(p => p.id === isDeleting);
        const passwordToUse = isAdmin ? (photoToDelete?.password || '') : deletePassword;

        console.log('[Gallery] Sending request to server action...');
        const result = await deletePhoto(isDeleting, passwordToUse);

        if (result.error) {
            console.error('[Gallery] Delete error:', result.error);
            setDeleteError(result.error);
            alert(`삭제 실패: ${result.error}\n\n(Supabase SQL Editor에서 정책을 확인해 보세요)`);
        } else {
            console.log('[Gallery] Delete success, refreshing...');
            router.refresh();
            setIsDeleting(null);
            setDeletePassword('');
        }
    };

    return (
        <>
            <div className="flex justify-center sm:justify-end mb-12">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#1a1a1a' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsFourCutModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-manseh text-2xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all border border-white/10"
                >
                    <Camera size={24} className="opacity-80" />
                    인생네컷 찍기
                </motion.button>
            </div>

            {initialPhotos.length === 0 ? (
                <div className="text-center py-24 text-gray-300 font-gamja text-xl border-dashed border-2 border-gray-100 rounded-3xl">
                    아직 공유된 추억이 없어요. 첫 번째 사진을 올려주세요!
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                    {initialPhotos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow cursor-pointer group break-inside-avoid-column"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="relative overflow-hidden rounded-xl aspect-auto">
                                {(photo.is_public || isAdmin) ? (
                                    <div className="relative group/img">
                                        <img
                                            src={photo.publicUrl}
                                            alt={photo.caption || 'Uploaded photo'}
                                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        {!photo.is_public && isAdmin && (
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-500 p-2 rounded-full shadow-lg z-10" title="비공개 (관리자 권한으로 보임)">
                                                <ShieldCheck size={18} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed border-gray-100">
                                        <Lock className="text-gray-300" size={48} />
                                        <div className="space-y-1">
                                            <p className="text-gray-400 font-manseh text-2xl leading-relaxed">
                                                비공개 사진입니다.
                                            </p>
                                            <p className="text-gray-300 font-manseh text-lg">
                                                (승섭이만 볼 수 있어요 🔒)
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    {(photo.is_public || isAdmin) && (
                                        <div
                                            className="bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPhoto(photo);
                                            }}
                                        >
                                            <Maximize2 className="text-black" size={24} />
                                        </div>
                                    )}
                                    <div
                                        className="bg-red-500/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDeleting(photo.id);
                                        }}
                                    >
                                        <Trash2 className="text-white" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 px-1 space-y-1">
                                <div className="font-manseh text-2xl text-gray-900">
                                    - {photo.author_name}
                                </div>
                                {photo.caption && (
                                    <p className="text-xl font-manseh text-gray-500 whitespace-pre-wrap">
                                        {photo.caption}
                                    </p>
                                )}
                                <div className="text-sm text-gray-300 text-right mt-2 font-mono">
                                    {format(new Date(photo.created_at), 'yyyy.MM.dd')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <FourCutModal isOpen={isFourCutModalOpen} onClose={() => setIsFourCutModalOpen(false)} />

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={selectedPhoto.publicUrl}
                        alt={selectedPhoto.caption || 'Full view'}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                    >
                        <X size={32} />
                    </button>

                    {(selectedPhoto.caption || selectedPhoto.author_name) && (
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white p-4 bg-black/50 backdrop-blur-md">
                            <p className="font-jua text-xl">{selectedPhoto.author_name}</p>
                            {selectedPhoto.caption && <p className="font-gamja text-lg opacity-80">{selectedPhoto.caption}</p>}
                        </div>
                    )}
                </div>
            )}
            {/* Delete Verification Modal */}
            <AnimatePresence>
                {isDeleting && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                    <ShieldAlert size={32} />
                                </div>
                                <h3 className="text-3xl font-manseh">사진을 삭제할까요?</h3>
                                <p className="text-gray-500 font-gamja text-xl leading-relaxed">
                                    작업을 수행하려면 업로드할 때 설정한<br />비밀번호를 입력해주세요.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {isAdmin ? (
                                    <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 text-center space-y-2">
                                        <p className="text-amber-600 font-manseh text-xl">관리자 권한</p>
                                        <p className="text-gray-500 font-manseh text-lg leading-relaxed">비밀번호 없이<br />삭제할 수 있습니다.</p>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black outline-none rounded-2xl p-4 text-center text-3xl font-manseh tracking-[1em]"
                                            placeholder="••••"
                                            maxLength={4}
                                            autoFocus
                                        />
                                        {deleteError && (
                                            <p className="text-red-500 text-center font-manseh text-lg">
                                                {deleteError}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleting(null);
                                        setDeletePassword('');
                                        setDeleteError(null);
                                    }}
                                    className="flex-1 py-4 rounded-2xl font-manseh text-2xl border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-4 rounded-2xl font-manseh text-2xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

