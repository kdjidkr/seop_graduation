'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import Image from 'next/image';
import { IssueGiftModal } from '@/components/gift/IssueGiftModal';
import { GiftCard } from '@/components/gift/GiftCard';
import { GiftViewModal } from '@/components/gift/GiftViewModal';

type Gift = Database['public']['Tables']['gifts']['Row'];

interface PokedexEntry {
    id: number;
    name: string;
}

export function GiftClient({ initialGifts }: { initialGifts: Gift[] }) {
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [pokedex, setPokedex] = useState<PokedexEntry[]>([]);

    useEffect(() => {
        fetch('/pokedex-korean.json')
            .then(res => res.json())
            .then(data => setPokedex(data))
            .catch(err => console.error('Pokedex load failed:', err));
    }, []);

    const getPokemonName = (gift: Gift) => {
        if (gift.is_public || pokedex.length === 0) return null;
        // Deterministic "random" index based on gift ID string
        let hash = 0;
        for (let i = 0; i < gift.id.length; i++) {
            hash = gift.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % pokedex.length;
        return pokedex[index].name;
    };

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 pb-20 max-w-5xl mx-auto items-center">
                {/* 1. Issue Gift Button (Cyndaquil) */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsIssueModalOpen(true)}
                    className="cursor-pointer flex flex-col items-center group lg:col-span-1"
                >
                    <div className="relative w-full aspect-[4/3] drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
                        <Image
                            src="/cyndaquil_gift.png"
                            alt="Issue a Gift"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                    <div className="mt-2 text-center text-gray-900 font-jua text-xl group-hover:text-blue-600 transition-colors">
                        쿠폰 발급하기
                    </div>
                </motion.div>

                {/* 2. Existing Gifts (PokeBalls) */}
                {initialGifts.map((gift, index) => (
                    <GiftCard
                        key={gift.id}
                        gift={gift}
                        index={index}
                        pokemonName={getPokemonName(gift)}
                        onClick={() => setSelectedGift(gift)}
                    />
                ))}
            </div>

            <IssueGiftModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} />
            <GiftViewModal
                gift={selectedGift}
                pokemonName={selectedGift ? getPokemonName(selectedGift) : null}
                onClose={() => setSelectedGift(null)}
            />
        </>
    );
}
