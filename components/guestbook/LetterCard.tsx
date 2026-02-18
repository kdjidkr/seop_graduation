'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Database } from '@/types/database.types';

type Letter = Database['public']['Tables']['letters']['Row'];

export function LetterCard({ letter, index }: { letter: Letter; index: number }) {
    // Random rotation for sticky note feel
    const rotation = index % 2 === 0 ? 1 : -1;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, rotate: 0 }}
            className={`bg-yellow-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform rotate-${rotation} relative min-h-[200px] flex flex-col justify-between bordered-brown-50`}
            style={{
                transform: `rotate(${rotation}deg)`,
            }}
        >
            {/* Tape effect */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-white/40 rotate-1 shadow-sm backdrop-blur-sm"></div>

            <div className="font-gamja text-lg text-brown-900 leading-relaxed whitespace-pre-wrap">
                {letter.content}
            </div>

            <div className="mt-4 flex justify-between items-end border-t border-brown-900/10 pt-2">
                <div className="font-jua text-brown-900 text-lg">
                    - {letter.author_name}
                </div>
                <div className="text-xs text-brown-900/40 font-mono">
                    {format(new Date(letter.created_at), 'yy.MM.dd')}
                </div>
            </div>
        </motion.div>
    );
}
