import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LinkedinToken from "@/app/models/LinkedinToken";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Processing LinkedIn disconnect request...");
    
    await connectDB();
    
    // For now, we'll delete all LinkedIn tokens (simple approach)
    // In a multi-user system, you'd identify the specific user first
    const deletedTokens = await LinkedinToken.deleteMany({});
    
    console.log(`🗑️ Removed ${deletedTokens.deletedCount} LinkedIn token(s)`);
    console.log("✅ LinkedIn disconnect completed successfully");

    // Create response and clear any session cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully disconnected from LinkedIn' 
    });

    // Clear session-related cookies for good measure
    response.cookies.delete('user_session');
    response.cookies.delete('linkedin_oauth_state');

    return response;

  } catch (error) {
    console.error("❌ LinkedIn disconnect error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to disconnect from LinkedIn' 
      }, 
      { status: 500 }
    );
  }
}
