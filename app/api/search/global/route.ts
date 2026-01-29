import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    console.log('Search request:', { query, type });

    if (!query || query.trim().length < 1) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
      }, { status: 400 });
    }

    const searchTerm = query.trim();
    const results = {
      posts: [],
      trends: [],
      users: [],
    };

    console.log('Searching for:', searchTerm);

    // Search posts
    if (!type || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          AND: [
            { isDeleted: false },
            {
              OR: [
                { caption: { contains: searchTerm, mode: 'insensitive' } },
                { textContent: { contains: searchTerm, mode: 'insensitive' } },
                { imageAltText: { contains: searchTerm, mode: 'insensitive' } },
                {
                  user: {
                    OR: [
                      { username: { contains: searchTerm, mode: 'insensitive' } },
                      { displayName: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                  },
                },
                {
                  trend: {
                    OR: [
                      { name: { contains: searchTerm, mode: 'insensitive' } },
                      { hashtag: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            },
          ],
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
          trend: {
            select: {
              id: true,
              name: true,
              hashtag: true,
              isActive: true,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      results.posts = posts;
    }

    // Search trends
    if (!type || type === 'trends') {
      const trends = await prisma.trend.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { hashtag: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              posts: {
                where: { isDeleted: false },
              },
            },
          },
        },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
      });

      results.trends = trends;
    }

    // Search users
    if (!type || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { displayName: { contains: searchTerm, mode: 'insensitive' } },
            { bio: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          profileImageUrl: true,
          isVerified: true,
          isPrivate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: {
                where: { isDeleted: false },
              },
              followers: {
                where: { status: 'ACCEPTED' },
              },
              following: {
                where: { status: 'ACCEPTED' },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      results.users = users;
    }

    console.log('Search results:', {
      posts: results.posts.length,
      trends: results.trends.length,
      users: results.users.length,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}