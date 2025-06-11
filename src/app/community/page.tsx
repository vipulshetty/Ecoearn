'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const communityPosts = [
  {
    id: 1,
    title: 'Beach Cleanup Initiative',
    author: {
      name: 'Sarah Johnson',
      image: '/testimonials/sarah.jpg',
      role: 'Environmental Activist',
    },
    content: 'Join us this weekend for our monthly beach cleanup! Last month we collected over 500kg of waste.',
    image: '/community/beach-cleanup.jpg',
    likes: 234,
    comments: 45,
    participants: 89,
    date: '2 days ago',
    tags: ['Event', 'Cleanup', 'Beach'],
  },
  {
    id: 2,
    title: 'Plastic-Free Challenge',
    author: {
      name: 'Mike Chen',
      image: '/testimonials/mike.jpg',
      role: 'Community Leader',
    },
    content: 'Take part in our 30-day plastic-free challenge! Share your progress and win eco-friendly prizes.',
    image: '/community/plastic-free.jpg',
    likes: 567,
    comments: 89,
    participants: 234,
    date: '1 week ago',
    tags: ['Challenge', 'Plastic-Free', 'Contest'],
  },
  // Add more community posts as needed
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Community Recycling Workshop',
    date: 'Saturday, Aug 15',
    time: '10:00 AM',
    location: 'City Community Center',
    participants: 45,
    image: '/community/workshop.jpg',
  },
  {
    id: 2,
    title: 'EcoEarn Meetup',
    date: 'Sunday, Aug 16',
    time: '2:00 PM',
    location: 'Green Park',
    participants: 32,
    image: '/community/meetup.jpg',
  },
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

export default function Community() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-green-600 to-blue-600 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_60%)]"
        />

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-[15%] w-48 h-48 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-2xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            >
              Join Our
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Eco Community</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl mb-12 text-primary-100 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with like-minded eco-warriors, share your recycling journey, and make a difference together.
              <br />
              <span className="text-white/90">Together we're stronger! 🌱</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-white to-primary-50 text-primary-600 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-2xl hover:shadow-3xl hover:from-white hover:to-white"
              >
                🌟 Share Your Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-10 py-5 rounded-full text-xl font-bold transition-all backdrop-blur-sm hover:bg-white/10 hover:border-white/50"
              >
                🤝 Join Events
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Clean Gradient Transition */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Community Stats */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-gradient-to-br from-green-100/30 to-transparent rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Growing Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of eco-warriors making a real impact every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '15K+', label: 'Active Members' },
              { value: '2.3M', label: 'Waste Items Recycled' },
              { value: '450+', label: 'Community Events' },
              { value: '89%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{
                  delay: index * 0.2,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating particle */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  className="absolute top-4 right-4 w-2 h-2 bg-primary-400 rounded-full blur-sm"
                />

                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    className="text-5xl font-bold bg-gradient-to-r from-primary-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-3"
                  >
                    {stat.value}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                    className="text-gray-700 font-semibold text-lg"
                  >
                    {stat.label}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {communityPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={item}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-64">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                      <p className="text-sm text-gray-500">{post.author.role}</p>
                    </div>
                    <span className="text-sm text-gray-400 ml-auto">{post.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 hover:text-primary-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{post.participants} joined</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <motion.div
              variants={item}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date} • {event.time}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <div className="mt-2 flex items-center text-sm text-primary-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.participants} attending
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-center text-primary-600 font-medium hover:text-primary-700">
                View All Events →
              </button>
            </motion.div>

            {/* Community Leaderboard */}
            <motion.div
              variants={item}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Contributors</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-2"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {i}
                    </div>
                    <Image
                      src={`/testimonials/user${i}.jpg`}
                      alt={`Top contributor ${i}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">User Name</h3>
                      <p className="text-sm text-gray-500">1,234 points</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
