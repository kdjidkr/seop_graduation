'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { useAudio } from "@/context/AudioContext";
import { useAdmin } from "@/context/AdminContext";
import { Lock, LogOut, ShieldCheck, X } from 'lucide-react';

export default function Home() {
  const { setMuted } = useAudio();
  const { isAdmin, login, logout } = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const dDay = new Date('2026-02-28T00:00:00'); // Target date

  useEffect(() => {
    // Automatically mute audio when entering the home screen
    setMuted(true);
  }, [setMuted]);

  useEffect(() => {
    // Intro Redirection Logic
    const introSeen = localStorage.getItem('intro_seen');
    if (!introSeen) {
      router.push('/intro');
    } else {
      setLoading(false);
    }
  }, [router]);

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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(adminPassword)) {
      setShowAdminModal(false);
      setAdminPassword('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <>

      <main className="min-h-screen flex flex-col bg-white text-gray-900 font-noto">
        <Header />

        {/* BEGIN: HeroSection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-grow flex flex-col items-center px-4 relative overflow-hidden pt-12"
        >
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-40 -z-10"></div>

          {/* Hero Content Container */}
          <div className="text-center max-w-4xl w-full flex flex-col items-center">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="headline-font text-4xl sm:text-6xl md:text-7xl text-gray-900 mb-12 whitespace-nowrap"
            >
              승섭, 졸업 축하해
            </motion.h1>

            {/* Main Character Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
              className="relative group"
              data-purpose="hero-character-display"
            >
              <Image
                src="/main_graduation.png"
                alt="Graduation Cyndaquil holding flowers"
                width={600}
                height={600}
                className="w-full max-w-[600px] h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                priority
                unoptimized
              />
            </motion.div>
          </div>
        </motion.div>
        {/* END: HeroSection */}

        {/* Admin Access Button */}
        <div className="fixed bottom-8 right-8 z-50">
          {isAdmin ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="bg-black/10 backdrop-blur-md text-gray-500 hover:text-red-500 p-4 rounded-full transition-colors flex items-center gap-2 font-manseh text-lg shadow-lg"
            >
              <LogOut size={20} />
              <span>로그아웃</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdminModal(true)}
              className="bg-white/10 backdrop-blur-md border border-gray-200 text-gray-400 hover:text-black hover:border-black p-4 px-6 rounded-full transition-all flex items-center gap-2 font-manseh text-xl shadow-xl group"
            >
              <ShieldCheck size={22} className="group-hover:text-amber-500" />
              <span>섭승이로 접속하기</span>
            </motion.button>
          )}
        </div>

        {/* Admin Login Modal */}
        <AnimatePresence>
          {showAdminModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-sm p-8 md:p-10 shadow-2xl relative font-manseh flex flex-col items-center"
              >
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setLoginError(false);
                    setAdminPassword('');
                  }}
                  className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                  <Lock size={32} />
                </div>

                <h3 className="text-3xl text-gray-900 mb-2">섭승이 접속</h3>
                <p className="text-gray-500 text-xl mb-8">암호를 대라!</p>

                <form onSubmit={handleAdminLogin} className="w-full space-y-6">
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="비밀번호 입력..."
                      className={cn(
                        "w-full border-b-2 border-gray-100 focus:border-black outline-none py-2 text-2xl text-center tracking-widest placeholder:tracking-normal placeholder:text-gray-200 transition-colors",
                        loginError && "border-red-500"
                      )}
                      autoFocus
                    />
                    {loginError && (
                      <p className="text-red-500 text-center mt-2 text-lg">암호가 틀렸어!</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-lg text-2xl hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
                  >
                    접속하기
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

    </>
  );
}
