#!/bin/bash

# Deploy Content Scheduler to Cloudflare
echo "🚀 Deploying Content Scheduler..."

# Deploy the main app to Cloudflare Pages
echo "📦 Building and deploying main app..."
npm run build

# Deploy the worker
echo "⚙️ Deploying Cloudflare Worker..."
npx wrangler deploy

# Set worker secrets
echo "🔐 Setting up worker secrets..."
echo "Please run these commands manually to set your secrets:"
echo ""
echo "npx wrangler secret put X_API_KEY"
echo "  (Enter: cs_worker_2025_secure_key_789xyz)"
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your LinkedIn app redirect URL to: https://schedulercontent.pages.dev/api/linkedin/callback"
echo "2. Set environment variables in Cloudflare Pages dashboard"
echo "3. Test the worker: https://content-scheduler-worker.your-subdomain.workers.dev/trigger"
