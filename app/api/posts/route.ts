import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
  textContent: z.string().max(5000).optional(),
  trendId: z.string().transform(Number),
  postType: z.enum(['image', 'video', 'text']).default('image'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    const user = await getUserFromRequest(request);
    
    // Get posts with engagement data
    const posts = await prisma.post.findMany({
      where: {
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
        ...(user && {
          likes: {
            where: { userId: user.id },
            select: { id: true },
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({
      where: {
        isDeleted: false,
      },
    });

    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: user ? post.likes?.length > 0 : false,
      likes: undefined, // Remove the likes array from response
    }));

    return NextResponse.json({
      success: true,
      data: {
        data: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const caption = formData.get('caption') as string;
    const textContent = formData.get('textContent') as string;
    const trendId = formData.get('trendId') as string;
    const postType = formData.get('postType') as string || 'image';
    const imageFile = formData.get('image') as File;
    const videoFile = formData.get('video') as File;

    console.log('Post creation request:', { postType, caption, trendId, hasImage: !!imageFile, hasVideo: !!videoFile });

    // Validate form data
    const validatedData = createPostSchema.parse({
      caption: caption || undefined,
      textContent: textContent || undefined,
      trendId,
      postType,
    });

    // Validate based on post type
    if (validatedData.postType === 'image' && !imageFile) {
      return NextResponse.json(
        { error: 'Image file is required for image posts' },
        { status: 400 }
      );
    }

    if (validatedData.postType === 'video' && !videoFile) {
      return NextResponse.json(
        { error: 'Video file is required for video posts' },
        { status: 400 }
      );
    }

    if (validatedData.postType === 'text' && !validatedData.textContent?.trim()) {
      return NextResponse.json(
        { error: 'Text content is required for text posts' },
        { status: 400 }
      );
    }

    // Validate trend exists and is active
    const trend = await prisma.trend.findUnique({
      where: { id: validatedData.trendId },
    });

    if (!trend || !trend.isActive || new Date(trend.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'Trend not found or no longer active' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    let videoUrl = null;
    let videoDuration = null;

    // Handle image upload for image posts
    if (validatedData.postType === 'image' && imageFile) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'posts');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${user.id}_${timestamp}.webp`; // Always save as WebP for better compression
      const filepath = join(uploadsDir, filename);

      // Process and compress image with Sharp
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await sharp(buffer)
        .resize(1080, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85,
          effort: 4 
        })
        .toFile(filepath);

      imageUrl = `/uploads/posts/${filename}`;
    }

    // Handle video upload for video posts
    if (validatedData.postType === 'video' && videoFile) {
      // Validate file type and size
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(videoFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only MP4, WebM, MOV, and AVI are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (videoFile.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 50MB.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'posts');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const extension = videoFile.name.split('.').pop();
      const filename = `${user.id}_${timestamp}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Save video file (no compression for now, could add ffmpeg later)
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      videoUrl = `/uploads/posts/${filename}`;
      
      // Note: Video duration validation should be done on the client side
      // For server-side validation, we'd need ffmpeg or similar
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        trendId: validatedData.trendId,
        postType: validatedData.postType.toUpperCase() as 'IMAGE' | 'VIDEO' | 'TEXT',
        caption: validatedData.caption,
        textContent: validatedData.textContent,
        imageUrl,
        videoUrl,
        videoDuration,
        imageAltText: validatedData.caption || (validatedData.postType === 'text' ? 'Text post' : `Post by ${user.username}`),
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
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully',
    });

  } catch (error) {
    console.error('Create post error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}