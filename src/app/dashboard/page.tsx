'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface WasteSubmission {
  id: string;
  type: string;
  detailedType: string;
  quality: string;
  points: number;
  ai_confidence: number;
  image_url: string;
  created_at: string;
}

interface DashboardStats {
  totalPoints: number;
  totalSubmissions: number;
  wasteByType: Record<string, number>;
  recentSubmissions: WasteSubmission[];
  pointsHistory: { date: string; points: number }[];
}

const stats = [
  {
    name: 'Total Points',
    value: '2,450',
    change: '+12%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Waste Recycled',
    value: '45 kg',
    change: '+18%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    name: 'Carbon Offset',
    value: '120 kg',
    change: '+8%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Rewards Claimed',
    value: '8',
    change: '+2',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
];

const recentActivity = [
  {
    type: 'Waste Submission',
    description: 'Plastic bottles and cardboard boxes',
    points: '+150',
    date: '2 hours ago',
    status: 'Approved',
  },
  {
    type: 'Reward Claimed',
    description: '$10 Amazon Gift Card',
    points: '-1000',
    date: '1 day ago',
    status: 'Completed',
  },
  {
    type: 'Waste Submission',
    description: 'Glass containers and paper waste',
    points: '+200',
    date: '2 days ago',
    status: 'Approved',
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setError(null);
          const response = await axios.get('/api/dashboard');
          setStats(response.data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your account today.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.wasteByType && Object.entries(stats.wasteByType).map(([type, count]) => (
          <motion.div
            key={type}
            variants={item}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${
                type === 'Plastic' ? 'bg-primary-50 text-primary-600' :
                type === 'Cardboard' ? 'bg-green-50 text-green-600' :
                type === 'Glass' ? 'bg-blue-50 text-blue-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                {/* Add appropriate icon for each type */}
              </div>
              <div className={`text-sm font-medium ${
                type === 'Plastic' ? 'text-primary-600' :
                type === 'Cardboard' ? 'text-green-600' :
                type === 'Glass' ? 'text-blue-600' :
                'text-purple-600'
              }`}>
                {type}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{type}</h3>
              <p className="text-2xl font-semibold text-gray-900">{count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    activity.points.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.points} points
                  </p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  activity.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
