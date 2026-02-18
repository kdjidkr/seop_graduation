'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '@/app/actions/gallery';
import { cn } from '@/utils/cn';

export function UploadPhotoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    async function handleSubmit(formData: FormData) {
        if (!formData.get('file')) {
            setError('사진을 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await uploadPhoto(formData); // Note: Server Action might need adjustment for file upload if using next-safe-action or similar, but standard FormData works in actions.

        // However, passing File object directly to Server Action in FormData works in Next.js.
        // But we need to make sure the server action imports 'use server' at top.

        setIsSubmitting(false);

        if (result.error) {
            setError(result.error);
        } else {
            onClose();
            setPreviewUrl(null);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className="bg-paper w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8 pointer-events-auto relative border-4 border-brown-50">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-brown-900/50 hover:text-brown-900 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-jua text-brown-900 mb-6 text-center">
                                추억 공유하기 📸
                            </h2>

                            <form action={handleSubmit} className="space-y-4">
                                <div className="flex justify-center">
                                    <label className="cursor-pointer w-full h-48 border-2 border-dashed border-brown-300 rounded-xl flex flex-col items-center justify-center bg-white/50 hover:bg-white transition-colors relative overflow-hidden">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="text-brown-400 mb-2" />
                                                <span className="font-gamja text-brown-900/60">사진 선택 (최대 5MB)</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            name="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            required
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-gamja text-brown-900/70 mb-1">작성자 이름</label>
                                    <input
                                        name="author_name"
                                        required
                                        maxLength={20}
                                        className="w-full bg-white border border-brown-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 font-gamja text-lg"
                                        placeholder="이름을 입력해주세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-gamja text-brown-900/70 mb-1">설명 (선택)</label>
                                    <input
                                        name="caption"
                                        maxLength={50}
                                        className="w-full bg-white border border-brown-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 font-gamja text-lg"
                                        placeholder="사진에 대한 설명"
                                    />
                                </div>

                                {error && (
                                    <div className="text-center text-red-500 text-sm font-gamja">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn(
                                        "w-full bg-brown-900 text-paper rounded-xl py-3 font-jua text-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-brown-800",
                                        isSubmitting && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        "업로드 중..."
                                    ) : (
                                        <>
                                            업로드 <Upload size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
