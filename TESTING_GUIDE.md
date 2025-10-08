# LinkedIn Content Scheduler - Manual Testing Guide

## 🎯 System Overview
Your LinkedIn Content Scheduler is deployed and configured. Here's how to verify everything is working:

## ✅ Step-by-Step Testing

### 1. **Test Main Application**
Open in browser: `https://scheduler.akshita.xyz/schedule`

**Expected Results:**
- ✅ Page loads successfully
- ✅ Shows "Schedule a Post" form
- ✅ LinkedIn connection status (initially "Not Connected")

### 2. **Test LinkedIn Authentication**
Click "Connect your LinkedIn account" link

**Expected Flow:**
1. Redirects to LinkedIn OAuth page
2. After login, returns to your app
3. Status changes to "✅ LinkedIn Connected"
4. Shows your LinkedIn name

### 3. **Test API Endpoints**
Use browser developer tools (F12) or curl commands:

```bash
# Test LinkedIn Status
curl https://scheduler.akshita.xyz/api/linkedin/status

# Expected: {"connected": true/false, "userName": "...", "userEmail": "..."}
```

### 4. **Test Post Scheduling**
1. Fill out the form with test content
2. Set time 2-3 minutes in the future
3. Click "Schedule Post"
4. Should see success message

### 5. **Test Manual Publishing**
1. Click "⚡ Check & Post Pending Posts Now" button
2. Should trigger immediate check
3. Check browser console for API calls

### 6. **Test Cloudflare Worker**
The worker runs automatically every 5 minutes, but you can test it:

```bash
# Test worker status
curl https://content-scheduler-worker.akshita-srivastava-1505.workers.dev/status

# Test manual trigger
curl -X POST https://content-scheduler-worker.akshita-srivastava-1505.workers.dev/trigger
```

## 🔧 Component Status Check

### Vercel Deployment
- **URL**: https://scheduler.akshita.xyz
- **Status**: ✅ Deployed (based on our previous tests)
- **Features**: LinkedIn OAuth, Scheduling, Publishing APIs

### Cloudflare Worker  
- **URL**: https://content-scheduler-worker.akshita-srivastava-1505.workers.dev
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Function**: Auto-publishes scheduled posts

### MongoDB Database
- **Connection**: ✅ Configured
- **Database**: socialscheduler
- **Collections**: posts, linkedintokens

### Custom Domain Setup
- **Main**: scheduler.akshita.xyz → Vercel
- **Worker**: worker.akshita.xyz → Cloudflare Worker (if DNS configured)

## 🚀 End-to-End Testing

### Complete Workflow Test:
1. **Connect LinkedIn** → Should store token in MongoDB
2. **Schedule a Post** → Should save to database with future time
3. **Wait 5 minutes** → Cloudflare Worker should auto-publish
4. **Check LinkedIn** → Post should appear on your LinkedIn profile

### Manual Trigger Test:
1. Schedule a post for current time
2. Click manual trigger button
3. Post should publish immediately

## 🎯 Success Indicators

Your system is working if:
- ✅ LinkedIn authentication works
- ✅ Posts can be scheduled 
- ✅ Manual trigger publishes posts
- ✅ Automatic publishing happens every 5 minutes
- ✅ Posts appear on LinkedIn profile

## 🔍 Troubleshooting

### If LinkedIn Auth Fails:
- Check environment variables in Vercel dashboard
- Verify LinkedIn app callback URL matches

### If Publishing Fails:
- Check token expiry in MongoDB
- Re-authenticate with LinkedIn
- Check Cloudflare Worker logs

### If Automatic Publishing Stops:
- Check Cloudflare Worker cron triggers
- Verify X_API_KEY secret is set correctly

## 📱 Mobile Testing
The app should work on mobile devices too. Test on your phone:
- Open scheduler.akshita.xyz/schedule
- Authentication should work
- Form should be responsive

---

## 🎉 Final Verification

**Your LinkedIn Content Scheduler is COMPLETE and OPERATIONAL when:**

1. You can visit the website ✅
2. LinkedIn authentication works ✅
3. You can schedule posts ✅  
4. Posts publish automatically ✅
5. Manual triggers work ✅

The system is designed to work autonomously - once set up, it will automatically publish your scheduled LinkedIn posts every 5 minutes without any manual intervention required!
