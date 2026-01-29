const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDummyData() {
  try {
    console.log('🧹 Clearing dummy data from database...\n');

    // Delete all likes first (foreign key constraints)
    const deletedLikes = await prisma.like.deleteMany({});
    console.log(`✅ Deleted ${deletedLikes.count} likes`);

    // Delete all comments
    const deletedComments = await prisma.comment.deleteMany({});
    console.log(`✅ Deleted ${deletedComments.count} comments`);

    // Delete all follows
    const deletedFollows = await prisma.follow.deleteMany({});
    console.log(`✅ Deleted ${deletedFollows.count} follows`);

    // Delete all posts
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`✅ Deleted ${deletedPosts.count} posts`);

    // Delete all trend winners
    const deletedWinners = await prisma.trendWinner.deleteMany({});
    console.log(`✅ Deleted ${deletedWinners.count} trend winners`);

    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✅ Deleted ${deletedMessages.count} messages`);

    // Delete all reports
    const deletedReports = await prisma.report.deleteMany({});
    console.log(`✅ Deleted ${deletedReports.count} reports`);

    // Delete all user interests
    const deletedInterests = await prisma.userInterest.deleteMany({});
    console.log(`✅ Deleted ${deletedInterests.count} user interests`);

    console.log('\n🎉 All dummy data cleared successfully!');
    console.log('📝 User accounts and trends are kept for login testing');
    console.log('🚫 No posts remain - users will create real content');

  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDummyData();