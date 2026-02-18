'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Image from 'next/image';

type BattleState =
    | 'ENCOUNTER' // Wild Hanyang appeared!
    | 'TRAINER_APPEAR' // Ash slides in
    | 'TRAINER_THROW' // Ash throws ball
    | 'SEND_OUT'  // Go! Cyndaquil!
    | 'MENU'      // Fight/Bag/Run
    | 'ATTACK'    // Cyndaquil used Ember!
    | 'DAMAGE'    // Hanyang took damage!
    | 'VICTORY'   // Hanyang fainted!
    | 'EXP_GAIN'  // Cyndaquil gained XP!
    | 'LEVEL_UP'  // Cyndaquil grew to Lv. 27!
    | 'EVOLUTION' // Evolution sequence
    | 'EVOLVED'   // Finished evolution
    | 'FINISHED'; // Transition to main site

export function PokemonBattle({ onComplete }: { onComplete: () => void }) {
    const [mounted, setMounted] = useState(false);
    const [battleState, setBattleState] = useState<BattleState>('ENCOUNTER');

    // State for sequence control
    const [dialogText, setDialogText] = useState('');
    const [showDialogArrow, setShowDialogArrow] = useState(false);
    const [scriptActive, setScriptActive] = useState(true); // To prevent async updates if unmounted/skipped
    const [evolutionPhase, setEvolutionPhase] = useState<'intro' | 'idle' | 'flash' | 'evolved'>('intro');
    const [showSparkles, setShowSparkles] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [cyndaquilLevel, setCyndaquilLevel] = useState(20);
    const [expPercent, setExpPercent] = useState(80); // Initial EXP
    const [hanyangOpacity, setHanyangOpacity] = useState(1);
    const [flash, setFlash] = useState(false);

    // Animation States
    const [trainerVisible, setTrainerVisible] = useState(false);
    const [trainerThrowing, setTrainerThrowing] = useState(false);
    const [pokeballThrown, setPokeballThrown] = useState(false);
    const [pokeballLanded, setPokeballLanded] = useState(false);
    const [fireBallThrown, setFireBallThrown] = useState(false);
    const [hanyangHit, setHanyangHit] = useState(false);
    const [imgVersion, setImgVersion] = useState('');

    useEffect(() => {
        setImgVersion(Date.now().toString());
    }, []);

    // HP Stats
    const maxHp = 50;
    const [hanyangHp, setHanyangHp] = useState(maxHp);

    // Typewriter effect helper
    const typeText = async (text: string, delay = 50) => {
        setDialogText('');
        setShowDialogArrow(false);
        for (let i = 0; i < text.length; i++) {
            setDialogText((prev) => prev + text[i]);
            await new Promise((r) => setTimeout(r, delay));
        }
        setShowDialogArrow(true);
    };

    const [hasInteracted, setHasInteracted] = useState(false);
    const [isLeveling, setIsLeveling] = useState(false);
    const [clickRipple, setClickRipple] = useState<{ x: number, y: number, id: number } | null>(null);

    // Audio Refs
    useEffect(() => {
        if (!mounted) return;

        // Preload sounds
        const bgm = new Audio('/sounds/battle_sound.mp3');
        bgm.loop = true;
        bgm.volume = 0.4;

        // Expose to window or state if needed, or just control here
        (window as any).battleBgm = bgm;

        return () => {
            bgm.pause();
            bgm.currentTime = 0;
        };
    }, [mounted]);

    // Helper to play SFX
    const playSfx = (filename: string) => {
        const audio = new Audio(`/sounds/${filename}`);
        audio.volume = 0.6;
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    // Sequence Logic
    useEffect(() => {
        let scriptActive = true;

        const runSequence = async () => {
            // Small initial delay
            if (battleState === 'ENCOUNTER') {
                // Try to start BGM immediately (might be blocked by browser)
                const bgm = (window as any).battleBgm;
                if (bgm && bgm.paused) {
                    bgm.play().catch(() => console.log("Autoplay blocked"));
                }

                await new Promise((r) => setTimeout(r, 500));
                if (scriptActive) await typeText('야생의 하냥이가 나타났다!');
                // Wait for user click to proceed from ENCOUNTER
            }
            else if (battleState === 'TRAINER_APPEAR') {
                setDialogText('');
                setShowDialogArrow(false);
                setTrainerVisible(true);
                // Trainer slides in
                await new Promise((r) => setTimeout(r, 1000));
                if (scriptActive) setBattleState('TRAINER_THROW');
            }
            else if (battleState === 'TRAINER_THROW') {
                setTrainerThrowing(true); // Triggers Sprite Animation

                // Wait for wind-up (approx 3 frames at 100ms each = 300ms)
                await new Promise((r) => setTimeout(r, 400));

                if (scriptActive) {
                    setPokeballThrown(true); // Ball flies
                    // Ball flight time
                    await new Promise((r) => setTimeout(r, 600));
                }

                if (scriptActive) {
                    setPokeballLanded(true); // Ball hits ground/poof
                    // Flash effect for spawn
                    setFlash(true);
                    setTimeout(() => setFlash(false), 200);

                    // Hide Trainer & Ball, Show Cyndaquil
                    setTrainerVisible(false);
                    setPokeballThrown(false);
                    setBattleState('SEND_OUT');
                }
            }
            else if (battleState === 'SEND_OUT') {
                playSfx('cyndaquil_sound.mp3'); // Cry
                if (scriptActive) await typeText('가라! 섭승이!');
            }
            else if (battleState === 'MENU') {
                // Menu does not auto-advance
            }
            else if (battleState === 'ATTACK') {
                if (scriptActive) await typeText('섭승이! 불꽃세례!');

                await new Promise((r) => setTimeout(r, 500));
                playSfx('fire_attack.ogg'); // Attack Sound
                setFireBallThrown(true);

                // Flight time
                await new Promise((r) => setTimeout(r, 600));

                // Hit Effect
                setFireBallThrown(false);
                playSfx('damage.mpeg'); // Hit Sound
                setHanyangHit(true); // Turns Red

                // Screen Flash for Impact
                setFlash(true);
                setTimeout(() => setFlash(false), 100);

                await new Promise((r) => setTimeout(r, 200)); // Hold red for a moment
                setHanyangHit(false);

                await new Promise((r) => setTimeout(r, 500));
                if (scriptActive) setBattleState('DAMAGE');
            }
            else if (battleState === 'DAMAGE') {
                // Hanyang takes damage
                setHanyangHp(0);
                if (scriptActive) await typeText('효과는 굉장했다!');
                await new Promise((r) => setTimeout(r, 500));
                if (scriptActive) setBattleState('VICTORY');
            }
            else if (battleState === 'VICTORY') {
                // Faint animation
                playSfx('hanyang_sound.mp3'); // Death Cry
                if (scriptActive) await typeText('컴공 하냥이는 쓰러졌다!');

                // Fade out gradually (User Request)
                setHanyangOpacity(0);

                await new Promise((r) => setTimeout(r, 1000));
                if (scriptActive) setBattleState('EXP_GAIN');
            }
            else if (battleState === 'EXP_GAIN') {
                if (scriptActive) await typeText('섭승이는 경험치를 획득했다!');
                await new Promise((r) => setTimeout(r, 1000));
                if (scriptActive) setBattleState('LEVEL_UP');
            }
            else if (battleState === 'LEVEL_UP') {
                setIsLeveling(true); // Block input

                // Sequential Level Up Animation with EXP Bar Fill
                for (let i = 21; i <= 27; i++) {
                    if (!scriptActive) break;

                    // 1. Reset Bar to 0% (Instant)
                    setExpPercent(0);
                    await new Promise((r) => setTimeout(r, 50));

                    // 2. Fill Bar to 100% (Animated)
                    setExpPercent(100);
                    await new Promise((r) => setTimeout(r, 800)); // Wait for fill animation

                    // 3. Pause for 1s with FULL BAR
                    await new Promise((r) => setTimeout(r, 1000));

                    // 4. Level Up Number Update & Sound (Restored per request)
                    setCyndaquilLevel(i);
                    playSfx('levelup.mp3');

                    // Small pause before next loop reset
                    await new Promise((r) => setTimeout(r, 200));
                }
                setIsLeveling(false); // Unblock input

                // Pause BGM during transition (User Request)
                const bgm = (window as any).battleBgm;
                if (bgm && !bgm.paused) {
                    bgm.pause();
                }

                // Wait 3 seconds before transition (User Request)
                await new Promise((r) => setTimeout(r, 3000));

                if (scriptActive) setBattleState('EVOLUTION');
            }
            // NEW: Evolution Sequence
            else if (battleState === 'EVOLUTION') {
                setIsLeveling(true); // Re-use to block input 

                // 1. Black Screen Transition (2s)
                setEvolutionPhase('intro');
                setDialogText(''); // Clear text
                await new Promise((r) => setTimeout(r, 2000));

                // 2. Reveal Scene (Wait a moment)
                setEvolutionPhase('idle');
                await new Promise((r) => setTimeout(r, 1000));

                // 3. Suspense Text
                if (scriptActive) await typeText('오잉? 섭승이의 모습이?');
                await new Promise((r) => setTimeout(r, 1000)); // Suspense wait

                // 4. Evolution Animation Start
                // Pause BGM if playing
                const bgm = (window as any).battleBgm;
                if (bgm && !bgm.paused) {
                    bgm.pause();
                }

                setEvolutionPhase('flash');
                playSfx('pokemon-evolution-sound-effect.mp3'); // Evolution BGM (Long ~20s)

                // Wait 14s then trigger Sparkles
                await new Promise((r) => setTimeout(r, 14000));
                setShowSparkles(true);

                // Wait remaining 4s (Total 18s) - 1s faster swap than before
                await new Promise((r) => setTimeout(r, 4000));

                // Swap in Evolved Form
                setEvolutionPhase('evolved');
                setShowSparkles(false); // Stop sparkles logic (or keep for celebration?)

                // Wait a moment for the reveal (1s faster text)
                await new Promise((r) => setTimeout(r, 1000));

                if (scriptActive) {
                    setIsLeveling(false);
                    setBattleState('EVOLVED');
                }
            }
            else if (battleState === 'EVOLVED') {
                // playSfx('levelup.mp3'); // Sound Removed per request
                if (scriptActive) await typeText('축하합니다! 섭승이가 대졸 섭승이로 진화했습니다!');
            }
        };

        runSequence();

        return () => { scriptActive = false; };
    }, [battleState, hasInteracted]); // Add hasInteracted to deps

    // Click handler to advance text
    const handleNext = (e: React.MouseEvent) => {
        // Visual Ripple
        setClickRipple({ x: e.clientX, y: e.clientY, id: Date.now() });

        // Start Audio Context on first click
        if (!hasInteracted) {
            setHasInteracted(true);
            const bgm = (window as any).battleBgm;
            if (bgm && bgm.paused) {
                bgm.play().catch((e: any) => console.log('BGM Play Error', e));
            }
        }

        if (isLeveling || battleState === 'EVOLUTION' || (battleState === 'LEVEL_UP' && isLeveling)) return; // Block input and sound

        // Play sound for valid interactions
        playSfx('button_selection.mp3');

        if (battleState === 'MENU') return; // Cannot easy-advance menu
        if (!showDialogArrow && battleState !== 'ENCOUNTER') return; // Wait for text, except specifically handled transitions

        // Block clicks during animation sequences
        if (battleState === 'TRAINER_APPEAR' || battleState === 'TRAINER_THROW') return;
        if (!showDialogArrow) return;

        if (battleState === 'ENCOUNTER') setBattleState('TRAINER_APPEAR');
        else if (battleState === 'SEND_OUT') setBattleState('MENU');
        // else if (battleState === 'LEVEL_UP') setBattleState('EVOLUTION'); // Handled by useEffect now
        else if (battleState === 'EVOLVED') onComplete(); // Finish Intro

        // Other states are auto-advanced by useEffect timers
    };

    const handleAttack = () => {
        playSfx('button_selection.mp3');
        setBattleState('ATTACK');
    };

    if (!mounted) return null;

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-[100]"
            onClick={handleNext}
        >
            <div className="w-full max-w-4xl h-full sm:h-auto sm:aspect-[4/3] bg-black flex flex-col sm:block relative overflow-hidden border-4 border-gray-700 shadow-2xl">
                {/* Mobile Top Dark Bar (20%) */}
                <div className="h-[20%] sm:hidden bg-black w-full z-[70]"></div>

                {/* Battle Scene Area */}
                <div className="flex-1 relative overflow-hidden sm:absolute sm:inset-0 bg-[#f8f8d0]">
                    {/* === EVOLUTION SCENE LAYER === */}
                    {(battleState === 'EVOLUTION' || battleState === 'EVOLVED') && (
                        <div className="absolute inset-0 z-[60] bg-black">
                            <Image
                                src="/evolution_background.png"
                                alt="Evolution BG"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {evolutionPhase === 'intro' && (
                                <div className="absolute inset-0 bg-black z-[70]"></div>
                            )}
                            {evolutionPhase === 'flash' && (
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-3xl opacity-50"
                                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                            )}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 z-[65]"
                                animate={{
                                    filter: evolutionPhase === 'flash'
                                        ? ['brightness(0)', 'brightness(10)', 'brightness(0)']
                                        : 'brightness(1)',
                                }}
                                transition={{ duration: 0.5, repeat: evolutionPhase === 'flash' ? Infinity : 0 }}
                            >
                                <Image
                                    src={evolutionPhase === 'evolved' ? "/cyndaquil_front_graduation.png" : "/cyndaquil_front.png"}
                                    alt="Seungseop"
                                    fill
                                    className="object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                    unoptimized
                                />
                            </motion.div>
                            {evolutionPhase === 'flash' && (
                                <motion.div
                                    className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
                                    animate={{ opacity: [0, 0.3, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                            )}
                            {showSparkles && (
                                <div className="absolute inset-0 z-[90] pointer-events-none overflow-visible">
                                    {[...Array(60)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-white"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                                background: i % 3 === 0 ? '#fbbf24' : '#ffffff',
                                                boxShadow: '0 0 5px white'
                                            }}
                                            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                            animate={{
                                                x: (Math.random() - 0.5) * 800,
                                                y: (Math.random() - 0.5) * 800,
                                                opacity: [0, 1, 0],
                                                scale: [0, 2, 0],
                                                rotate: 180
                                            }}
                                            transition={{
                                                duration: 1.0,
                                                repeat: Infinity,
                                                delay: Math.random() * 0.5,
                                                ease: "easeOut"
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === SCENE LAYER === */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/pokemon_battle_background.png"
                            alt="Battle Background"
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    </div>
                    {/* Hanyang (Enemy) */}
                    <motion.div
                        className="absolute top-[5%] right-[15%] w-48 h-48 sm:w-64 sm:h-64 z-10"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{
                            opacity: hanyangOpacity,
                            x: 0,
                            y: hanyangHp === 0 ? 100 : 0,
                            filter: hanyangHit
                                ? 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)' // Red Flash
                                : 'none'
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Shadow Under Hanyang */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[60%] h-[15%] bg-black/40 rounded-[50%] blur-[2px]"></div>

                        {/* Weed Under Hanyang */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-[30%] opacity-80">
                            <Image
                                src="/pokemon_weed.png"
                                alt="Weed"
                                fill
                                className="object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                unoptimized
                            />
                        </div>
                        <Image
                            src={hanyangHp === 0 ? "/hanyang-front-dead.png" : "/hanyang-front.png"}
                            alt="Hanyang"
                            fill
                            className="object-contain" // Keep object-contain for main sprite
                            style={{ imageRendering: 'pixelated' }}
                            priority
                            unoptimized
                        />
                    </motion.div>

                    {/* FIREBALL ANIMATION */}
                    <AnimatePresence>
                        {fireBallThrown && (
                            <motion.div
                                key="fireball"
                                className="absolute z-40 w-16 h-16 sm:w-20 sm:h-20"
                                initial={{ bottom: '25%', left: '15%', scale: 0.5 }}
                                animate={{
                                    bottom: '60%',
                                    left: '70%',
                                    scale: 1.5
                                }}
                                transition={{ duration: 0.6, ease: 'linear' }}
                            >
                                <Image
                                    src="/fire.png"
                                    alt="Fire"
                                    fill
                                    className="object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                    unoptimized
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Enemy UI Box (Gen 4/5 Style) */}
                    <motion.div
                        initial={{ x: -200 }}
                        animate={{ x: 0 }}
                        className="absolute top-0 left-0 sm:top-[10%] sm:left-[5%] z-20 w-52 sm:w-80 font-galmuri"
                    >
                        {/* Shadow/Border Container */}
                        <div className="relative bg-black/40 p-0.5 sm:p-1" style={{ transform: 'skewX(-15deg)' }}>
                            {/* Main Box */}
                            <div className="bg-[#f8f8f0] border-2 border-[#404040] p-1.5 sm:p-2 shadow-inner relative overflow-hidden">
                                {/* Dark strip at top for "shiny" effect */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] -z-10"></div>

                                <div className="flex justify-between items-baseline mb-1 px-2" style={{ transform: 'skewX(15deg)' }}>
                                    <span className="text-black font-extrabold text-base sm:text-xl tracking-tighter">컴공 하냥이</span>
                                    <span className="text-black font-bold text-xs sm:text-sm">Lv.404</span>
                                </div>

                                {/* HP Bar Container */}
                                <div className="flex items-center gap-1 pl-2" style={{ transform: 'skewX(15deg)' }}>
                                    <div className="bg-[#303030] text-[#f8b050] font-black text-[10px] px-1 rounded-[2px] tracking-wider border border-[#a0a0a0]">HP</div>
                                    <div className="flex-1 h-3 bg-[#505050] rounded-full p-[2px] overflow-hidden border border-white/50">
                                        <motion.div
                                            className="h-full bg-gradient-to-b from-[#50f870] to-[#30d050] rounded-full"
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${(hanyangHp / maxHp) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Decorative triangle notch bottom left */}
                            <div className="absolute -bottom-1 -left-1 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-black/40"></div>
                        </div>
                    </motion.div>


                    {/* TRAINER SPRITE (ASH) */}
                    <AnimatePresence>
                        {trainerVisible && (
                            <motion.div
                                key="trainer"
                                className="absolute bottom-[5%] sm:bottom-[20%] left-[-10%] sm:left-[-5%] z-30"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="w-[292px] h-[450px] sm:w-[390px] sm:h-[390px]"
                                    style={{
                                        backgroundImage: `url(/trainer-throw.png?v=${imgVersion})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center bottom',
                                        // Scale up the pixel art crisply if it's pixel art
                                        imageRendering: 'pixelated',
                                        transformOrigin: 'bottom center',
                                        animation: trainerThrowing
                                            ? 'throwShake 0.6s ease-in-out'
                                            : 'none',
                                    }}
                                />
                                <style jsx>{`
                                @keyframes throwShake {
                                    0% { transform: rotate(0deg); }
                                    20% { transform: rotate(-10deg); }
                                    40% { transform: rotate(10deg); }
                                    60% { transform: rotate(-5deg); }
                                    80% { transform: rotate(5deg); }
                                    100% { transform: rotate(0deg); }
                                }
                            `}</style>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* POKEBALL THROW */}
                    <AnimatePresence>
                        {pokeballThrown && !pokeballLanded && (
                            <motion.div
                                key="pokeball"
                                className="absolute z-40 w-8 h-8 sm:w-10 sm:h-10"
                                initial={{ bottom: '37%', left: '5%', rotate: 0, opacity: 1 }}
                                animate={{
                                    bottom: ['37%', '55%', '30%'], // Arc: Up then down (Lowered to match new positions)
                                    left: ['5%', '15%', '25%'],   // Move right to catch Cyndaquil (aiming for center)
                                    rotate: 720,
                                    opacity: [1, 1, 0] // Fade out at end
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "linear",
                                    times: [0, 0.8, 1]
                                }}
                            >
                                <Image
                                    src="/pokeball.png"
                                    alt="Pokeball"
                                    fill
                                    className="object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                    unoptimized
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Cyndaquil (Player) */}
                    {battleState !== 'ENCOUNTER' && battleState !== 'TRAINER_APPEAR' && battleState !== 'TRAINER_THROW' && (
                        <motion.div
                            className="absolute bottom-[25%] left-[5%] sm:bottom-[30%] sm:left-[20%] w-32 h-32 sm:w-48 sm:h-48 z-20"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                        >
                            {/* Shadow Under Cyndaquil */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[60%] h-[15%] bg-black/40 rounded-[50%] blur-[2px]"></div>

                            {/* Weed Under Cyndaquil */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-[45%] opacity-80">
                                <Image
                                    src="/pokemon_weed.png"
                                    alt="Weed"
                                    fill
                                    className="object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                    unoptimized
                                />
                            </div>
                            <Image
                                src="/cyndaquil-back.png"
                                alt="Seungseop"
                                fill
                                className="object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                priority
                                unoptimized
                            />
                        </motion.div>
                    )}

                    {/* Player UI Box (Gen 4/5 Style) */}
                    {(battleState !== 'ENCOUNTER' && battleState !== 'TRAINER_APPEAR' && battleState !== 'TRAINER_THROW') && (
                        <motion.div
                            initial={{ x: 200 }}
                            animate={{ x: 0 }}
                            className="absolute bottom-0 right-0 sm:bottom-[35%] sm:right-[5%] z-20 w-60 sm:w-96 font-galmuri"
                        >
                            {/* Shadow/Border Container */}
                            <div className="relative bg-black/40 p-0.5 sm:p-1" style={{ transform: 'skewX(-15deg)' }}>
                                {/* Main Box */}
                                <div className="bg-[#f8f8f0] border-2 border-[#404040] p-1.5 sm:p-3 shadow-inner relative overflow-hidden">
                                    {/* Dark strip */}
                                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] -z-10"></div>

                                    <div className="flex justify-between items-baseline mb-1 sm:mb-2 px-2" style={{ transform: 'skewX(15deg)' }}>
                                        <span className="text-black font-extrabold text-lg sm:text-2xl tracking-tighter">섭승이</span>
                                        <span className="text-black font-bold text-base sm:text-lg">Lv.{cyndaquilLevel}</span>
                                    </div>

                                    {/* HP Bar */}
                                    <div className="flex items-center gap-1 mb-1" style={{ transform: 'skewX(15deg)' }}>
                                        <div className="bg-[#303030] text-[#f8b050] font-black text-[10px] px-1 rounded-[2px] tracking-wider border border-[#a0a0a0]">HP</div>
                                        <div className="flex-1 h-3 bg-[#505050] rounded-full p-[2px] overflow-hidden border border-white/50">
                                            <div className="h-full bg-gradient-to-b from-[#50f870] to-[#30d050] rounded-full w-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end items-center" style={{ transform: 'skewX(15deg)' }}>
                                        <div className="text-black font-mono text-xl tracking-widest pl-2">50/ 50</div>
                                    </div>

                                    {/* EXP Bar */}
                                    <div className="relative mt-1 h-1.5 w-[90%] ml-auto bg-[#506070] overflow-hidden rounded-full border border-white/50" style={{ transform: 'skewX(15deg)' }}>
                                        <motion.div
                                            className="h-full bg-[#40a0f8]"
                                            initial={{ width: '80%' }}
                                            animate={{ width: `${expPercent}%` }}
                                            transition={{ duration: expPercent === 0 ? 0 : 0.5, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Attack Flash Effect */}
                    {flash && (
                        <div className="absolute inset-0 bg-white/60 z-[50] animate-pulse pointer-events-none"></div>
                    )}


                </div>

                {/* Mobile Bottom Dark Bar (20%) containing Dialog */}
                <div className="h-[20%] sm:hidden bg-black w-full relative z-[80] p-2">
                    {!(battleState === 'EVOLUTION' && evolutionPhase === 'intro') && (
                        <div className="w-full h-full bg-[#f8f8f0] border-4 border-[#404040] pixel-corners flex items-center justify-center p-2 text-black font-galmuri">
                            {battleState === 'MENU' ? (
                                <div className="w-full h-full grid grid-cols-2 gap-2 p-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAttack(); }}
                                        className="bg-white border-2 border-[#d04040] text-black font-bold text-lg rounded active:translate-y-1"
                                    >
                                        싸운다
                                    </button>
                                    <button className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-lg rounded cursor-not-allowed">
                                        가방
                                    </button>
                                    <button className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-lg rounded cursor-not-allowed">
                                        포켓몬
                                    </button>
                                    <button className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-lg rounded cursor-not-allowed">
                                        도망친다
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center px-4">
                                    <motion.p
                                        key={dialogText}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-lg font-bold leading-tight text-center"
                                    >
                                        {dialogText}
                                    </motion.p>
                                    {showDialogArrow && <div className="absolute bottom-0 right-1 text-[#d04040] animate-bounce">▼</div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* === DIALOG / MENU LAYER (Desktop Only) === */}
                {!(battleState === 'EVOLUTION' && evolutionPhase === 'intro') && (
                    <div className="hidden sm:block absolute bottom-4 left-4 right-4 h-32 bg-[#f8f8f0] border-4 border-[#404040] z-[80] shadow-lg pixel-corners text-black font-galmuri">
                        {battleState === 'MENU' ? (
                            <div className="w-full h-full flex">
                                <div className="w-1/2 flex items-center justify-center border-r-4 border-[#e0e0e0] bg-[#f8f8f8]">
                                    <p className="text-2xl sm:text-3xl font-bold">무엇을 할까?</p>
                                </div>
                                <div className="w-1/2 grid grid-cols-2 gap-2 p-2 bg-[#f0f0f0]">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAttack(); }}
                                        className="bg-white border-2 border-[#d04040] text-black font-bold text-xl hover:bg-[#ffe0e0] rounded shadow-sm active:translate-y-1 transition-all"
                                    >
                                        싸운다
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); playSfx('button_selection.mp3'); }}
                                        className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-xl rounded cursor-not-allowed active:translate-y-1 transition-all"
                                    >
                                        가방
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); playSfx('button_selection.mp3'); }}
                                        className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-xl rounded cursor-not-allowed active:translate-y-1 transition-all"
                                    >
                                        포켓몬
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); playSfx('button_selection.mp3'); }}
                                        className="bg-[#e0e0e0] border-2 border-[#a0a0a0] text-gray-500 font-bold text-xl rounded cursor-not-allowed active:translate-y-1 transition-all"
                                    >
                                        도망친다
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <motion.div
                                    key={dialogText}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xl sm:text-2xl font-bold leading-relaxed text-center"
                                >
                                    {dialogText}
                                </motion.div>

                                {/* Blinking Arrow */}
                                {showDialogArrow && (
                                    <motion.div
                                        className="absolute bottom-2 right-4 text-[#d04040] text-2xl"
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                    >
                                        ▼
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* FLASH EFFECT */}
                {flash && (
                    <motion.div
                        className="absolute inset-0 bg-white z-[60]"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        onAnimationComplete={() => setFlash(false)}
                    />
                )}
            </div>
        </div >
    );
}
