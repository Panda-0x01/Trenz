const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateStories() {
  try {
    console.log('🔄 Checking database schema...');
    
    // Test if stories table exists by trying to count stories
    try {
      const count = await prisma.story.count();
      console.log(`✅ Stories table exists with ${count} records`);
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('❌ Stories table does not exist');
        console.log('Please run: npx prisma db push');
        process.exit(1);
      } else {
        throw error;
      }
    }

    // Test if all required columns exist
    try {
      const testStory = await prisma.story.findFirst({
        select: {
          id: true,
          userId: true,
          storyType: true,
          content: true,
          imageUrl: true,
          videoUrl: true,
          duration: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      console.log('✅ All story columns exist');
    } catch (error) {
      console.log('❌ Some story columns are missing');
      console.log('Please run: npx prisma db push');
      process.exit(1);
    }

    // Clean up expired stories
    const expiredCount = await prisma.story.updateMany({
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

    console.log(`🧹 Marked ${expiredCount.count} expired stories as inactive`);
    console.log('✅ Database schema is up to date!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateStories();