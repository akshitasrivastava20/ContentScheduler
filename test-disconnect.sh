#!/bin/bash

echo "🔧 Testing LinkedIn Disconnect API Endpoint"
echo "=============================================="

echo "📍 Testing Production URL: https://scheduler.akshita.xyz/api/linkedin/disconnect"

# Test the disconnect endpoint
echo "🔄 Making POST request..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST \
    -H "Content-Type: application/json" \
    https://scheduler.akshita.xyz/api/linkedin/disconnect)

# Extract HTTP status
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

echo "📊 Response Status: $HTTP_STATUS"
echo "📄 Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

# Check if it's a success
if [ "$HTTP_STATUS" = "200" ]; then
    echo ""
    echo "✅ SUCCESS: Disconnect endpoint is working correctly!"
    echo "   - Returns HTTP 200"
    echo "   - Endpoint exists and responds to POST requests"
    echo "   - No longer returns 405 Method Not Allowed"
else
    echo ""
    echo "❌ Status Code: $HTTP_STATUS"
    if [ "$HTTP_STATUS" = "405" ]; then
        echo "   - Still getting 405 Method Not Allowed"
        echo "   - Endpoint may not be properly deployed"
    fi
fi

echo ""
echo "🔗 You can also test this manually by:"
echo "   1. Visit: https://scheduler.akshita.xyz/test-api.html"
echo "   2. Click 'Test Production API'"
echo "   3. Check browser console for results"
