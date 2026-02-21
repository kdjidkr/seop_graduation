'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import { LetterCard } from '@/components/guestbook/LetterCard';
import { WriteLetterModal } from '@/components/guestbook/WriteLetterModal';
import { LetterViewModal } from '@/components/guestbook/LetterViewModal';
import Image from 'next/image';
import { useEffect } from 'react';

type Letter = Database['public']['Tables']['letters']['Row'];

interface PokedexEntry {
    id: number;
    name: string;
}

export function GuestbookClient({ initialLetters }: { initialLetters: Letter[] }) {
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [pokedex, setPokedex] = useState<PokedexEntry[]>([]);

    useEffect(() => {
        fetch('/pokedex-korean.json')
            .then(res => res.json())
            .then(data => setPokedex(data))
            .catch(err => console.error('Pokedex load failed:', err));
    }, []);

    const getPokemonName = (letter: Letter) => {
        if (letter.is_public || pokedex.length === 0) return null;
        // Deterministic "random" index based on letter ID string
        let hash = 0;
        for (let i = 0; i < letter.id.length; i++) {
            hash = letter.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % pokedex.length;
        return pokedex[index].name;
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 pb-20">
                {/* 1. Write Letter Button (Always First) */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsWriteModalOpen(true)}
                    className="cursor-pointer flex flex-col items-center group"
                >
                    <div className="relative w-full aspect-[4/3] drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
                        <Image
                            src="/cyndaquil_letter.png"
                            alt="Write a Letter"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="mt-2 text-center text-brown-900 font-jua text-xl group-hover:text-orange-600 transition-colors">
                        편지 쓰기
                    </div>
                </motion.div>

                {/* 2. Existing Letters */}
                {initialLetters.map((letter, index) => (
                    <LetterCard
                        key={letter.id}
                        letter={letter}
                        index={index}
                        pokemonName={getPokemonName(letter)}
                        onClick={() => setSelectedLetter(letter)}
                    />
                ))}
            </div>

            <WriteLetterModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} />
            <LetterViewModal
                letter={selectedLetter}
                pokemonName={selectedLetter ? getPokemonName(selectedLetter) : null}
                onClose={() => setSelectedLetter(null)}
            />
        </>
    );
}
