import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Get user profile with counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        profileImageUrl: true,
        headerImageUrl: true,
        isPrivate: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    
    // Check if user is updating their own profile
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const isPrivate = formData.get('isPrivate') === 'true';
    const profileImageFile = formData.get('profileImage') as File;
    const headerImageFile = formData.get('headerImage') as File;

    console.log('Update request:', { displayName, bio, isPrivate, hasProfileImage: !!profileImageFile, hasHeaderImage: !!headerImageFile });

    let profileImageUrl = user.profileImageUrl;
    let headerImageUrl = user.headerImageUrl;

    // Handle profile image upload
    if (profileImageFile && profileImageFile.size > 0) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(profileImageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (profileImageFile.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}_${timestamp}.webp`; // Always save as WebP
      const filepath = join(uploadsDir, filename);

      // Process and compress profile image with Sharp
      const bytes = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await sharp(buffer)
        .resize(400, 400, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 90,
          effort: 4 
        })
        .toFile(filepath);

      profileImageUrl = `/uploads/profiles/${filename}`;
    }

    // Handle header image upload
    if (headerImageFile && headerImageFile.size > 0) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(headerImageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (headerImageFile.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'headers');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}_${timestamp}.webp`; // Always save as WebP
      const filepath = join(uploadsDir, filename);

      // Process and compress header image with Sharp
      const bytes = await headerImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await sharp(buffer)
        .resize(1500, 500, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 85,
          effort: 4 
        })
        .toFile(filepath);

      headerImageUrl = `/uploads/headers/${filename}`;
    }

    // Update user in database
    const updateData: any = {
      displayName: displayName?.trim() || null,
      bio: bio?.trim() || null,
      isPrivate,
    };

    if (profileImageUrl) {
      updateData.profileImageUrl = profileImageUrl;
    }

    if (headerImageUrl) {
      updateData.headerImageUrl = headerImageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        profileImageUrl: true,
        headerImageUrl: true,
        isPrivate: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}