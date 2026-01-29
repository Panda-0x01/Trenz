import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const trends = await prisma.trend.findMany({
      where: activeOnly ? {
        isActive: true,
        endDate: {
          gt: new Date(),
        },
      } : undefined,
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: trends,
    });

  } catch (error) {
    console.error('Get trends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}