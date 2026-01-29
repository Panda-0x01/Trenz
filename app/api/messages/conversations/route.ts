import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get all conversations for the current user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true
              }
            }
          }
        },
        recipient: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImageUrl: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group conversations by the other user
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUser = message.senderId === userId ? message.recipient : message.sender;
      const conversationKey = otherUser.id;
      
      if (!conversationMap.has(conversationKey)) {
        // Add computed fields for compatibility
        const userWithCounts = {
          ...otherUser,
          followerCount: otherUser._count?.followers || 0,
          followingCount: otherUser._count?.following || 0,
          postCount: otherUser._count?.posts || 0
        };
        
        conversationMap.set(conversationKey, {
          user: userWithCounts,
          lastMessage: message,
          unreadCount: 0,
          isOnline: Math.random() > 0.5 // Mock online status
        });
      }
    });

    // Calculate unread counts
    for (const [otherUserId, conversation] of conversationMap) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: otherUserId,
          recipientId: userId,
          isRead: false
        }
      });
      conversation.unreadCount = unreadCount;
    }

    const result = Array.from(conversationMap.values());

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}