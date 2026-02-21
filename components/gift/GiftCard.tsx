'use client';

import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import Image from 'next/image';

type Gift = Database['public']['Tables']['gifts']['Row'];

interface GiftCardProps {
    gift: Gift;
    index: number;
    pokemonName?: string | null;
    onClick: () => void;
}

export function GiftCard({ gift, index, pokemonName, onClick }: GiftCardProps) {
    const displayName = gift.is_public ? gift.sender_name : (pokemonName || '???');
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="cursor-pointer flex flex-col items-center group"
        >
            <div className="relative w-full aspect-square drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
                <Image
                    src="/pokeball_gift.png"
                    alt="Gift PokeBall"
                    fill
                    className="object-contain"
                />
            </div>
            <div className={`mt-4 px-4 py-1.5 backdrop-blur-sm rounded-full border border-gray-100 transition-all duration-300 shadow-sm ${gift.is_public
                    ? "bg-gray-50/80 group-hover:bg-orange-50/50 group-hover:border-orange-200"
                    : "bg-gray-50/50 group-hover:bg-gray-100/80 group-hover:border-gray-300"
                }`}>
                <p className={`font-jua text-lg whitespace-nowrap transition-colors ${gift.is_public ? "text-gray-600 group-hover:text-orange-600" : "text-gray-400 group-hover:text-black"
                    }`}>
                    {gift.is_public ? `${gift.sender_name}님의 선물` : `${displayName}의 선물 🔒`}
                </p>
            </div>
        </motion.div>
    );
}
