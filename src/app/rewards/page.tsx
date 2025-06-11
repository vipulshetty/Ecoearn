'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  PhotoIcon,
  TicketIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { blockchainRewards } from '@/services/blockchainRewards';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'crypto' | 'nft' | 'voucher';
  specificType?: string;
  icon: any;
}

export default function Rewards() {
  const [points, setPoints] = useState(2500); // Demo points
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const catalog = blockchainRewards.getRewardsCatalog();

      const allRewards: Reward[] = [
        // Crypto rewards
        ...catalog.crypto.map((item: any) => ({
          id: `crypto-${item.type}`,
          title: item.description,
          description: `Convert points to ${item.type.replace('testnet-', '').toUpperCase()}`,
          pointsCost: item.pointsRequired,
          type: 'crypto' as const,
          specificType: item.type,
          icon: CurrencyDollarIcon
        })),
        // NFT rewards
        ...catalog.nfts.map((item: any) => ({
          id: `nft-${item.type}`,
          title: item.description,
          description: 'Mint exclusive eco-achievement NFT',
          pointsCost: item.pointsRequired,
          type: 'nft' as const,
          specificType: item.type,
          icon: PhotoIcon
        })),
        // Voucher rewards
        ...catalog.vouchers.map((item: any) => ({
          id: `voucher-${item.type}`,
          title: item.description,
          description: 'Digital voucher with QR code',
          pointsCost: item.pointsRequired,
          type: 'voucher' as const,
          specificType: item.type,
          icon: TicketIcon
        }))
      ];

      setRewards(allRewards);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (points < reward.pointsCost) {
      alert(`Insufficient points! You need ${reward.pointsCost} but only have ${points}.`);
      return;
    }

    try {
      setRedeeming(reward.id);

      // Use the blockchain rewards service
      const transaction = await blockchainRewards.distributeReward(
        'demo-user',
        reward.pointsCost,
        reward.type,
        reward.specificType
      );

      console.log('Reward redeemed:', transaction);

      // Update points
      setPoints(prev => prev - reward.pointsCost);

      // Show success message
      alert(`Successfully redeemed ${reward.title}! Check your wallet for the reward.`);

    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎁 Blockchain Rewards Store
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Convert your eco-points to cryptocurrency, NFTs, and digital vouchers
          </p>
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg">
            <SparklesIcon className="h-6 w-6 text-green-500" />
            <span className="text-lg font-semibold text-gray-700">Available Points:</span>
            <span className="text-2xl font-bold text-green-600">{points.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Rewards Categories */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
              <CurrencyDollarIcon className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Cryptocurrency</h3>
              <p className="text-sm text-gray-600">Testnet Bitcoin, Ethereum & Polygon</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
              <PhotoIcon className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">NFT Collection</h3>
              <p className="text-sm text-gray-600">Exclusive eco-achievement NFTs</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
              <TicketIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Digital Vouchers</h3>
              <p className="text-sm text-gray-600">Partner discounts with QR codes</p>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    reward.type === 'crypto' ? 'bg-orange-100' :
                    reward.type === 'nft' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    <reward.icon className={`h-6 w-6 ${
                      reward.type === 'crypto' ? 'text-orange-600' :
                      reward.type === 'nft' ? 'text-purple-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reward.type === 'crypto' ? 'bg-orange-100 text-orange-800' :
                      reward.type === 'nft' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reward.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm">{reward.description}</p>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-sm text-gray-500">Cost</span>
                    <p className="text-lg font-bold text-green-600">{reward.pointsCost.toLocaleString()} pts</p>
                  </div>

                  <button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={points < reward.pointsCost || redeeming === reward.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      points >= reward.pointsCost && redeeming !== reward.id
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Redeeming...</span>
                      </div>
                    ) : points >= reward.pointsCost ? (
                      'Redeem Now'
                    ) : (
                      `Need ${(reward.pointsCost - points).toLocaleString()} more`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white text-center"
        >
          <GiftIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">How Blockchain Rewards Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔗 Testnet Crypto</h4>
              <p className="text-green-100">
                Earn real testnet cryptocurrency that you can use to learn about blockchain technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎨 Free NFTs</h4>
              <p className="text-green-100">
                Mint unique eco-achievement NFTs stored on IPFS with zero gas fees
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎫 Digital Vouchers</h4>
              <p className="text-green-100">
                Get real discounts at partner stores with QR code verification
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
