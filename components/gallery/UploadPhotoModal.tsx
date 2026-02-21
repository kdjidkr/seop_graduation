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
                        className="fixed inset-0 bg-black/60 z-[130] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[140] pointer-events-none p-4"
                    >
                        <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl pointer-events-auto relative font-manseh max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-4xl text-gray-900 mb-8 text-center">
                                추억 공유하기 📸
                            </h2>

                            <form action={handleSubmit} className="space-y-6">
                                <div className="flex justify-center">
                                    <label className="cursor-pointer w-full h-56 border-2 border-dashed border-gray-200 hover:border-black rounded-xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white transition-all relative overflow-hidden group">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImageIcon size={40} className="text-gray-300 group-hover:text-black transition-colors mb-2" />
                                                <span className="text-xl text-gray-400 group-hover:text-black transition-colors">사진을 선택해주세요</span>
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

                                <div className="space-y-4 flex flex-col items-end">
                                    <div className="flex items-center gap-2 border-b border-gray-200 w-full">
                                        <span className="shrink-0 text-xl text-gray-400">- 이름</span>
                                        <input
                                            name="author_name"
                                            required
                                            maxLength={20}
                                            className="w-full bg-transparent px-2 py-2 focus:outline-none text-2xl text-right"
                                            placeholder="누구"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 border-b border-gray-200 w-full">
                                        <span className="shrink-0 text-xl text-gray-400">- 한줄평</span>
                                        <input
                                            name="caption"
                                            maxLength={50}
                                            className="w-full bg-transparent px-2 py-2 focus:outline-none text-2xl text-right"
                                            placeholder="사진에 대한 추억..."
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-center text-red-500 text-lg">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={cn(
                                            "w-full text-4xl text-gray-900 transition-colors hover:text-blue-600",
                                            isSubmitting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : (
                                            "업로드하기"
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
