import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "../../models/Post";

export async function POST(req: Request) {
  try {
    await connectDB();

    const now = new Date();
    // Find all posts that are pending and scheduled <= now
    const pendingPosts = await Post.find({
      status: "pending",
      scheduledTime: { $lte: now },
    });

    let successCount = 0;
    for (const post of pendingPosts) {
      try {
        // Simulate posting (replace with LinkedIn API call later)
        console.log(`📤 Publishing: ${post.content} (Scheduled: ${post.scheduledTime})`);
        
        // TODO: Add actual LinkedIn API integration here
        // await postToLinkedIn(post.content);
        
        // Mark as posted
        post.status = "posted";
        post.publishedAt = now;
        await post.save();
        successCount++;
      } catch (postError) {
        console.error(`❌ Failed to publish post ${post._id}:`, postError);
        // Mark as failed but continue with other posts
        post.status = "failed";
        await post.save();
      }
    }

    console.log(`✅ Published ${successCount}/${pendingPosts.length} posts`);
    return NextResponse.json({ 
      success: true, 
      postedCount: successCount,
      totalFound: pendingPosts.length 
    });
  } catch (error) {
    console.error("❌ Publish API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish posts" },
      { status: 500 }
    );
  }
}
