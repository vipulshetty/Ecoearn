'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WalletIcon, 
  CurrencyDollarIcon, 
  PhotoIcon,
  TicketIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { blockchainRewards } from '@/services/blockchainRewards';

interface WalletData {
  address: string;
  balances: Record<string, number>;
  nfts: Array<{
    tokenId: string;
    name: string;
    description: string;
    imageUrl: string;
    attributes: Record<string, any>;
  }>;
  vouchers: Array<{
    id: string;
    title: string;
    description: string;
    value: number;
    partnerName: string;
    qrCode: string;
    expiryDate: Date;
    isRedeemed: boolean;
  }>;
}

interface BlockchainWalletProps {
  userId: string;
  userPoints: number;
}

export default function BlockchainWallet({ userId, userPoints }: BlockchainWalletProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'nfts' | 'vouchers'>('crypto');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedRewardType, setSelectedRewardType] = useState<'crypto' | 'nft' | 'voucher'>('crypto');
  const [rewardCatalog, setRewardCatalog] = useState<any>(null);

  useEffect(() => {
    loadWalletData();
    loadRewardCatalog();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      // Load demo wallet data
      const demoData = {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590c4C87',
        balances: {
          'testnet-btc': 0.0025,
          'testnet-eth': 0.15,
          'polygon-matic': 12.5
        },
        nfts: [
          {
            tokenId: 'eco-nft-001',
            name: 'Plastic Recycling Champion',
            description: 'Awarded for recycling 100 plastic items',
            imageUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            attributes: { achievement: 'Champion', wasteType: 'plastic' }
          },
          {
            tokenId: 'eco-nft-002',
            name: 'Eco Warrior Badge',
            description: 'Earned through consistent recycling efforts',
            imageUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            attributes: { achievement: 'Warrior', level: 'Gold' }
          }
        ],
        vouchers: [
          {
            id: 'voucher-001',
            title: '10% Off Eco Products',
            description: 'Valid at partner eco-stores',
            value: 10,
            partnerName: 'Green Living Store',
            qrCode: 'qr-demo-code-001',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isRedeemed: false
          },
          {
            id: 'voucher-002',
            title: 'Free Coffee Voucher',
            description: 'Redeem at participating cafes',
            value: 5,
            partnerName: 'Eco Cafe Network',
            qrCode: 'qr-demo-code-002',
            expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            isRedeemed: true
          }
        ]
      };
      setWalletData(demoData);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRewardCatalog = async () => {
    const catalog = blockchainRewards.getRewardsCatalog();
    setRewardCatalog(catalog);
  };

  const handleRewardClaim = async (rewardType: 'crypto' | 'nft' | 'voucher', specificType?: string) => {
    try {
      const pointsRequired = getPointsRequired(rewardType, specificType);
      
      if (userPoints < pointsRequired) {
        alert(`Insufficient points! You need ${pointsRequired} points but only have ${userPoints}.`);
        return;
      }

      const transaction = await blockchainRewards.distributeReward(
        userId,
        pointsRequired,
        rewardType,
        specificType
      );

      console.log('Reward claimed:', transaction);
      
      // Refresh wallet data
      await loadWalletData();
      
      // Close modal
      setShowRewardModal(false);
      
      // Show success message
      alert(`Successfully claimed ${rewardType} reward!`);
      
    } catch (error) {
      console.error('Failed to claim reward:', error);
      alert('Failed to claim reward. Please try again.');
    }
  };

  const getPointsRequired = (rewardType: 'crypto' | 'nft' | 'voucher', specificType?: string): number => {
    if (!rewardCatalog) return 0;
    
    const catalog = rewardCatalog[rewardType];
    const item = catalog.find((item: any) => item.type === specificType) || catalog[0];
    return item?.pointsRequired || 0;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Failed to load wallet data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Wallet Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🌱 EcoEarn Wallet</h2>
            <div className="flex items-center space-x-2">
              <WalletIcon className="h-5 w-5" />
              <span className="font-mono text-sm">{formatAddress(walletData.address)}</span>
              <button
                onClick={() => copyToClipboard(walletData.address)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Available Points</p>
            <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { key: 'crypto', label: 'Crypto', icon: CurrencyDollarIcon },
          { key: 'nfts', label: 'NFTs', icon: PhotoIcon },
          { key: 'vouchers', label: 'Vouchers', icon: TicketIcon }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'crypto' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Cryptocurrency Balances</h3>
              <button
                onClick={() => {
                  setSelectedRewardType('crypto');
                  setShowRewardModal(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Convert Points
              </button>
            </div>
            
            <div className="grid gap-4">
              {Object.entries(walletData.balances).map(([currency, balance]) => (
                <div key={currency} className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{currency.toUpperCase()}</p>
                        <p className="text-sm text-gray-500">Testnet Currency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{balance.toFixed(6)}</p>
                      <p className="text-sm text-gray-500">≈ $0.00 (Testnet)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">NFT Collection</h3>
              <button
                onClick={() => {
                  setSelectedRewardType('nft');
                  setShowRewardModal(true);
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Mint NFT
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletData.nfts.map((nft) => (
                <div key={nft.tokenId} className="bg-white rounded-lg border overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    {nft.imageUrl.startsWith('data:') ? (
                      <div dangerouslySetInnerHTML={{ __html: atob(nft.imageUrl.split(',')[1]) }} />
                    ) : (
                      <PhotoIcon className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{nft.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(nft.attributes).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Digital Vouchers</h3>
              <button
                onClick={() => {
                  setSelectedRewardType('voucher');
                  setShowRewardModal(true);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Get Voucher
              </button>
            </div>
            
            <div className="grid gap-4">
              {walletData.vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className={`bg-white rounded-lg border p-4 ${
                    voucher.isRedeemed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <TicketIcon className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold">{voucher.title}</h4>
                        {voucher.isRedeemed && (
                          <span className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                            Redeemed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{voucher.description}</p>
                      <p className="text-sm text-gray-500">
                        Partner: {voucher.partnerName} • 
                        Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${voucher.value}</p>
                      <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center mt-2">
                        <span className="text-xs">QR</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Reward Modal */}
      {showRewardModal && rewardCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">
              Claim {selectedRewardType.charAt(0).toUpperCase() + selectedRewardType.slice(1)} Reward
            </h3>
            
            <div className="space-y-3 mb-6">
              {rewardCatalog[selectedRewardType].map((reward: any) => (
                <div
                  key={reward.type}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRewardClaim(selectedRewardType, reward.type)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{reward.description}</p>
                      <p className="text-sm text-gray-500">
                        {reward.pointsRequired} points required
                      </p>
                    </div>
                    <div className="text-right">
                      {userPoints >= reward.pointsRequired ? (
                        <span className="text-green-600 font-medium">Available</span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          Need {reward.pointsRequired - userPoints} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRewardModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
