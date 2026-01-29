const { PrismaClient } = require('@prisma/client');
const { unlink } = require('fs/promises');
const { join } = require('path');

const prisma = new PrismaClient();

async function cleanupExpiredStories() {
  try {
    console.log('🧹 Starting expired stories cleanup...');
    
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
        createdAt: true,
      },
    });

    console.log(`📊 Found ${expiredStories.length} expired stories`);

    if (expiredStories.length === 0) {
      console.log('✅ No expired stories to cleanup');
      return;
    }

    let deletedCount = 0;
    let fileDeleteErrors = 0;

    // Delete each expired story
    for (const story of expiredStories) {
      try {
        console.log(`🗑️  Processing story ${story.id} (created: ${story.createdAt}, expires: ${story.expiresAt})`);
        
        // Delete associated files
        if (story.imageUrl) {
          try {
            const imagePath = join(process.cwd(), 'public', story.imageUrl);
            await unlink(imagePath);
            console.log(`   ✅ Deleted image: ${story.imageUrl}`);
          } catch (fileError) {
            console.warn(`   ⚠️  Failed to delete image ${story.imageUrl}: ${fileError.message}`);
            fileDeleteErrors++;
          }
        }
        
        if (story.videoUrl) {
          try {
            const videoPath = join(process.cwd(), 'public', story.videoUrl);
            await unlink(videoPath);
            console.log(`   ✅ Deleted video: ${story.videoUrl}`);
          } catch (fileError) {
            console.warn(`   ⚠️  Failed to delete video ${story.videoUrl}: ${fileError.message}`);
            fileDeleteErrors++;
          }
        }

        // Delete story from database
        await prisma.story.delete({
          where: { id: story.id },
        });

        deletedCount++;
        console.log(`   ✅ Deleted story ${story.id} from database`);

      } catch (error) {
        console.error(`   ❌ Failed to delete story ${story.id}:`, error.message);
      }
    }

    console.log('🎉 Cleanup completed!');
    console.log(`📈 Statistics:`);
    console.log(`   - Stories deleted: ${deletedCount}`);
    console.log(`   - File errors: ${fileDeleteErrors}`);
    
    // Also mark any remaining expired stories as inactive
    const markInactiveResult = await prisma.story.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    
    if (markInactiveResult.count > 0) {
      console.log(`   - Stories marked inactive: ${markInactiveResult.count}`);
    }
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupExpiredStories();
}

module.exports = { cleanupExpiredStories };