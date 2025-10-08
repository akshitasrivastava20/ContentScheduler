/**
 * Simple test worker to verify deployment
 */
export default {
  async scheduled(event, env, ctx) {
    console.log('🚀 NEW WORKER - Cron triggered at:', new Date().toISOString());
    console.log('🔧 Event:', event);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({
        status: 'NEW WORKER ACTIVE',
        timestamp: new Date().toISOString(),
        message: 'This is the new worker code!'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      message: 'NEW WORKER - Content Scheduler is running',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
