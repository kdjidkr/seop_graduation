'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    setMuted: (muted: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);

    // Persist mute state
    useEffect(() => {
        const saved = localStorage.getItem('isMuted');
        if (saved === 'true') setIsMuted(true);
    }, []);

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        localStorage.setItem('isMuted', String(newState));
    };

    const setMuted = (muted: boolean) => {
        setIsMuted(muted);
        localStorage.setItem('isMuted', String(muted));
    };

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, setMuted }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
