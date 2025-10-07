import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "../../models/Post";

// Simple LinkedIn integration - OAuth routes implemented separately

export async function POST() {
  try {
    await connectDB();

    // Get posts scheduled for now (within last 5 minutes to account for cron timing)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const now = new Date();
    
    const scheduledPosts = await Post.find({
      scheduledTime: { $gte: fiveMinutesAgo, $lte: now },
      published: false
    });

    console.log(`� Found ${scheduledPosts.length} posts to publish`);

    console.log(`🔗 LinkedIn integration: OAuth routes available at /api/linkedin/*`);

    const results = [];
    
    for (const post of scheduledPosts) {
      try {
        console.log(`📤 Publishing: "${post.content.substring(0, 50)}..."`);
        
        // For now, simulate posting (LinkedIn integration via Pages API routes)
        console.log(`🎭 Simulating LinkedIn post - OAuth integration ready`);
        
        // Mark as published
        post.published = true;
        post.publishedAt = new Date();
        await post.save();
        
        console.log(`✅ Post marked as published (simulation mode)`);
        
        results.push({
          id: post._id,
          success: true,
          linkedIn: 'simulated',
          message: 'LinkedIn OAuth ready - simulation mode active'
        });
        
      } catch (error) {
        console.error(`❌ Failed to publish post ${post._id}:`, error);
        results.push({
          id: post._id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount: results.filter(r => r.success).length,
      totalFound: scheduledPosts.length,
      linkedInOAuthReady: true,
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
