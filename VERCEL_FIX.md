# 🔧 Vercel Deployment Fix Guide

## ❌ Issue: Failed Deployments

Your Vercel deployments are failing because the required environment variables are missing in production.

## ✅ Required Environment Variables

You need to set these in your Vercel dashboard:

### 1. MongoDB Connection
```
MONGODB_URI=your_mongodb_connection_string
```

### 2. LinkedIn OAuth Credentials
```
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret  
LINKEDIN_REDIRECT_URI=https://scheduler.akshita.xyz/api/linkedin/callback
```

### 3. Worker API Key
```
X_API_KEY=cs_worker_2025_secure_key_789xyz
```

## 🚀 How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your "content-scheduler" project
3. Go to Settings → Environment Variables
4. Add each variable above with their values
5. Deploy → Redeploy (trigger new deployment)

### Method 2: Vercel CLI
```bash
# Set each environment variable
vercel env add MONGODB_URI
vercel env add LINKEDIN_CLIENT_ID  
vercel env add LINKEDIN_CLIENT_SECRET
vercel env add LINKEDIN_REDIRECT_URI
vercel env add X_API_KEY

# Redeploy
vercel --prod
```

### Method 3: Import from .env.local
If you have a `.env.local` file with all variables:
```bash
vercel env pull .env.production
vercel env push .env.local
```

## 🔍 Verification Steps

After adding environment variables:

1. **Trigger Redeploy**: 
   - Dashboard → Deployments → Three dots → Redeploy
   
2. **Check Build Logs**:
   - Look for successful MongoDB connection: "✅ MongoDB connected"
   - Verify no "undefined" errors for environment variables

3. **Test Endpoints**:
   - Visit: https://scheduler.akshita.xyz/api/linkedin/status
   - Should return: `{"connected":false}` (not 500 error)

## 🎯 Expected Result

Once environment variables are set correctly:
- ✅ Deployments should succeed
- ✅ MongoDB connection established  
- ✅ LinkedIn OAuth flow works
- ✅ API endpoints return proper responses
- ✅ No more 500/404 errors

## 🚨 Security Note

Never commit `.env.production` or `.env.local` files to git (they're already in .gitignore). Always use Vercel's environment variable system for production secrets.

---

**Next Step**: Add the environment variables to Vercel, then trigger a new deployment. The system should work perfectly after this!
