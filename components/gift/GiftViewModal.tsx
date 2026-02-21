'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShieldAlert, Calendar, User, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { deleteGift } from '@/app/actions/gift';
import { useAdmin } from '@/context/AdminContext';

type Gift = Database['public']['Tables']['gifts']['Row'];

interface GiftViewModalProps {
    gift: Gift | null;
    pokemonName?: string | null;
    onClose: () => void;
}

export function GiftViewModal({ gift, pokemonName, onClose }: GiftViewModalProps) {
    const { isAdmin } = useAdmin();
    const router = useRouter();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [viewPassword, setViewPassword] = useState('');
    const [viewError, setViewError] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!gift) return null;

    const displayName = gift.is_public ? gift.sender_name : (pokemonName || '???');

    const handleUnlock = () => {
        if (!gift || !viewPassword) return;
        if (gift.password === viewPassword) {
            setIsUnlocked(true);
            setViewPassword('');
            setViewError(null);
        } else {
            setViewError('비밀번호가 틀렸어!');
        }
    };

    const handleDelete = async () => {
        if (!gift || (deletePassword.length !== 4 && !isAdmin)) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            // isAdmin ? gift.password! : deletePassword
            // gift.password is required in schema, so we can safely cast or use fallback
            const finalPassword = isAdmin ? (gift.password ?? '') : deletePassword;
            const result = await deleteGift(gift.id, finalPassword);
            if (result.error) {
                setDeleteError(result.error);
            } else {
                router.refresh();
                onClose();
                setIsConfirmingDelete(false);
                setDeletePassword('');
            }
        } catch (err) {
            setDeleteError('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-lg p-8 md:p-12 shadow-2xl relative font-manseh flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors z-[30]"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex-grow flex flex-col pt-4">
                        {(gift.is_public || isUnlocked || isAdmin) ? (
                            <div className="flex-grow flex flex-col space-y-10">
                                {/* Minimalist Coupon Section */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-gray-400 text-xl tracking-wider flex items-center gap-2">
                                            쿠폰 도착! 🎁
                                            {!gift.is_public && isAdmin && (
                                                <span className="text-amber-500 text-lg flex items-center gap-1">
                                                    (비공개)
                                                </span>
                                            )}
                                        </p>
                                        <h2 className="text-4xl md:text-5xl text-black leading-tight">
                                            {gift.name}
                                        </h2>
                                    </div>

                                    {/* Sender Info */}
                                    <div className="flex items-center gap-2 pt-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                            👤
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">보낸 사람</p>
                                            <p className="text-gray-900 text-xl font-jua">{gift.sender_name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-gray-100 items-end flex flex-col text-2xl md:text-3xl text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 font-manseh text-xl">- 유효기간:</span>
                                            <span className={gift.expires_at ? "text-gray-900" : "text-red-500"}>
                                                {gift.expires_at ? format(new Date(gift.expires_at), 'yyyy.MM.dd') : '영원히!'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Integrated Barcode Section */}
                                <div className="pt-6 flex flex-col items-center space-y-4 opacity-70 group hover:opacity-100 transition-opacity">
                                    <div className="w-full h-10 flex items-end justify-center gap-[0.5px] px-2">
                                        {gift.barcode_number?.split('').flatMap((char, i) => {
                                            const num = parseInt(char);
                                            return [
                                                <div key={`${i}-a`} className="bg-black flex-grow max-w-[2px]" style={{
                                                    width: num % 3 === 0 ? '1.5px' : '0.5px',
                                                    height: (i === 0 || i === 23 || i === 12) ? '100%' : '80%'
                                                }} />,
                                                <div key={`${i}-s`} className="bg-transparent flex-grow max-w-[1.5px]" style={{ width: (num % 2 === 0 ? 1 : 0.5) + 'px' }} />,
                                                <div key={`${i}-b`} className="bg-black flex-grow max-w-[2px]" style={{
                                                    width: (9 - num) % 3 === 0 ? '1px' : '0.5px',
                                                    height: (i === 0 || i === 23 || i === 12) ? '100%' : '80%'
                                                }} />
                                            ];
                                        })}
                                    </div>
                                    <div className="text-xs font-mono tracking-widest text-gray-400">
                                        {gift.barcode_number?.match(/.{1,4}/g)?.join(' ')}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-auto">
                                    <div className="flex flex-col">
                                        <p className="text-gray-400 text-xl font-manseh">
                                            {format(new Date(gift.created_at || new Date()), 'yyyy.MM.dd')} 발급됨
                                        </p>
                                        {!gift.is_public && (
                                            <p className="text-gray-300 text-lg">🔒 승섭이만 보는 선물</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                        title="삭제하기"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-10 py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl animate-bounce">
                                        🎁
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-3xl text-gray-900 leading-snug">
                                            {displayName}님이<br />
                                            선물을 보냈어요!
                                        </h3>
                                        <p className="text-gray-400 text-xl">암호를 입력해서 확인하세요.</p>
                                    </div>
                                </div>
                                <div className="w-full max-w-[240px] space-y-6">
                                    <div className="relative">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={viewPassword}
                                            onChange={(e) => setViewPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                            className="w-full border-b-2 border-gray-200 focus:border-black outline-none px-2 py-2 text-3xl text-center font-manseh tracking-[0.5em]"
                                            autoFocus
                                            placeholder="xxxx"
                                        />
                                        {viewError && (
                                            <p className="mt-4 text-red-500 text-lg flex items-center justify-center gap-1">
                                                ⚠️ {viewError}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleUnlock}
                                        className="w-full bg-black text-white py-3 rounded-lg text-2xl hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation (Simplified) */}
                    <AnimatePresence>
                        {isConfirmingDelete && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute inset-0 bg-white p-10 md:p-14 flex flex-col justify-center items-center text-center space-y-8 z-10"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-3xl text-gray-900 leading-snug">
                                        정말 삭제하시겠어요?
                                    </h3>
                                    <p className="text-xl text-gray-500">
                                        발급 시 설정한 암호를 입력해주세요.
                                    </p>
                                </div>

                                <div className="w-full max-w-[240px] space-y-6">
                                    {isAdmin ? (
                                        <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 text-center space-y-2">
                                            <p className="text-amber-600 font-manseh text-xl">관리자 권한</p>
                                            <p className="text-gray-500 font-manseh text-lg leading-relaxed">비밀번호 없이<br />삭제할 수 있습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={4}
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                                                className="w-full border-b-2 border-gray-200 focus:border-black outline-none px-2 py-2 text-3xl text-center font-manseh tracking-[0.5em]"
                                                autoFocus
                                                placeholder="xxxx"
                                            />
                                            {deleteError && (
                                                <p className="mt-4 text-red-500 text-lg flex items-center justify-center gap-1">
                                                    ⚠️ {deleteError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex-1 bg-black text-white py-2 rounded-lg text-2xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? "..." : "삭제"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsConfirmingDelete(false);
                                                setDeleteError(null);
                                                setDeletePassword('');
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
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
