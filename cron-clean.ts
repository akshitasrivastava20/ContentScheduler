/**
 * Local Cron Manager for testing scheduled publishing
 * This simulates what the Cloudflare Worker will do
 * 
 * Usage:
 *   node -r ts-node/register cron.ts  # Run once
 *   npm run cron                      # If you add it to package.json scripts
 */

const API_KEY = process.env.X_API_KEY;
const APP_URL = process.env.NODE_ENV === 'production' 
  ? 'https://schedulercontent.pages.dev'
  : 'http://localhost:3000';

async function runScheduledPublish() {
  console.log('🕐 Running scheduled publish check at:', new Date().toISOString());
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`${APP_URL}/api/publish`, {
      method: 'POST',
      headers,
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Publish check completed:', result);
      console.log(`📊 Stats: ${result.postedCount}/${result.totalFound} posts published`);
      
      if (result.postedCount > 0) {
        console.log('🎉 Posts were published!');
      } else {
        console.log('📅 No posts ready for publishing yet');
      }
    } else {
      console.error('❌ Publish check failed:', result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Error during publish check:', errorMessage);
  }
}

// Export for use in other modules
export { runScheduledPublish };

// Run immediately if this file is executed directly
if (require.main === module) {
  console.log("🚀 Content Scheduler Cron Manager Starting...");
  console.log(`📡 Using API base URL: ${APP_URL}`);
  runScheduledPublish()
    .then(() => {
      console.log('✅ Cron job completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cron job failed:', error);
      process.exit(1);
    });
}
