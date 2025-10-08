import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Post from "../../../models/Post";
import LinkedinToken from "../../../models/LinkedinToken";

// Function to get valid LinkedIn token for a specific user
async function getLinkedInTokenForUser(linkedInId: string) {
  const token = await LinkedinToken.findOne({
    linkedInId: linkedInId,
    expiresAt: { $gt: new Date() }
  });

  return token;
}

// Function to post to LinkedIn
async function postToLinkedIn(content: string, accessToken: string, authorName?: string) {
  try {
    // First, get the user's LinkedIn ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`Failed to get profile: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    const personId = profile.sub;

    // Post to LinkedIn
    const postData = {
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      linkedInId: result.id,
      data: result
    };

  } catch (error) {
    console.error('❌ LinkedIn posting failed:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Verify API key for security (optional but recommended)
    const apiKey = request.headers.get('X-API-Key');
    const expectedKey = process.env.X_API_KEY || 'cs_worker_2025_secure_key_789xyz';
    
    if (apiKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get posts scheduled for now or overdue (wider time range to catch posts)
    const now = new Date();
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000); // Allow 5 minutes future
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    console.log(`🕐 Current time: ${now.toISOString()}`);
    console.log(`🔍 Looking for posts between ${oneDayAgo.toISOString()} and ${fiveMinutesFromNow.toISOString()}`);

    // First, clean up any invalid posts (missing required fields)
    try {
      const invalidPosts = await Post.find({
        $or: [
          { authorName: { $exists: false } },
          { authorName: null },
          { authorName: "" },
          { userId: { $exists: false } },
          { userId: null },
          { userId: "" }
        ]
      });
      
      if (invalidPosts.length > 0) {
        console.log(`🧹 Cleaning up ${invalidPosts.length} invalid posts`);
        await Post.deleteMany({
          $or: [
            { authorName: { $exists: false } },
            { authorName: null },
            { authorName: "" },
            { userId: { $exists: false } },
            { userId: null },
            { userId: "" }
          ]
        });
      }
    } catch (cleanupError) {
      console.log(`⚠️ Cleanup warning:`, cleanupError);
    }
    
    const scheduledPosts = await Post.find({
      scheduledTime: { $gte: oneDayAgo, $lte: fiveMinutesFromNow },
      status: "pending",
      authorName: { $exists: true, $nin: [null, ""] },
      userId: { $exists: true, $nin: [null, ""] }
    }).sort({ scheduledTime: 1 }); // Process oldest first

    console.log(`📝 Found ${scheduledPosts.length} valid posts to publish`);

    const results = [];
    
    for (const post of scheduledPosts) {
      try {
        console.log(`📤 Publishing post by ${post.authorName}: "${post.content.substring(0, 50)}..."`);
        
        // Get LinkedIn token for this specific user
        const linkedInToken = await getLinkedInTokenForUser(post.userId);
        
        let linkedInResult = null;
        
        if (linkedInToken) {
          try {
            linkedInResult = await postToLinkedIn(post.content, linkedInToken.accessToken, post.authorName);
            console.log(`✅ Posted to LinkedIn for ${post.authorName}: ${linkedInResult.linkedInId}`);
          } catch (linkedInError) {
            console.error(`❌ LinkedIn posting failed for ${post.authorName} (post ${post._id}):`, linkedInError);
            // Continue with marking as failed rather than throwing
          }
        } else {
          console.log(`⚠️ No valid LinkedIn token found for user ${post.authorName} (${post.userId})`);
        }

        // Update post status
        if (linkedInResult?.success) {
          post.status = "posted";
          post.publishedAt = new Date();
        } else {
          post.status = "failed";
        }
        
        await post.save();
        
        results.push({
          id: post._id,
          userId: post.userId,
          authorName: post.authorName,
          success: linkedInResult?.success || false,
          linkedIn: linkedInResult ? 'posted' : (linkedInToken ? 'failed' : 'no_token'),
          linkedInId: linkedInResult?.linkedInId,
          message: linkedInResult ? `Posted successfully to ${post.authorName}'s LinkedIn` : 
                   (linkedInToken ? `Posting failed for ${post.authorName}` : 
                   `No LinkedIn token for ${post.authorName}`)
        });
        
      } catch (error) {
        console.error(`❌ Failed to process post ${post._id}:`, error);
        
        // Mark post as failed
        post.status = "failed";
        await post.save();
        
        results.push({
          id: post._id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const publishedCount = results.filter(r => r.success).length;
    const uniqueUsers = new Set(scheduledPosts.map(p => p.userId)).size;
    
    return NextResponse.json({
      success: true,
      publishedCount: publishedCount,
      totalFound: scheduledPosts.length,
      uniqueUsers: uniqueUsers,
      multiUserSystem: true,
      results
    });

  } catch (error) {
    console.error("❌ Publish endpoint error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
