import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const createStorySchema = z.object({
  content: z.string().max(500).optional(),
  storyType: z.enum(['image', 'video', 'text']).default('image'),
});

// Get active stories
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First, cleanup expired stories automatically
    try {
      const now = new Date();
      const expiredCount = await prisma.story.updateMany({
        where: {
          expiresAt: {
            lt: now,
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      
      if (expiredCount.count > 0) {
        console.log(`Marked ${expiredCount.count} stories as inactive (expired)`);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup expired stories:', cleanupError);
    }

    // Get stories from users that the current user follows + their own stories
    const stories = await prisma.story.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(), // Only get non-expired stories
        },
        OR: [
          { userId: user.id }, // Own stories
          {
            user: {
              followers: {
                some: {
                  followerId: user.id,
                  status: 'ACCEPTED',
                },
              },
            },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {} as Record<number, { user: any; stories: any[] }>);

    return NextResponse.json({
      success: true,
      data: Object.values(groupedStories),
    });
  } catch (error) {
    console.error('Get stories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new story
export async function POST(request: NextRequest) {
  try {
    console.log('=== Story Creation Started ===');
    
    const user = await getUserFromRequest(request);
    console.log('User authenticated:', user ? user.id : 'No user');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const storyType = formData.get('storyType') as string || 'image';
    const imageFile = formData.get('image') as File;
    const videoFile = formData.get('video') as File;

    console.log('Form data received:', { 
      storyType, 
      hasContent: !!content, 
      hasImage: !!imageFile && imageFile.size > 0, 
      hasVideo: !!videoFile && videoFile.size > 0,
    });

    // Validate form data
    let validatedData;
    try {
      validatedData = createStorySchema.parse({
        content: content || undefined,
        storyType,
      });
      console.log('Data validated successfully:', validatedData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid input data', details: validationError.errors },
        { status: 400 }
      );
    }

    // Validate based on story type
    if (validatedData.storyType === 'image' && (!imageFile || imageFile.size === 0)) {
      console.log('Image validation failed: no image file');
      return NextResponse.json(
        { error: 'Image file is required for image stories' },
        { status: 400 }
      );
    }

    if (validatedData.storyType === 'video' && (!videoFile || videoFile.size === 0)) {
      console.log('Video validation failed: no video file');
      return NextResponse.json(
        { error: 'Video file is required for video stories' },
        { status: 400 }
      );
    }

    if (validatedData.storyType === 'text' && !content?.trim()) {
      console.log('Text validation failed: no content');
      return NextResponse.json(
        { error: 'Text content is required for text stories' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    let videoUrl = null;
    let duration = null;

    // Handle text stories first (simplest case)
    if (validatedData.storyType === 'text') {
      console.log('Processing text story');
      
      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      console.log('Creating text story in database...');
      
      try {
        const story = await prisma.story.create({
          data: {
            userId: user.id,
            storyType: 'TEXT',
            content: content.trim(),
            imageUrl: null,
            videoUrl: null,
            duration: null,
            expiresAt,
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
          },
        });

        console.log('Text story created successfully:', story.id);

        return NextResponse.json({
          success: true,
          data: story,
          message: 'Story created successfully',
        });
      } catch (dbError) {
        console.error('Database error creating text story:', dbError);
        return NextResponse.json(
          { error: 'Failed to save story to database', details: dbError.message },
          { status: 500 }
        );
      }
    }

    // Handle image stories
    if (validatedData.storyType === 'image' && imageFile) {
      console.log('Processing image story...');
      
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        console.log('Invalid image type:', imageFile.type);
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        console.log('Image too large:', imageFile.size);
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      try {
        console.log('Creating uploads directory...');
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'stories');
        await mkdir(uploadsDir, { recursive: true });

        // Import Sharp dynamically to avoid issues
        const sharp = (await import('sharp')).default;

        const timestamp = Date.now();
        const filename = `${user.id}_${timestamp}.webp`;
        const filepath = join(uploadsDir, filename);

        console.log('Processing image with Sharp...');
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await sharp(buffer)
          .resize(1080, 1920, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ 
            quality: 85,
            effort: 4 
          })
          .toFile(filepath);

        imageUrl = `/uploads/stories/${filename}`;
        console.log('Image processed successfully:', imageUrl);

      } catch (fileError) {
        console.error('File processing error:', fileError);
        return NextResponse.json(
          { error: 'Failed to process image file', details: fileError.message },
          { status: 500 }
        );
      }
    }

    // Handle video stories
    if (validatedData.storyType === 'video' && videoFile) {
      console.log('Processing video story...');
      
      // Validate file type and size
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov'];
      if (!allowedTypes.includes(videoFile.type)) {
        console.log('Invalid video type:', videoFile.type);
        return NextResponse.json(
          { error: 'Invalid file type. Only MP4, WebM, and MOV are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (videoFile.size > maxSize) {
        console.log('Video too large:', videoFile.size);
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 50MB.' },
          { status: 400 }
        );
      }

      try {
        console.log('Creating uploads directory...');
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'stories');
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const extension = videoFile.name.split('.').pop();
        const filename = `${user.id}_${timestamp}.${extension}`;
        const filepath = join(uploadsDir, filename);

        console.log('Saving video file to:', filepath);
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        videoUrl = `/uploads/stories/${filename}`;
        duration = 15; // Default 15 seconds for stories
        console.log('Video saved successfully:', videoUrl);

      } catch (fileError) {
        console.error('File processing error:', fileError);
        return NextResponse.json(
          { error: 'Failed to process video file', details: fileError.message },
          { status: 500 }
        );
      }
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('Creating story in database with data:', {
      userId: user.id,
      storyType: validatedData.storyType.toUpperCase(),
      content: content?.trim(),
      imageUrl,
      videoUrl,
      duration,
      expiresAt,
    });

    // Create story in database
    try {
      const story = await prisma.story.create({
        data: {
          userId: user.id,
          storyType: validatedData.storyType.toUpperCase() as 'IMAGE' | 'VIDEO' | 'TEXT',
          content: content?.trim(),
          imageUrl,
          videoUrl,
          duration,
          expiresAt,
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
        },
      });

      console.log('Story created successfully:', story.id);

      return NextResponse.json({
        success: true,
        data: story,
        message: 'Story created successfully',
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save story to database', details: dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== Story Creation Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}