import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    // Check if user is requesting their own saved posts or if it's public
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // For now, return empty array as we don't have a saved posts table
    // In a real app, you would have a SavedPost model
    const savedPosts: any[] = [];

    return NextResponse.json({
      success: true,
      data: savedPosts
    });

  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // For now, just return success
    // In a real app, you would create a SavedPost record
    return NextResponse.json({
      success: true,
      message: 'Post saved successfully'
    });

  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // For now, just return success
    // In a real app, you would delete the SavedPost record
    return NextResponse.json({
      success: true,
      message: 'Post unsaved successfully'
    });

  } catch (error) {
    console.error('Error unsaving post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsave post' },
      { status: 500 }
    );
  }
}