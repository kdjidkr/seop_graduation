'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Ticket, Lock, Gift } from 'lucide-react';
import { createGift } from '@/app/actions/gift';
import { addDays, format } from 'date-fns';

interface IssueGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function IssueGiftModal({ isOpen, onClose }: IssueGiftModalProps) {
    const [name, setName] = useState('');
    const [senderName, setSenderName] = useState('');
    const [password, setPassword] = useState('');
    const [daysValid, setDaysValid] = useState('365');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Generate a random 24-digit barcode number
        const barcodeNumber = Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join('');
        const expiresAt = daysValid === 'forever' ? null : addDays(new Date(), parseInt(daysValid)).toISOString();

        try {
            const result = await createGift({
                name,
                sender_name: senderName,
                password,
                expires_at: expiresAt,
                barcode_number: barcodeNumber,
                is_public: !isPrivate,
            });

            if (result.error) {
                setError(result.error);
            } else {
                onClose();
                setName('');
                setSenderName('');
                setPassword('');
                setIsPrivate(false);
            }
        } catch (err) {
            setError('요청 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-lg p-8 md:p-12 shadow-2xl relative font-manseh flex flex-col min-h-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors z-[30]"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-grow flex flex-col pt-4">
                            <h3 className="text-4xl text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                                쿠폰 발급하기 🎁
                            </h3>

                            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                                <textarea
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    maxLength={100}
                                    placeholder="승섭이에게 줄 쿠폰 내용을 적어주세요... (예: 맛있는 저녁 사주기, 고분고분하게 롤 듀오 해주기)"
                                    className="w-full flex-grow bg-transparent text-2xl md:text-3xl placeholder:text-gray-300 focus:outline-none resize-none leading-relaxed tracking-tight mb-8"
                                />

                                <div className="space-y-4 flex flex-col items-end mt-auto text-xl md:text-2xl text-gray-800">
                                    <div className="flex items-center gap-2 border-b border-gray-200 w-full justify-end">
                                        <span className="shrink-0 text-gray-400">발급처:</span>
                                        <input
                                            value={senderName}
                                            onChange={(e) => setSenderName(e.target.value)}
                                            required
                                            maxLength={10}
                                            placeholder="누구"
                                            className="bg-transparent focus:outline-none text-right w-32 md:w-40 py-1"
                                        />
                                        <span className="shrink-0 text-gray-500">가 발급함!</span>
                                    </div>

                                    <div className="flex items-center gap-4 w-full justify-end">
                                        <div className="flex items-center gap-2 border-b border-gray-200">
                                            <span className="shrink-0 text-gray-400">유효기간:</span>
                                            <select
                                                value={daysValid}
                                                onChange={(e) => setDaysValid(e.target.value)}
                                                className="bg-transparent focus:outline-none text-center py-1 cursor-pointer appearance-none px-2"
                                            >
                                                <option value="7">1주일</option>
                                                <option value="30">1개월</option>
                                                <option value="365">1년</option>
                                                <option value="forever">영원히</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 border-b border-gray-200">
                                            <span className="shrink-0 text-gray-400">비밀번호:</span>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={4}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-transparent focus:outline-none text-center w-16 md:w-20 py-1"
                                                placeholder="xxxx"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Private Option */}
                                    <div className="pt-2 w-full flex justify-end">
                                        <div className="flex items-center gap-3 select-none scale-90 origin-right cursor-pointer group">
                                            <div className="relative w-7 h-7 flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_private_gift"
                                                    checked={isPrivate}
                                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                                    className="peer sr-only"
                                                />
                                                <label
                                                    htmlFor="is_private_gift"
                                                    className="absolute inset-0 border-2 border-gray-800 rounded cursor-pointer transition-all group-hover:border-black peer-checked:bg-gray-800/10"
                                                ></label>
                                                <span className="absolute text-3xl text-gray-800 opacity-0 peer-checked:opacity-100 transition-opacity transform -rotate-12 translate-y-[-3px] pointer-events-none">
                                                    v
                                                </span>
                                            </div>
                                            <label
                                                htmlFor="is_private_gift"
                                                className="text-xl text-gray-800 cursor-pointer group-hover:text-black"
                                            >
                                                🔒 승섭이만 보기 (비공개)
                                            </label>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-right text-lg">
                                            ⚠️ {error}
                                        </p>
                                    )}

                                    <div className="pt-4 w-full">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full text-3xl text-gray-900 transition-colors hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 py-2 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "쿠폰 발급하기"
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
