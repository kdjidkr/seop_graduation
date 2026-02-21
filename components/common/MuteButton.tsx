'use client';

import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

export function MuteButton() {
    const { isMuted, toggleMute } = useAudio();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="fixed bottom-6 right-6 z-[110] bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-orange-100 hover:border-orange-300 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
        >
            <div className="w-6 h-6 flex items-center justify-center text-orange-600">
                <AnimatePresence mode="wait">
                    {isMuted ? (
                        <motion.svg
                            key="muted"
                            initial={{ opacity: 0, rotate: -45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 45 }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="unmuted"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
