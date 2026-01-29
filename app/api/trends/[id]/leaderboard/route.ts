import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Calculate engagement score for leaderboard
function calculateEngagementScore(likes: number, comments: number, shares: number = 0): number {
  return likes * 1.0 + comments * 2.0 + shares * 3.0;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const trendId = parseInt(resolvedParams.id);
    
    if (isNaN(trendId)) {
      return NextResponse.json(
        { error: 'Invalid trend ID' },
        { status: 400 }
      );
    }

    // Check if trend exists
    const trend = await prisma.trend.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      return NextResponse.json(
        { error: 'Trend not found' },
        { status: 404 }
      );
    }

    // Get posts with engagement metrics
    const posts = await prisma.post.findMany({
      where: {
        trendId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    // Calculate scores and create leaderboard entries
    const userScores = new Map<number, {
      userId: number;
      user: any;
      posts: any[];
      totalScore: number;
    }>();

    // Group posts by user and calculate total scores
    posts.forEach(post => {
      const score = calculateEngagementScore(
        post._count.likes,
        post._count.comments,
        0 // shares count would go here when implemented
      );

      if (userScores.has(post.userId)) {
        const existing = userScores.get(post.userId)!;
        existing.totalScore += score;
        existing.posts.push({
          id: post.id,
          caption: post.caption,
          imageUrl: post.imageUrl,
          textContent: post.textContent,
          postType: post.postType,
          createdAt: post.createdAt,
          _count: post._count,
        });
      } else {
        userScores.set(post.userId, {
          userId: post.userId,
          user: post.user,
          posts: [{
            id: post.id,
            caption: post.caption,
            imageUrl: post.imageUrl,
            textContent: post.textContent,
            postType: post.postType,
            createdAt: post.createdAt,
            _count: post._count,
          }],
          totalScore: score,
        });
      }
    });

    // Convert to array and create leaderboard entries
    const leaderboardEntries = Array.from(userScores.values()).map(userEntry => ({
      userId: userEntry.userId,
      user: userEntry.user,
      posts: userEntry.posts,
      score: userEntry.totalScore,
      rank: 0, // Will be set after sorting
    }));

    // Sort by score and assign ranks
    leaderboardEntries.sort((a, b) => b.score - a.score);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: leaderboardEntries,
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}