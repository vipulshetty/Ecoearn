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

        {/* Clean Gradient Transition */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent z-30"></div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-gradient-to-br from-primary-100/30 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-[15%] w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-2xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Making a
              <span className="bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent"> Real Impact</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of eco-warriors who are transforming waste into rewards
              <br />
              <span className="text-primary-600 font-semibold">Every action counts. Every reward matters.</span>
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{
                  delay: index * 0.3,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating particles */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  className="absolute top-4 right-4 w-3 h-3 bg-primary-400 rounded-full blur-sm"
                />

                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.3 + 0.5 }}
                    className="text-6xl font-bold bg-gradient-to-r from-primary-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-4"
                  >
                    {stat.value}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.3 + 0.7 }}
                    className="text-gray-700 font-semibold text-xl"
                  >
                    {stat.label}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your waste into rewards with our simple 3-step process powered by cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200"></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">📸 Capture</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Simply snap a photo of your recyclable waste. Our advanced AI instantly recognizes and categorizes your items with 85%+ accuracy.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">⚡ Earn</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Get instant points based on waste type and quality. Track your environmental impact and watch your rewards grow in real-time.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">🎁 Redeem</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Exchange points for Bitcoin, NFTs, discounts, and exclusive rewards. The more you recycle, the more valuable rewards you unlock!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">What Our Eco-Warriors Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users who are making a difference while earning rewards
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden mr-4 ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-primary-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute right-[10%] top-[20%] w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute left-[15%] bottom-[30%] w-40 h-40 bg-gradient-to-tr from-primary-400/20 to-transparent rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-6xl font-bold mb-8 leading-tight">
              Ready to Start Your
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Eco Journey</span>?
            </h2>
            <p className="text-2xl mb-12 text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of eco-warriors making a difference while earning amazing rewards.
              <br />
              <span className="text-white/90">Your planet needs you!</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/waste/submit"
                  className="inline-block bg-gradient-to-r from-white to-primary-50 text-primary-600 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-2xl hover:shadow-3xl hover:from-white hover:to-white transform hover:scale-105"
                >
                  🚀 Start Earning Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/routing"
                  className="group inline-block border-2 border-white/30 text-white px-10 py-5 rounded-full text-xl font-bold transition-all backdrop-blur-sm hover:bg-white/10 hover:border-white/50"
                >
                  🗺️ Optimize Routes
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
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
