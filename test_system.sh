#!/bin/bash

# Content Scheduler System Test Script
echo "🚀 Testing LinkedIn Content Scheduler System"
echo "=============================================="
echo ""

# Test 1: Main Application
echo "1️⃣ Testing Main Application..."
response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://scheduler.akshita.xyz/" 2>/dev/null || echo "TIMEOUT")
if [ "$response" = "200" ]; then
    echo "✅ Main app accessible: https://scheduler.akshita.xyz/"
else
    echo "❌ Main app not accessible (HTTP $response)"
fi
echo ""

# Test 2: LinkedIn Status API
echo "2️⃣ Testing LinkedIn Status API..."
status_response=$(curl -s --connect-timeout 10 "https://scheduler.akshita.xyz/api/linkedin/status" 2>/dev/null || echo "TIMEOUT")
if [[ $status_response == *"connected"* ]]; then
    echo "✅ LinkedIn Status API working"
    echo "📊 Response: $status_response"
else
    echo "❌ LinkedIn Status API issue"
fi
echo ""

# Test 3: Cloudflare Worker (Direct URL)
echo "3️⃣ Testing Cloudflare Worker..."
worker_response=$(curl -s --connect-timeout 10 "https://content-scheduler-worker.akshita-srivastava-1505.workers.dev/status" 2>/dev/null || echo "TIMEOUT")
if [[ $worker_response == *"healthy"* ]]; then
    echo "✅ Cloudflare Worker accessible"
    echo "📊 Response: $worker_response"
else
    echo "❌ Cloudflare Worker not accessible"
fi
echo ""

# Test 4: Custom Worker Domain
echo "4️⃣ Testing Custom Worker Domain..."
custom_response=$(curl -s --connect-timeout 10 "https://worker.akshita.xyz/status" 2>/dev/null || echo "TIMEOUT")
if [[ $custom_response == *"healthy"* ]]; then
    echo "✅ Custom worker domain working: https://worker.akshita.xyz"
else
    echo "⚠️ Custom worker domain still propagating (this is normal if DNS was just added)"
fi
echo ""

# Test 5: Manual Trigger Test
echo "5️⃣ Testing Manual Publish Trigger..."
trigger_response=$(curl -s --connect-timeout 10 -X POST "https://scheduler.akshita.xyz/api/trigger-publish" 2>/dev/null || echo "TIMEOUT")
if [[ $trigger_response == *"success"* ]]; then
    echo "✅ Manual trigger working"
else
    echo "⚠️ Manual trigger response: $trigger_response"
fi
echo ""

echo "🏁 System Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit https://scheduler.akshita.xyz/schedule"
echo "   2. Connect your LinkedIn account"
echo "   3. Schedule a test post for 5+ minutes from now"
echo "   4. Wait and watch it automatically publish!"
echo ""
echo "🔍 Monitor worker activity:"
echo "   npx wrangler tail --format pretty"
echo ""
