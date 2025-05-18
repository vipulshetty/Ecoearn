'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const categories = [
  { id: 'all', name: 'All Rewards' },
  { id: 'gift-cards', name: 'Gift Cards' },
  { id: 'eco-products', name: 'Eco Products' },
  { id: 'experiences', name: 'Experiences' },
  { id: 'donations', name: 'Donations' },
];

const rewards = [
  {
    id: 1,
    title: '$50 Amazon Gift Card',
    description: 'Redeem your points for an Amazon gift card.',
    points: 5000,
    category: 'gift-cards',
    image: '/marketplace/amazon-card.jpg',
    stock: 50,
    featured: true,
  },
  {
    id: 2,
    title: 'Reusable Water Bottle',
    description: 'High-quality stainless steel water bottle.',
    points: 2000,
    category: 'eco-products',
    image: '/marketplace/water-bottle.jpg',
    stock: 100,
  },
  {
    id: 3,
    title: 'Tree Planting',
    description: 'Plant a tree in your name.',
    points: 1000,
    category: 'donations',
    image: '/marketplace/tree-planting.jpg',
    stock: 999,
  },
  {
    id: 4,
    title: 'Eco Workshop',
    description: 'Join an exclusive eco-friendly workshop.',
    points: 3000,
    category: 'experiences',
    image: '/marketplace/workshop.jpg',
    stock: 20,
  },
  // Add more rewards as needed
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRewards = rewards.filter((reward) => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-600 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_60%)]"
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Redeem Your Rewards</h1>
            <p className="text-xl mb-8 text-primary-100">
              Turn your recycling points into amazing rewards and experiences.
            </p>
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredRewards.map((reward) => (
            <motion.div
              key={reward.id}
              variants={item}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                reward.featured ? 'ring-2 ring-primary-500 ring-offset-2' : ''
              }`}
            >
              <div className="relative h-48">
                <Image
                  src={reward.image}
                  alt={reward.title}
                  fill
                  className="object-cover"
                />
                {reward.featured && (
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.title}</h3>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-primary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">{reward.points.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {reward.stock} available
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Redeem Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
