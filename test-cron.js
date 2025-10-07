/**
 * Test script for local cron functionality
 * Run with: node test-cron.js
 */

const API_KEY = process.env.X_API_KEY;
const APP_URL = 'http://localhost:3000';

async function testPublish() {
  console.log('🕐 Testing scheduled publish at:', new Date().toISOString());
  
  try {
    const headers = {
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
      console.log('✅ Publish test completed:', result);
      console.log(`📊 Stats: ${result.postedCount}/${result.totalFound} posts published`);
      
      if (result.postedCount > 0) {
        console.log('🎉 Posts were published!');
      } else {
        console.log('📅 No posts ready for publishing yet');
      }
    } else {
      console.error('❌ Publish test failed:', result);
    }
  } catch (error) {
    console.error('💥 Error during publish test:', error.message);
  }
}

console.log("🚀 Testing Content Scheduler Publish API...");
testPublish();
