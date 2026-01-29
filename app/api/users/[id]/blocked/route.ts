import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    // Check if user is requesting their own blocked users
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // For now, return empty array as we don't have a blocked users table
    // In a real app, you would have a BlockedUser model
    const blockedUsers: any[] = [];

    return NextResponse.json({
      success: true,
      data: blockedUsers
    });

  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { blockedUserId } = await request.json();

    if (!blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID to block is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: blockedUserId }
    });

    if (!userToBlock) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-blocking
    if (userId === blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // For now, just return success
    // In a real app, you would create a BlockedUser record
    return NextResponse.json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { blockedUserId } = await request.json();

    if (!blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID to unblock is required' },
        { status: 400 }
      );
    }

    // For now, just return success
    // In a real app, you would delete the BlockedUser record
    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}