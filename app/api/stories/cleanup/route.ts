import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

// Cleanup expired stories
export async function POST(request: NextRequest) {
  try {
    console.log('=== Story Cleanup Started ===');
    
    // Find all expired stories
    const expiredStories = await prisma.story.findMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isActive: false,
          },
        ],
      },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        videoUrl: true,
        expiresAt: true,
        isActive: true,
      },
    });

    console.log(`Found ${expiredStories.length} expired stories to cleanup`);

    if (expiredStories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired stories to cleanup',
        deletedCount: 0,
      });
    }

    let deletedCount = 0;
    let fileDeleteErrors = 0;

    // Delete each expired story
    for (const story of expiredStories) {
      try {
        // Delete associated files
        if (story.imageUrl) {
          try {
            const imagePath = join(process.cwd(), 'public', story.imageUrl);
            await unlink(imagePath);
            console.log(`Deleted image file: ${story.imageUrl}`);
          } catch (fileError) {
            console.warn(`Failed to delete image file ${story.imageUrl}:`, (fileError as Error)?.message || 'Unknown error');
            fileDeleteErrors++;
          }
        }
        
        if (story.videoUrl) {
          try {
            const videoPath = join(process.cwd(), 'public', story.videoUrl);
            await unlink(videoPath);
            console.log(`Deleted video file: ${story.videoUrl}`);
          } catch (fileError) {
            console.warn(`Failed to delete video file ${story.videoUrl}:`, (fileError as Error)?.message || 'Unknown error');
            fileDeleteErrors++;
          }
        }

        // Delete story from database
        await prisma.story.delete({
          where: { id: story.id },
        });

        deletedCount++;
        console.log(`Deleted expired story ${story.id} (expired: ${story.expiresAt})`);

      } catch (error) {
        console.error(`Failed to delete story ${story.id}:`, error);
      }
    }

    console.log(`=== Story Cleanup Completed ===`);
    console.log(`Deleted ${deletedCount} stories`);
    if (fileDeleteErrors > 0) {
      console.log(`${fileDeleteErrors} file deletion errors (files may not exist)`);
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} expired stories.`,
      deletedCount,
      fileDeleteErrors,
    });

  } catch (error) {
    console.error('Story cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET requests for manual cleanup triggers
export async function GET(request: NextRequest) {
  return POST(request);
}