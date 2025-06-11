'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Submit Waste', href: '/waste/submit' },
  { name: 'Rewards', href: '/rewards' },
  { name: 'Route Optimizer', href: '/routing' },
  { name: 'Community', href: '/community' },
  { name: 'Marketplace', href: '/marketplace' },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 0);
    });
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${
          isHomePage ? 'h-20' : 'h-16'
        }`}>
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className={`${isHomePage ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl flex items-center justify-center ${
                  isScrolled || !isHomePage
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                    : 'bg-white'
                } shadow-lg transform transition-all group-hover:shadow-2xl`}
              >
                <svg
                  className={`${isHomePage ? 'w-6 h-6' : 'w-5 h-5'} ${
                    isScrolled || !isHomePage ? 'text-white' : 'text-primary-600'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </motion.div>
              <span
                className={`${isHomePage ? 'text-2xl' : 'text-xl'} font-bold transition-colors ${
                  isScrolled || !isHomePage ? 'text-primary-600' : 'text-white'
                } group-hover:text-primary-500`}
              >
                EcoEarn
              </span>
            </Link>
          </div>

          <div className={`hidden md:flex items-center ${isHomePage ? 'space-x-8' : 'space-x-6'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-medium transition-colors group ${isHomePage ? 'text-base' : 'text-sm'} ${
                  isScrolled || !isHomePage
                    ? 'text-gray-600 hover:text-primary-600'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* No authentication-related links needed */}
        </div>
      </div>
    </motion.nav>
  );
}