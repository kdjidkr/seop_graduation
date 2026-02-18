'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { cn } from '@/utils/cn';
import { PokemonBattle } from '@/components/intro/PokemonBattle';

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const dDay = new Date('2026-02-28T00:00:00'); // Target date

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= dDay) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: differenceInDays(dDay, now),
        hours: differenceInHours(dDay, now) % 24,
        minutes: differenceInMinutes(dDay, now) % 60,
        seconds: differenceInSeconds(dDay, now) % 60,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!introFinished && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100]"
          >
            <PokemonBattle onComplete={() => setIntroFinished(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen flex flex-col items-center justify-center bg-paper text-brown-900 p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: introFinished ? 0.5 : 0 }}
          className="z-10 text-center space-y-12 max-w-2xl w-full"
        >
          <header className="space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: introFinished ? 0.7 : 0.2 }}
              className="inline-block bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm text-lg font-gamja"
            >
              🎉 2026.02.26 🎉
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold font-jua text-brown-900 tracking-tight leading-tight">
              승섭이의 졸업을<br />축하합니다!
            </h1>
            <p className="text-xl text-brown-900/80 font-gamja">
              멋진 시작을 응원해주세요
            </p>
          </header>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div
                key={unit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: introFinished ? 0.9 + index * 0.1 : 0.4 + index * 0.1 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg text-center border bordered-brown-50"
              >
                <div className="text-3xl font-jua text-brown-900">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-60 font-semibold mt-1">
                  {unit}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/guestbook" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-brown-900 text-paper rounded-xl font-jua text-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                📜 롤링페이퍼 쓰기
              </motion.button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-white text-brown-900 border-2 border-brown-900/10 rounded-xl font-jua text-xl shadow-md hover:shadow-xl transition-shadow"
              >
                📸 추억 사진첩
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <footer className="absolute bottom-6 text-center text-brown-900/40 text-sm font-gamja">
          Developed for Seungseop's Graduation
        </footer>
      </main>
    </>
  );
}
