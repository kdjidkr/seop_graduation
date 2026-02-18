'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import { LetterCard } from '@/components/guestbook/LetterCard';
import { WriteLetterModal } from '@/components/guestbook/WriteLetterModal';
import { PenLine } from 'lucide-react';

type Letter = Database['public']['Tables']['letters']['Row'];

export function GuestbookClient({ initialLetters }: { initialLetters: Letter[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex justify-end mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brown-900 text-paper px-6 py-3 rounded-full font-jua text-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <PenLine size={20} />
                    글 남기기
                </motion.button>
            </div>

            {initialLetters.length === 0 ? (
                <div className="text-center py-20 text-brown-900/40 font-gamja text-xl border-dashed border-2 border-brown-200 rounded-3xl">
                    아직 남겨진 글이 없어요. 첫 번째 축하를 남겨주세요!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialLetters.map((letter, index) => (
                        <LetterCard key={letter.id} letter={letter} index={index} />
                    ))}
                </div>
            )}

            <WriteLetterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
