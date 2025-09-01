// Free Blockchain Rewards System using Testnets and Free Services
import { supabase } from '@/lib/supabase';

// Crypto utility functions (simplified for free implementation)
const CryptoUtils = {
  keccak256: (data: string): string => {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  },

  randomBytes: (length: number): string => {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < length * 2; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  },

  createWallet: (): { address: string; privateKey: string } => {
    const privateKey = CryptoUtils.randomBytes(32);
    const address = '0x' + CryptoUtils.keccak256(privateKey).slice(-40);
    return { address, privateKey };
  }
};

interface CryptoReward {
  type: 'testnet-btc' | 'testnet-eth' | 'polygon-matic';
  amount: number;
  address: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface NFTReward {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: Record<string, any>;
  contractAddress: string;
  network: 'polygon' | 'ethereum-goerli';
}

interface DigitalVoucher {
  id: string;
  title: string;
  description: string;
  value: number;
  partnerName: string;
  qrCode: string;
  expiryDate: Date;
  isRedeemed: boolean;
}

interface RewardTransaction {
  id: string;
  userId: string;
  type: 'crypto' | 'nft' | 'voucher';
  pointsSpent: number;
  reward: CryptoReward | NFTReward | DigitalVoucher;
  timestamp: Date;
  blockchainTxHash?: string;
}

export class FreeBlockchainRewards {
  private readonly TESTNET_ENDPOINTS = {
    bitcoin: 'https://blockstream.info/testnet/api',
    ethereum: 'https://goerli.infura.io/v3/YOUR_FREE_INFURA_KEY',
    polygon: 'https://rpc-mumbai.maticvigil.com' // Free Polygon Mumbai testnet
  };

  private readonly FREE_NFT_STORAGE = 'https://api.nft.storage'; // Free IPFS storage
  private readonly TESTNET_FAUCETS = {
    bitcoin: 'https://testnet-faucet.mempool.co',
    ethereum: 'https://goerlifaucet.com',
    polygon: 'https://faucet.polygon.technology'
  };

  // Free smart contract addresses on testnets
  private readonly CONTRACT_ADDRESSES = {
    ecoNFT: '0x1234567890123456789012345678901234567890', // Deploy on Polygon Mumbai
    rewardToken: '0x0987654321098765432109876543210987654321'
  };

  private provider: any = null;
  private wallet: any = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider(): Promise<void> {
    try {
      // Create a demo wallet for testnet operations
      const walletInfo = CryptoUtils.createWallet();
      this.wallet = walletInfo;

      console.log('🔗 Blockchain provider initialized (Demo Mode)');
      console.log('💰 Wallet address:', this.wallet.address);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain provider:', error);
    }
  }

  // Convert points to testnet cryptocurrency
  public async convertPointsToCrypto(
    userId: string, 
    points: number, 
    cryptoType: 'testnet-btc' | 'testnet-eth' | 'polygon-matic'
  ): Promise<CryptoReward> {
    
    const conversionRates = {
      'testnet-btc': 0.00001, // 100,000 points = 1 testnet BTC
      'testnet-eth': 0.001,   // 1,000 points = 1 testnet ETH
      'polygon-matic': 0.1    // 10 points = 1 testnet MATIC
    };

    const cryptoAmount = points * conversionRates[cryptoType];
    
    // Generate a testnet address for the user (simplified)
    const userAddress = this.generateTestnetAddress(userId);
    
    const reward: CryptoReward = {
      type: cryptoType,
      amount: cryptoAmount,
      address: userAddress,
      status: 'pending'
    };

    try {
      // Simulate testnet transaction (in production, use actual testnet APIs)
      const txHash = await this.simulateTestnetTransaction(cryptoType, cryptoAmount, userAddress);
      reward.transactionHash = txHash;
      reward.status = 'confirmed';
      
      console.log(`💰 Converted ${points} points to ${cryptoAmount} ${cryptoType}`);
      console.log(`📝 Transaction hash: ${txHash}`);
      
    } catch (error) {
      console.error('❌ Crypto conversion failed:', error);
      reward.status = 'failed';
    }

    return reward;
  }

  // Mint free NFTs for eco-achievements
  public async mintEcoNFT(
    userId: string, 
    achievement: string, 
    wasteType: string, 
    pointsEarned: number
  ): Promise<NFTReward> {
    
    const nftMetadata = {
      name: `EcoEarn ${achievement} Badge`,
      description: `Awarded for ${achievement} in ${wasteType} recycling. Earned ${pointsEarned} points.`,
      attributes: [
        { trait_type: 'Achievement', value: achievement },
        { trait_type: 'Waste Type', value: wasteType },
        { trait_type: 'Points Earned', value: pointsEarned },
        { trait_type: 'Date', value: new Date().toISOString() },
        { trait_type: 'Rarity', value: this.calculateRarity(pointsEarned) }
      ]
    };

    // Generate NFT image using free services
    const imageUrl = await this.generateNFTImage(achievement, wasteType);
    nftMetadata.description = `${nftMetadata.description} Image: ${imageUrl}`;

    try {
      // Upload metadata to free IPFS storage
      const metadataUri = await this.uploadToIPFS(nftMetadata);
      
      // Mint NFT on free testnet (Polygon Mumbai)
      const tokenId = await this.mintNFTOnTestnet(userId, metadataUri);
      
      const nftReward: NFTReward = {
        tokenId,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageUrl,
        attributes: nftMetadata.attributes.reduce((acc, attr) => {
          acc[attr.trait_type] = attr.value;
          return acc;
        }, {} as Record<string, any>),
        contractAddress: this.CONTRACT_ADDRESSES.ecoNFT,
        network: 'polygon'
      };

      console.log(`🎨 Minted NFT: ${nftReward.name}`);
      console.log(`🆔 Token ID: ${tokenId}`);
      
      return nftReward;
      
    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  // Create digital vouchers with QR codes
  public async createDigitalVoucher(
    userId: string,
    voucherType: string,
    pointsSpent: number
  ): Promise<DigitalVoucher> {
    
    const voucherTemplates = {
      'eco-store-discount': {
        title: '10% Off Eco-Friendly Products',
        description: 'Valid at partner eco-stores',
        value: 10,
        partnerName: 'Green Living Store'
      },
      'coffee-discount': {
        title: 'Free Coffee',
        description: 'Redeem at participating cafes',
        value: 5,
        partnerName: 'Eco Cafe Network'
      },
      'transport-credit': {
        title: 'Public Transport Credit',
        description: '$5 credit for public transportation',
        value: 5,
        partnerName: 'City Transit'
      }
    };

    const template = voucherTemplates[voucherType as keyof typeof voucherTemplates] || voucherTemplates['eco-store-discount'];
    
    const voucher: DigitalVoucher = {
      id: this.generateVoucherId(),
      title: template.title,
      description: template.description,
      value: template.value,
      partnerName: template.partnerName,
      qrCode: await this.generateQRCode(userId, voucherType),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isRedeemed: false
    };

    console.log(`🎫 Created voucher: ${voucher.title}`);
    return voucher;
  }

  // Get user's blockchain wallet info
  public async getUserWalletInfo(userEmail: string): Promise<{
    address: string;
    balances: Record<string, number>;
    nfts: NFTReward[];
    vouchers: DigitalVoucher[];
    recentTransactions: any[];
  }> {
    
    const address = this.generateTestnetAddress(userEmail);
    
    // Fetch user's actual reward transactions from database
    const { data: transactions, error } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch user transactions:', error);
    }

    const balances: Record<string, number> = {
      'testnet-btc': 0,
      'testnet-eth': 0,
      'polygon-matic': 0
    };

    const nfts: NFTReward[] = [];
    const vouchers: DigitalVoucher[] = [];
    const recentTransactions: any[] = [];

    // Process transactions to build wallet data
    if (transactions) {
      for (const tx of transactions) {
        recentTransactions.push({
          id: tx.transaction_id,
          type: tx.reward_type,
          pointsSpent: tx.points_spent,
          date: tx.created_at,
          status: tx.status
        });

        if (tx.reward_type === 'crypto' && tx.reward_data) {
          const cryptoReward = tx.reward_data as CryptoReward;
          balances[cryptoReward.type] += cryptoReward.amount;
        } else if (tx.reward_type === 'nft' && tx.reward_data) {
          nfts.push(tx.reward_data as NFTReward);
        } else if (tx.reward_type === 'voucher' && tx.reward_data) {
          const voucher = tx.reward_data as DigitalVoucher;
          // Check if voucher is still valid
          if (new Date(voucher.expiryDate) > new Date()) {
            vouchers.push(voucher);
          }
        }
      }
    }

    return {
      address,
      balances,
      nfts,
      vouchers,
      recentTransactions
    };
  }

  // Helper methods
  private generateTestnetAddress(userId: string): string {
    // Generate deterministic address based on userId
    const hash = CryptoUtils.keccak256(userId);
    return '0x' + hash.slice(-40);
  }

  private async simulateTestnetTransaction(
    cryptoType: string,
    amount: number,
    toAddress: string
  ): Promise<string> {
    // Simulate blockchain transaction
    const txHash = CryptoUtils.keccak256(`${cryptoType}-${amount}-${toAddress}-${Date.now()}`);

    // In production, use actual testnet APIs
    return txHash;
  }

  private calculateRarity(pointsEarned: number): string {
    if (pointsEarned > 1000) return 'Legendary';
    if (pointsEarned > 500) return 'Epic';
    if (pointsEarned > 200) return 'Rare';
    if (pointsEarned > 50) return 'Uncommon';
    return 'Common';
  }

  private async generateNFTImage(achievement: string, wasteType: string): Promise<string> {
    // Use free image generation services or create simple SVG
    const svgImage = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#4CAF50"/>
        <circle cx="200" cy="150" r="80" fill="#FFF"/>
        <text x="200" y="250" text-anchor="middle" fill="#FFF" font-size="24" font-family="Arial">
          ${achievement}
        </text>
        <text x="200" y="280" text-anchor="middle" fill="#FFF" font-size="16" font-family="Arial">
          ${wasteType}
        </text>
        <text x="200" y="320" text-anchor="middle" fill="#FFF" font-size="12" font-family="Arial">
          EcoEarn Achievement
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`;
    return dataUrl;
  }

  private async uploadToIPFS(metadata: any): Promise<string> {
    // Use free IPFS services like NFT.Storage or Pinata free tier
    try {
      // Simulate IPFS upload
      const hash = CryptoUtils.keccak256(JSON.stringify(metadata));
      return `ipfs://${hash}`;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      // Fallback to local storage or free hosting
      const fallbackHash = CryptoUtils.keccak256(JSON.stringify(metadata));
      return `https://ecoearn-nft-metadata.vercel.app/${fallbackHash}.json`;
    }
  }

  private async mintNFTOnTestnet(userId: string, metadataUri: string): Promise<string> {
    // Simulate NFT minting on Polygon Mumbai testnet
    const tokenId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // In production, interact with actual smart contract
    console.log(`Minting NFT for user ${userId} with metadata ${metadataUri}`);
    
    return tokenId;
  }

  private async generateQRCode(userId: string, voucherType: string): Promise<string> {
    // Generate QR code data
    const qrData = {
      userId,
      voucherType,
      timestamp: Date.now(),
      signature: CryptoUtils.keccak256(`${userId}-${voucherType}`)
    };
    
    // Return QR code data (in production, generate actual QR code image)
    return `qr-${Buffer.from(JSON.stringify(qrData)).toString('base64')}`;
  }

  private generateVoucherId(): string {
    return `voucher-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private async getUserNFTs(userId: string): Promise<NFTReward[]> {
    // Simulate fetching user's NFTs from blockchain
    return [
      {
        tokenId: 'sample-nft-1',
        name: 'Plastic Recycling Champion',
        description: 'Awarded for recycling 100 plastic items',
        imageUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        attributes: { achievement: 'Champion', wasteType: 'plastic' },
        contractAddress: this.CONTRACT_ADDRESSES.ecoNFT,
        network: 'polygon'
      }
    ];
  }

  private async getUserVouchers(userId: string): Promise<DigitalVoucher[]> {
    // Simulate fetching user's vouchers
    return [
      {
        id: 'sample-voucher-1',
        title: '10% Off Eco Products',
        description: 'Valid at partner stores',
        value: 10,
        partnerName: 'Green Store',
        qrCode: 'qr-sample-code',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isRedeemed: false
      }
    ];
  }

  // Reward distribution based on points
  public async distributeReward(
    userEmail: string,
    pointsSpent: number,
    rewardType: 'crypto' | 'nft' | 'voucher',
    specificType?: string
  ): Promise<RewardTransaction> {
    
    let reward: CryptoReward | NFTReward | DigitalVoucher;
    
    // Check if user has enough points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('email', userEmail)
      .single();

    if (userError || !userData || (userData.points || 0) < pointsSpent) {
      throw new Error('Insufficient points or user not found');
    }
    
    switch (rewardType) {
      case 'crypto':
        reward = await this.convertPointsToCrypto(userEmail, pointsSpent, 'polygon-matic');
        break;
      case 'nft':
        reward = await this.mintEcoNFT(userEmail, 'Eco Warrior', 'mixed', pointsSpent);
        break;
      case 'voucher':
        reward = await this.createDigitalVoucher(userEmail, specificType || 'eco-store-discount', pointsSpent);
        break;
      default:
        throw new Error('Invalid reward type');
    }

    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Store the transaction in the database
    const { data: transactionData, error: transactionError } = await supabase
      .from('reward_transactions')
      .insert({
        user_email: userEmail,
        transaction_id: transactionId,
        reward_type: rewardType,
        specific_type: specificType,
        points_spent: pointsSpent,
        reward_data: reward,
        blockchain_tx_hash: rewardType === 'crypto' ? (reward as CryptoReward).transactionHash : undefined,
        status: 'completed'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Failed to store reward transaction:', transactionError);
      // Don't fail the whole transaction, but log the error
    }

    // Deduct points from user account
    const { error: pointsError } = await supabase
      .from('users')
      .update({ 
        points: userData.points - pointsSpent,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail);

    if (pointsError) {
      console.error('Failed to deduct points:', pointsError);
      throw new Error('Failed to deduct points from user account');
    }

    const transaction: RewardTransaction = {
      id: transactionId,
      userId: userEmail,
      type: rewardType,
      pointsSpent,
      reward,
      timestamp: new Date(),
      blockchainTxHash: rewardType === 'crypto' ? (reward as CryptoReward).transactionHash : undefined
    };

    console.log(`🎁 Reward distributed: ${rewardType} for ${pointsSpent} points to ${userEmail}`);
    return transaction;
  }

  // Get available rewards catalog
  public getRewardsCatalog(): {
    crypto: Array<{type: string, pointsRequired: number, description: string}>;
    nfts: Array<{type: string, pointsRequired: number, description: string}>;
    vouchers: Array<{type: string, pointsRequired: number, description: string}>;
  } {
    return {
      crypto: [
        { type: 'testnet-btc', pointsRequired: 1000, description: '0.01 Testnet Bitcoin' },
        { type: 'testnet-eth', pointsRequired: 500, description: '0.5 Testnet Ethereum' },
        { type: 'polygon-matic', pointsRequired: 100, description: '10 Testnet MATIC' }
      ],
      nfts: [
        { type: 'eco-warrior', pointsRequired: 200, description: 'Eco Warrior Achievement NFT' },
        { type: 'recycling-champion', pointsRequired: 500, description: 'Recycling Champion NFT' },
        { type: 'planet-saver', pointsRequired: 1000, description: 'Planet Saver Legendary NFT' }
      ],
      vouchers: [
        { type: 'eco-store-discount', pointsRequired: 50, description: '10% Off Eco Products' },
        { type: 'coffee-discount', pointsRequired: 25, description: 'Free Coffee Voucher' },
        { type: 'transport-credit', pointsRequired: 75, description: '$5 Transport Credit' }
      ]
    };
  }
}

// Export singleton instance
export const blockchainRewards = new FreeBlockchainRewards();
