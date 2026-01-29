import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Delete a story
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const storyId = parseInt(id);
    
    if (isNaN(storyId)) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Find the story and check ownership
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        videoUrl: true,
        isActive: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if user owns the story
    if (story.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own stories' },
        { status: 403 }
      );
    }

    // Delete associated files
    try {
      if (story.imageUrl) {
        const imagePath = join(process.cwd(), 'public', story.imageUrl);
        await unlink(imagePath).catch(() => {}); // Ignore if file doesn't exist
      }
      
      if (story.videoUrl) {
        const videoPath = join(process.cwd(), 'public', story.videoUrl);
        await unlink(videoPath).catch(() => {}); // Ignore if file doesn't exist
      }
    } catch (fileError) {
      console.warn('Failed to delete story files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete story from database
    await prisma.story.delete({
      where: { id: storyId },
    });

    console.log(`Story ${storyId} deleted by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });

  } catch (error) {
    console.error('Delete story error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}