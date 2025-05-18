import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Waste from '@/models/Waste';
import User from '@/models/User';

// Points calculation based on waste type and weight
const calculatePoints = (type: string, subType: string, weight: number): number => {
  const basePoints = {
    plastic: 10,
    paper: 8,
    metal: 15,
    glass: 12,
    electronics: 20,
    organic: 5
  };

  const qualityMultiplier = {
    pet: 1.2,
    hdpe: 1.3,
    aluminum: 1.5,
    copper: 2.0,
    phones: 3.0,
    computers: 4.0
  };

  const basePoint = basePoints[type as keyof typeof basePoints] || 5;
  const multiplier = qualityMultiplier[subType as keyof typeof qualityMultiplier] || 1.0;

  return Math.round(basePoint * weight * multiplier);
};

// AI analysis simulation (to be replaced with actual AI service)
const simulateAIAnalysis = (type: string, subType: string) => {
  return {
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    detectedType: type,
    recommendations: [
      'Ensure the items are clean and dry',
      'Remove any non-recyclable components',
      'Separate different materials when possible'
    ]
  };
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    
    // Validate required fields
    const type = formData.get('type');
    const subType = formData.get('subType');
    const weightStr = formData.get('weight');

    if (!type || !subType || !weightStr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const weight = parseFloat(weightStr as string);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { error: 'Invalid weight value' },
        { status: 400 }
      );
    }

    const description = formData.get('description') as string;
    const locationJson = formData.get('location') as string;
    const location = locationJson ? JSON.parse(locationJson) : null;
    
    // Handle image files
    const imageFiles = formData.getAll('images');
    if (!imageFiles.length) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    const imageUrls = [];
    for (const file of imageFiles) {
      if (file instanceof File) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const publicId = `waste_${timestamp}_${randomId}`;
        
        // TODO: Replace with actual cloud storage upload
        // For now, create a temporary URL
        imageUrls.push({
          url: `https://temporary-url.com/${publicId}/${file.name}`,
          publicId: publicId
        });
      }
    }

    if (!imageUrls.length) {
      return NextResponse.json(
        { error: 'No valid images provided' },
        { status: 400 }
      );
    }

    // Calculate points
    const points = calculatePoints(type as string, subType as string, weight);

    // Simulate AI analysis
    const aiAnalysis = simulateAIAnalysis(type as string, subType as string);

    // Create waste submission
    const waste = await Waste.create({
      userId: user._id,
      type,
      subType,
      weight,
      description,
      location,
      images: imageUrls,
      points,
      aiAnalysis,
      verificationCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      wasteQuality: 'pending',
      status: 'pending'
    });

    // Update user's total points and submissions
    await User.findByIdAndUpdate(user._id, {
      $inc: { totalPoints: points },
      $push: { 
        submissions: waste._id,
        'stats.pointsHistory': {
          points,
          reason: `Waste submission: ${type} - ${weight}kg`,
          timestamp: new Date()
        }
      },
      $inc: { 'stats.totalWasteCollected': weight }
    });

    return NextResponse.json({
      message: 'Waste submitted successfully',
      points,
      verificationCode: waste.verificationCode,
      waste
    });
  } catch (error: any) {
    console.error('Error submitting waste:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to submit waste',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { userId: user._id };

    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const totalSubmissions = await Waste.countDocuments(query);
    const totalPages = Math.ceil(totalSubmissions / limit);

    const submissions = await Waste.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      submissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalSubmissions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching waste submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste submissions' },
      { status: 500 }
    );
  }
}
