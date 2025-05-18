'use client';

import { useState, useEffect } from 'react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image: string;
}

export default function Rewards() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Shopping Discount',
      description: '10% off at partner stores',
      pointsCost: 100,
      image: '/rewards/discount.png'
    },
    {
      id: '2',
      title: 'NFT Token',
      description: 'Exclusive eco-friendly NFT',
      pointsCost: 500,
      image: '/rewards/nft.png'
    },
    {
      id: '3',
      title: 'Crypto Rewards',
      description: 'Convert points to cryptocurrency',
      pointsCost: 1000,
      image: '/rewards/crypto.png'
    }
  ]);

  useEffect(() => {
    // TODO: Fetch user's points from API
    setPoints(250);
  }, []);

  const handleRedeemReward = async (rewardId: string) => {
    try {
      // TODO: Implement reward redemption
      console.log(`Redeeming reward ${rewardId}`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Rewards</h1>
        <p className="text-xl mt-2">Current Points: <span className="font-bold text-green-600">{points}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{reward.title}</h3>
              <p className="text-gray-600 mb-4">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-bold">{reward.pointsCost} points</span>
                <button
                  onClick={() => handleRedeemReward(reward.id)}
                  disabled={points < reward.pointsCost}
                  className={`px-4 py-2 rounded-md ${
                    points >= reward.pointsCost
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
