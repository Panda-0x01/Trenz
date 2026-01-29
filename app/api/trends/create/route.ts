import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, hashtag, description, duration } = body;

    // Validate required fields
    if (!name || !hashtag) {
      return NextResponse.json(
        { error: 'Name and hashtag are required' },
        { status: 400 }
      );
    }

    // Check if hashtag already exists
    const existingTrend = await prisma.trend.findFirst({
      where: {
        hashtag: hashtag.toLowerCase(),
        isActive: true,
      },
    });

    if (existingTrend) {
      return NextResponse.json(
        { error: 'A trend with this hashtag is already active' },
        { status: 400 }
      );
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (duration || 14));

    // Create the trend
    const trend = await prisma.trend.create({
      data: {
        name: name.trim(),
        hashtag: hashtag.toLowerCase().trim(),
        description: description?.trim() || null,
        startDate,
        endDate,
        isActive: true,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error('Error creating trend:', error);
    return NextResponse.json(
      { error: 'Failed to create trend' },
      { status: 500 }
    );
  }
}