'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 }); // Default fallback values
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textY = useTransform(scrollYProgress, [0, 0.5], ['0%', '150%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // This code only runs on the client after component mounts
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Set window dimensions
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Waste Recycled', value: '50T' },
    { label: 'Rewards Given', value: '$100K' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Environmental Activist',
      content: 'EcoEarn has revolutionized how I think about recycling. The rewards are amazing!',
      image: '/testimonials/sarah.jpg',
    },
    {
      name: 'Mike Chen',
      role: 'Regular User',
      content: 'I never thought recycling could be this rewarding. Great initiative!',
      image: '/testimonials/mike.jpg',
    },
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Community', href: '/community' },
    { name: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Animated background */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_60%)]"
            />
          </div>
        </motion.div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * windowSize.width,
                y: Math.random() * windowSize.height,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [null, Math.random() * -500],
                x: [null, Math.random() * 200 - 100],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            />
          ))}
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute right-[10%] top-[20%] w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl z-10"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute left-[15%] bottom-[30%] w-40 h-40 bg-gradient-to-tr from-primary-400/30 to-transparent rounded-full blur-3xl z-10"
        />

        {/* Content */}
        <motion.div 
          style={{ y: textY, opacity: opacityHero }}
          className="container mx-auto px-4 relative z-20 pt-20"
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-8 relative"
            >
              <div className="absolute inset-0 animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                  <path
                    d="M 50 0 A 50 50 0 1 1 49.999 0"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="opacity-20"
                  />
                </svg>
              </div>
              <Image
                src="/eco-icon.svg"
                alt="Eco Icon"
                width={120}
                height={120}
                className="mx-auto relative transform hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-100 to-primary-200">
                Turn Your Waste
              </span>
              <br />
              <span className="relative">
                Into 
                <span className="text-white ml-4 relative">
                  Rewards
                  <motion.span
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute bottom-2 left-0 h-1 bg-primary-400 opacity-50"
                  />
                </span>
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-xl md:text-2xl mb-12 text-primary-100 max-w-2xl mx-auto leading-relaxed"
            >
              Join our eco-friendly community and earn rewards for recycling waste materials.
              <br />
              <span className="text-white/80">Make a difference while earning.</span>
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/waste/submit"
                  className="inline-block bg-gradient-to-r from-white to-primary-50 text-primary-600 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl hover:shadow-2xl hover:from-white hover:to-white"
                >
                  Get Started Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#how-it-works"
                  className="group inline-block border-2 border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all backdrop-blur-sm hover:bg-white/10 hover:border-white/50"
                >
                  Learn More
                  <motion.span 
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block ml-2"
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 z-20"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">1. Take a Photo</h3>
              <p className="text-gray-600 text-center">
                Simply take a photo of your recyclable waste using our app. Our AI will analyze it instantly.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">2. Get Points</h3>
              <p className="text-gray-600 text-center">
                Our AI analyzes your waste and awards points based on quantity and quality. Track your impact in real-time.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">3. Redeem Rewards</h3>
              <p className="text-gray-600 text-center">
                Exchange your points for exciting rewards, discounts, and crypto tokens. The more you recycle, the more you earn!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 relative rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl mb-8">
              Join thousands of users making a difference while earning rewards.
            </p>
            <Link
              href="/waste/submit"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Submit Waste Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
