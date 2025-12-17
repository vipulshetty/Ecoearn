import { NextRequest, NextResponse } from 'next/server';
// Auth removed for DevOps demo
import { supabase } from '@/lib/supabase';
// TODO: Convert to Supabase - MongoDB models not available
// import dbConnect from '@/lib/mongodb';
// import Waste from '@/models/Waste';
// import User from '@/models/User';

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

    // TODO: Implement with Supabase
    // await dbConnect();
    // const user = await User.findOne({ email: session.user.email });
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // }

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

    // TODO: Implement with Supabase
    // Create waste submission
    const verificationCode = Math.random().toString(36).substr(2, 6).toUpperCase();

    // Temporary implementation for deployment
    const waste = {
      id: Date.now().toString(),
      userId: session.user.email,
      type,
      subType,
      weight,
      description,
      location,
      images: imageUrls,
      points,
      aiAnalysis,
      verificationCode,
      wasteQuality: 'pending',
      status: 'pending',
      createdAt: new Date()
    };

    console.log('Waste submission (temporary):', waste);

    return NextResponse.json({
      message: 'Waste submitted successfully (demo mode)',
      points,
      verificationCode,
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

    // TODO: Implement with Supabase
    // await dbConnect();
    // const user = await User.findOne({ email: session.user.email });
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Temporary mock data for deployment
    const mockSubmissions = [
      {
        id: '1',
        type: 'plastic',
        subType: 'pet',
        weight: 2.5,
        points: 25,
        status: 'verified',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        verificationCode: 'ABC123'
      },
      {
        id: '2',
        type: 'paper',
        subType: 'cardboard',
        weight: 1.8,
        points: 14,
        status: 'pending',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        verificationCode: 'DEF456'
      }
    ];

    // Filter by status and type if provided
    let filteredSubmissions = mockSubmissions;
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
    }
    if (type) {
      filteredSubmissions = filteredSubmissions.filter(s => s.type === type);
    }

    const totalSubmissions = filteredSubmissions.length;
    const totalPages = Math.ceil(totalSubmissions / limit);
    const startIndex = (page - 1) * limit;
    const submissions = filteredSubmissions.slice(startIndex, startIndex + limit);

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
