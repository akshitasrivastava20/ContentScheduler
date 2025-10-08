/**
 * Cloudflare Worker for Content Scheduler Cron Jobs
 * Runs every 5 minutes to check and publish scheduled posts
 * Note: Cloudflare enforces minimum intervals for cron jobs
 */

export default {
  async scheduled(event, env, ctx) {
    const timestamp = new Date().toISOString();
    console.log('🕐 [FIXED] Cron trigger fired at:', timestamp);
    console.log('🔧 [FIXED] Event details:', { cron: event.cron, scheduledTime: event.scheduledTime });
    
    try {
      // Use environment variables from wrangler.toml
      const APP_URL = env.APP_URL || 'https://scheduler.akshita.xyz';
      const X_API_KEY = env.X_API_KEY || 'cs_worker_2025_secure_key_789xyz';
      
      console.log('🌐 [FIXED] Making API call to:', `${APP_URL}/api/publish`);
      
      // Call your Vercel app's publish API endpoint
      const response = await fetch(`${APP_URL}/api/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': X_API_KEY,
          'User-Agent': 'ContentScheduler-Worker/1.0-FIXED'
        }
      });

      let result = null;
      let rawResponseText = '';
      
      try {
        rawResponseText = await response.text();
        console.log('📥 [FIXED] Raw API response status:', response.status);
        console.log('📥 [FIXED] Raw API response length:', rawResponseText.length);
        console.log('📥 [FIXED] Raw API response first 200 chars:', rawResponseText.substring(0, 200));
        
        if (rawResponseText && rawResponseText.trim().length > 0) {
          result = JSON.parse(rawResponseText);
        } else {
          result = { error: 'Empty response from API', status: response.status };
        }
      } catch (parseError) {
        console.error('❌ [FIXED] JSON parse error:', parseError.message);
        console.error('❌ [FIXED] Raw response that failed to parse:', rawResponseText);
        result = { 
          error: 'Invalid JSON response', 
          parseError: parseError.message,
          rawResponse: rawResponseText.substring(0, 500),
          status: response.status
        };
      }
      
      if (response.ok && result && !result.error) {
        console.log('✅ [FIXED] Publish check completed:', {
          publishedCount: result.publishedCount,
          totalFound: result.totalFound,
          hasLinkedInToken: result.hasLinkedInToken,
          timestamp: new Date().toISOString()
        });

        if (result.publishedCount > 0) {
          console.log(`🎉 [FIXED] Successfully published ${result.publishedCount} posts!`);
        } else if (result.totalFound === 0) {
          console.log('📝 [FIXED] No posts scheduled for this time');
        } else {
          console.log('⚠️ [FIXED] Posts found but none published - check token or API status');
        }
      } else {
        console.error('❌ [FIXED] Publish API call failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result ? result.error : 'No result object',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('❌ [FIXED] Worker cron job failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/trigger' && request.method === 'POST') {
      console.log('🔧 [FIXED] Manual trigger requested');
      
      try {
        const APP_URL = env.APP_URL || 'https://scheduler.akshita.xyz';
        const X_API_KEY = env.X_API_KEY || 'cs_worker_2025_secure_key_789xyz';
        
        const response = await fetch(`${APP_URL}/api/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': X_API_KEY,
            'User-Agent': 'ContentScheduler-Worker/1.0-FIXED (manual-trigger)'
          }
        });

        let result = null;
        let rawResponseText = '';
        
        try {
          rawResponseText = await response.text();
          if (rawResponseText && rawResponseText.trim().length > 0) {
            result = JSON.parse(rawResponseText);
          } else {
            result = { error: 'Empty response' };
          }
        } catch (parseError) {
          result = { error: 'JSON parse error', message: parseError.message, rawResponse: rawResponseText };
        }
        
        return new Response(JSON.stringify({
          success: true,
          message: '[FIXED] Manual trigger completed',
          result: result,
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });

      } catch (fetchError) {
        console.error('❌ [FIXED] Manual trigger fetch error:', fetchError.message);
        return new Response(JSON.stringify({
          success: false,
          error: '[FIXED] Fetch error: ' + fetchError.message,
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    if (url.pathname === '/status') {
      return new Response(JSON.stringify({
        status: '[FIXED] Worker Active',
        worker: 'content-scheduler-worker-FIXED',
        version: '1.0.0-FIXED',
        timestamp: new Date().toISOString(),
        nextCron: 'Every 5 minutes',
        appUrl: env.APP_URL || 'https://scheduler.akshita.xyz'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      message: '[FIXED] Content Scheduler Worker is running',
      endpoints: {
        '/status': 'Health check',
        '/trigger': 'Manual trigger (POST)'
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
