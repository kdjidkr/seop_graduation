'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full px-6 md:px-12 flex justify-center items-center bg-white z-50 pt-[15vh] pb-8"
        >
            <nav data-purpose="main-navigation">
                <ul className="flex space-x-12 md:space-x-24 text-2xl font-medium text-gray-700 justify-center">
                    <li>
                        <Link className="nav-item hover:text-orange-500" href="/gift">gift</Link>
                    </li>
                    <li>
                        <Link className="nav-item hover:text-orange-500" href="/guestbook">letter</Link>
                    </li>
                    <li>
                        <Link className="nav-item hover:text-orange-500" href="/gallery">photo</Link>
                    </li>
                </ul>
            </nav>
        </motion.header>
    );
}
