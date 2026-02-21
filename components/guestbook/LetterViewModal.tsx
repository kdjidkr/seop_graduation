'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { X, Trash2, Check, AlertCircle } from 'lucide-react';
import { deleteLetter } from '@/app/actions/guestbook';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';

type Letter = Database['public']['Tables']['letters']['Row'];

interface LetterViewModalProps {
    letter: Letter | null;
    pokemonName?: string | null;
    onClose: () => void;
}

export function LetterViewModal({ letter, pokemonName, onClose }: LetterViewModalProps) {
    const { isAdmin } = useAdmin();
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false); // For private letters
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayName = letter?.is_public ? letter.author_name : `${pokemonName || '???'}`;

    const handleUnlock = () => {
        if (!letter || !password) return;
        if (letter.password === password) {
            setIsUnlocked(true);
            setPassword('');
            setError(null);
        } else {
            setError('비밀번호가 틀렸습니다!');
        }
    };

    const handleDelete = async () => {
        if (!letter || (!password && !isAdmin)) return;

        setIsDeleting(true);
        setError(null);

        // If admin, use the actual password from the letter object to bypass
        const finalPassword = isAdmin ? letter.password : password;
        const result = await deleteLetter(letter.id, finalPassword);

        setIsDeleting(false);
        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
            handleClose();
        }
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        setIsUnlocked(false);
        setPassword('');
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {letter && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white p-10 md:p-14 shadow-2xl font-manseh flex flex-col max-h-[90vh]"
                    >
                        {/* Control Buttons */}
                        <div className="absolute top-6 right-6 flex items-center gap-4">
                            {!showDeleteConfirm && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-gray-200 hover:text-red-500 transition-colors"
                                    title="글 삭제"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="text-gray-300 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-10">
                            {(!letter.is_public && !isUnlocked && !isAdmin) ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-8 py-10">
                                    <div className="flex flex-col gap-1 items-center">
                                        <p className="text-gray-400 text-xl font-manseh">From.</p>
                                        <h2 className="text-3xl md:text-4xl text-gray-900 flex items-center gap-2">
                                            {displayName}
                                            {!letter.is_public && isAdmin && (
                                                <span className="text-amber-500 text-lg flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    (비공개)
                                                </span>
                                            )}
                                        </h2>
                                    </div>

                                    <div className="w-full max-w-[240px] space-y-4">
                                        <div className="relative">
                                            <input
                                                type="password"
                                                placeholder="비밀번호"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                                className="w-full border-b-2 border-gray-200 focus:border-black outline-none px-2 py-2 text-2xl text-center"
                                                autoFocus
                                            />
                                            {error && !showDeleteConfirm && (
                                                <div className="mt-4 text-red-500 text-lg flex items-center justify-center gap-1">
                                                    <AlertCircle size={16} /> {error}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleUnlock}
                                            className="w-full bg-black text-white py-2 rounded-lg text-2xl hover:bg-gray-800 transition-colors"
                                        >
                                            확인
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-gray-900 text-3xl md:text-4xl leading-relaxed whitespace-pre-wrap">
                                        {letter.content}
                                    </div>

                                    <div className="flex flex-col items-end pt-10 text-2xl md:text-3xl text-gray-700">
                                        <div className="flex items-center gap-2">
                                            - {letter.author_name} 가 씀!
                                            {!letter.is_public && isAdmin && (
                                                <span className="text-amber-500 text-lg flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    (비공개)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xl md:text-2xl text-gray-400 font-mono mt-2">
                                            {format(new Date(letter.created_at || new Date()), 'yyyy.MM.dd')}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Delete Confirmation Overlay */}
                        <AnimatePresence>
                            {showDeleteConfirm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute inset-0 bg-white p-10 md:p-14 flex flex-col justify-center items-center text-center space-y-6 z-10"
                                >
                                    <h3 className="text-3xl text-gray-900 leading-snug">
                                        정말 삭제하시겠어요?
                                    </h3>
                                    <div className="w-full max-w-[240px] space-y-4">
                                        {isAdmin ? (
                                            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 text-center space-y-2">
                                                <p className="text-amber-600 font-manseh text-xl">관리자 권한</p>
                                                <p className="text-gray-500 font-manseh text-lg leading-relaxed">비밀번호 없이<br />삭제할 수 있습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    placeholder="비밀번호"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                                                    className="w-full border-b-2 border-gray-200 focus:border-black outline-none px-2 py-2 text-2xl text-center"
                                                    autoFocus
                                                />
                                                {error && showDeleteConfirm && (
                                                    <div className="mt-4 text-red-500 text-lg flex items-center justify-center gap-1">
                                                        <AlertCircle size={16} /> {error}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex gap-4 pt-4 font-manseh">
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className={cn(
                                                    "flex-1 bg-black text-white py-2 rounded-lg text-2xl hover:bg-gray-800 transition-colors flex items-center justify-center",
                                                    isDeleting && "opacity-50"
                                                )}
                                            >
                                                {isDeleting ? "..." : "삭제"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setError(null);
                                                    setPassword('');
                                                }}
                                                className="flex-1 border-2 border-gray-200 py-2 rounded-lg text-2xl hover:border-black transition-colors"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <img
                            src="/cyndaquil_front.png"
                            alt="Deco"
                            className="absolute -bottom-6 -right-6 w-20 opacity-10 pointer-events-none"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
