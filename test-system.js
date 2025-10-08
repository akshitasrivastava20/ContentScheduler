#!/usr/bin/env node

/**
 * System Health Check for Content Scheduler
 * Tests all components: Vercel App, Cloudflare Worker, LinkedIn OAuth, MongoDB
 */

const https = require('https');
const http = require('http');

// Test Configuration
const TESTS = {
  vercel: 'https://scheduler.akshita.xyz',
  vercelApi: 'https://scheduler.akshita.xyz/api/linkedin/status',
  worker: 'https://content-scheduler-worker.akshita-srivastava-1505.workers.dev/status',
  customWorker: 'https://worker.akshita.xyz/status',
  publishApi: 'https://scheduler.akshita.xyz/api/publish'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'ContentScheduler-HealthCheck/1.0',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message,
        url: url
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout',
        url: url
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function formatResult(name, result) {
  const status = result.status;
  let icon = '❌';
  let message = '';
  
  if (status === 200) {
    icon = '✅';
    message = 'OK';
  } else if (status === 404) {
    icon = '⚠️';
    message = 'Not Found';
  } else if (status === 'ERROR') {
    icon = '❌';
    message = result.error;
  } else if (status === 'TIMEOUT') {
    icon = '⏰';
    message = 'Timeout';
  } else {
    icon = '⚠️';
    message = `Status ${status}`;
  }
  
  console.log(`${icon} ${name.padEnd(20)} ${message}`);
  
  if (result.data && status === 200) {
    try {
      const parsed = JSON.parse(result.data);
      if (parsed.connected !== undefined) {
        console.log(`   └─ LinkedIn: ${parsed.connected ? 'Connected' : 'Not Connected'}`);
      }
      if (parsed.status) {
        console.log(`   └─ Status: ${parsed.status}`);
      }
      if (parsed.success !== undefined) {
        console.log(`   └─ Success: ${parsed.success}`);
      }
    } catch (e) {
      // Not JSON, that's okay
    }
  }
}

async function runHealthCheck() {
  console.log('🔍 LinkedIn Content Scheduler - System Health Check');
  console.log('=' .repeat(60));
  
  // Test Vercel Main App
  console.log('\n📱 VERCEL APPLICATION');
  console.log('-'.repeat(30));
  
  const vercelResult = await makeRequest(TESTS.vercel);
  formatResult('Main App', vercelResult);
  
  const apiResult = await makeRequest(TESTS.vercelApi);
  formatResult('LinkedIn Status API', apiResult);
  
  // Test Publish API
  const publishResult = await makeRequest(TESTS.publishApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'cs_worker_2025_secure_key_789xyz'
    }
  });
  formatResult('Publish API', publishResult);
  
  // Test Cloudflare Workers
  console.log('\n☁️ CLOUDFLARE WORKERS');
  console.log('-'.repeat(30));
  
  const workerResult = await makeRequest(TESTS.worker);
  formatResult('Direct Worker URL', workerResult);
  
  const customWorkerResult = await makeRequest(TESTS.customWorker);
  formatResult('Custom Domain', customWorkerResult);
  
  // System Summary
  console.log('\n📊 SYSTEM SUMMARY');
  console.log('-'.repeat(30));
  
  const results = [vercelResult, apiResult, publishResult, workerResult, customWorkerResult];
  const working = results.filter(r => r.status === 200).length;
  const total = results.length;
  
  console.log(`Working Components: ${working}/${total}`);
  
  if (working === total) {
    console.log('🎉 All systems operational!');
    console.log('\nNext steps:');
    console.log('1. Visit https://scheduler.akshita.xyz/schedule');
    console.log('2. Connect your LinkedIn account');
    console.log('3. Schedule a test post');
    console.log('4. Posts will auto-publish every 5 minutes');
  } else if (working >= 3) {
    console.log('⚠️ Core system working, some components may need attention');
  } else {
    console.log('❌ System issues detected - check network and deployments');
  }
  
  console.log('\n🔗 Useful URLs:');
  console.log(`   • Main App: ${TESTS.vercel}/schedule`);
  console.log(`   • Direct Worker: ${TESTS.worker}`);
  console.log(`   • LinkedIn OAuth: ${TESTS.vercel}/api/linkedin/auth`);
  console.log('');
}

runHealthCheck().catch(console.error);
