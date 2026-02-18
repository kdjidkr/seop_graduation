'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className="bg-paper w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 pointer-events-auto relative border-4 border-brown-50">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-brown-900/50 hover:text-brown-900 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-jua text-brown-900 mb-6 text-center">
                                축하 메시지 남기기 ✍️
                            </h2>

                            <form action={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-gamja text-brown-900/70 mb-1">작성자 이름</label>
                                    <input
                                        name="author_name"
                                        required
                                        maxLength={20}
                                        className="w-full bg-white border border-brown-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 font-gamja text-lg"
                                        placeholder="친구들이 알 수 있는 닉네임"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-gamja text-brown-900/70 mb-1">내용</label>
                                    <textarea
                                        name="content"
                                        required
                                        rows={4}
                                        maxLength={500}
                                        className="w-full bg-white border border-brown-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 font-gamja text-lg resize-none"
                                        placeholder="승섭이에게 하고 싶은 말을 자유롭게 적어주세요!"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-gamja text-brown-900/70 mb-1">비밀번호 (수정/삭제용)</label>
                                    <input
                                        name="password"
                                        required
                                        type="password"
                                        maxLength={6}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        className="w-full bg-white border border-brown-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 font-mono"
                                        placeholder="숫자 4자리"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_public"
                                        id="is_public"
                                        defaultChecked
                                        className="w-4 h-4 text-brown-900 rounded focus:ring-brown-500"
                                    />
                                    <label htmlFor="is_public" className="text-sm font-gamja text-brown-900/70">
                                        모두에게 공개할래요
                                    </label>
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
                                        "저장 중..."
                                    ) : (
                                        <>
                                            보내기 <Send size={20} />
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
