const cron = require('node-cron');
const { cleanupExpiredStories } = require('./cleanup-expired-stories');

// Setup automatic cleanup every hour
function setupStoryCleanup() {
  console.log('🕐 Setting up automatic story cleanup...');
  
  // Run cleanup every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled story cleanup...');
    try {
      await cleanupExpiredStories();
    } catch (error) {
      console.error('❌ Scheduled cleanup failed:', error);
    }
  });
  
  // Also run cleanup every 15 minutes for more frequent cleanup
  cron.schedule('*/15 * * * *', async () => {
    console.log('🔄 Running frequent story cleanup check...');
    try {
      await cleanupExpiredStories();
    } catch (error) {
      console.error('❌ Frequent cleanup failed:', error);
    }
  });
  
  console.log('✅ Story cleanup scheduled:');
  console.log('   - Full cleanup: Every hour');
  console.log('   - Quick check: Every 15 minutes');
}

// Export for use in main application
module.exports = { setupStoryCleanup };

// Run if called directly
if (require.main === module) {
  setupStoryCleanup();
  
  // Keep the process running
  console.log('🚀 Story cleanup service is running...');
  console.log('Press Ctrl+C to stop');
}