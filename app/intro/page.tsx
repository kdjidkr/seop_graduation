'use client';

import { useRouter } from 'next/navigation';
import { PokemonBattle } from '@/components/intro/PokemonBattle';
import { motion } from 'framer-motion';
import { MuteButton } from '@/components/common/MuteButton';

export default function IntroPage() {
    const router = useRouter();

    const handleComplete = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('intro_seen', 'true');
            router.push('/');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black"
        >
            <PokemonBattle onComplete={handleComplete} />
            <MuteButton />
        </motion.div>
    );
}
