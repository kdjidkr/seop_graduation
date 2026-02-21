'use client';

import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import Image from 'next/image';

type Letter = Database['public']['Tables']['letters']['Row'];

interface LetterCardProps {
    letter: Letter;
    index: number;
    pokemonName?: string | null;
    onClick: () => void;
}

export function LetterCard({ letter, index, pokemonName, onClick }: LetterCardProps) {
    const displayName = letter.is_public ? letter.author_name : `${pokemonName || '???'}`;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="cursor-pointer relative group flex flex-col items-center"
        >
            <div className="relative w-full aspect-[4/3] drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
                <Image
                    src="/envelop.png"
                    alt="Letter Envelope"
                    fill
                    className="object-contain"
                />
            </div>

            <div className={`mt-4 px-4 py-1.5 rounded-full border border-gray-100 transition-all duration-300 shadow-sm ${letter.is_public
                    ? "bg-gray-50/80 backdrop-blur-sm group-hover:bg-orange-50/50 group-hover:border-orange-200"
                    : "bg-gray-50/50 backdrop-blur-sm border-gray-100 group-hover:bg-gray-100/80 group-hover:border-gray-300"
                }`}>
                <p className={`font-jua text-lg whitespace-nowrap transition-colors ${letter.is_public ? "text-gray-600 group-hover:text-orange-600" : "text-gray-400 group-hover:text-black"
                    }`}>
                    {letter.is_public ? `${displayName} 님` : `${displayName}의 편지 🔒`}
                </p>
            </div>
        </motion.div>
    );
}
