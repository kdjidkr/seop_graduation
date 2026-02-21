'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check } from 'lucide-react';
import { addLetter } from '@/app/actions/guestbook';
import { cn } from '@/utils/cn';

export function WriteLetterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        const result = await addLetter(formData);

        setIsSubmitting(false);

        if (result.error) {
            setError(result.error);
        } else {
            onClose();
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
                        className="fixed inset-0 bg-black/60 z-[110] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[120] p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-lg p-8 md:p-12 shadow-2xl relative pointer-events-auto font-manseh flex flex-col min-h-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <form action={handleSubmit} className="flex-grow flex flex-col">
                                <textarea
                                    name="content"
                                    required
                                    maxLength={500}
                                    placeholder="승섭이에게 하고 싶은 말을 전해주세요..."
                                    className="w-full flex-grow bg-transparent text-2xl md:text-3xl placeholder:text-gray-300 focus:outline-none resize-none leading-relaxed tracking-tight mb-4"
                                />

                                <div className="space-y-3 flex flex-col items-end mt-auto text-xl md:text-2xl text-gray-800">
                                    <div className="flex items-center gap-2 border-b border-gray-200">
                                        <span className="shrink-0">-</span>
                                        <input
                                            name="author_name"
                                            required
                                            maxLength={10}
                                            placeholder="누구"
                                            className="bg-transparent focus:outline-none text-right w-24 md:w-32 py-0.5"
                                        />
                                        <span className="shrink-0 text-gray-500">가 씀!</span>
                                    </div>

                                    <div className="flex items-center gap-2 border-b border-gray-200">
                                        <span className="shrink-0">- 비밀번호</span>
                                        <input
                                            name="password"
                                            required
                                            type="password"
                                            maxLength={4}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="xxxx"
                                            className="bg-transparent focus:outline-none text-center w-16 md:w-20 py-0.5"
                                        />
                                    </div>

                                    <div className="pt-1 w-full flex justify-end">
                                        <div className="flex items-center gap-3 select-none scale-90 origin-right">
                                            <div className="relative w-7 h-7 flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="is_private"
                                                    id="is_private"
                                                    className="peer sr-only"
                                                />
                                                <label
                                                    htmlFor="is_private"
                                                    className="absolute inset-0 border-2 border-gray-800 rounded cursor-pointer transition-all"
                                                ></label>
                                                <span className="absolute text-3xl text-gray-800 opacity-0 peer-checked:opacity-100 transition-opacity transform -rotate-12 translate-y-[-3px] pointer-events-none">
                                                    v
                                                </span>
                                            </div>
                                            <label
                                                htmlFor="is_private"
                                                className="text-xl text-gray-800 cursor-pointer"
                                            >
                                                <span>🔒 승섭이만 보기 (비공개)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -1 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={cn(
                                                "text-2xl text-gray-900 transition-colors hover:text-blue-600 font-manseh outline-none border-b-2 border-transparent hover:border-blue-600",
                                                isSubmitting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isSubmitting ? (
                                                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "보내기"
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 text-center text-red-500 text-lg">
                                        ⚠️ {error}
                                    </div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
