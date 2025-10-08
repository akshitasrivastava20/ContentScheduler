import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import LinkedinToken from "../../../models/LinkedinToken";

export async function GET() {
  try {
    await connectDB();
    
    // For now, we'll check if any LinkedIn tokens exist
    // In a real app, you'd check for the current user's token
    const tokenCount = await LinkedinToken.countDocuments();
    
    if (tokenCount > 0) {
      // Get the most recent token to check if it's still valid
      const latestToken = await LinkedinToken.findOne().sort({ createdAt: -1 });
      
      if (latestToken && latestToken.expiresAt > new Date()) {
        return NextResponse.json({
          connected: true,
          userName: latestToken.userProfile?.name || 'LinkedIn User',
          userEmail: latestToken.userProfile?.email || 'No email available'
        });
      }
    }
    
    return NextResponse.json({
      connected: false
    });
    
  } catch (error) {
    console.error('LinkedIn status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check LinkedIn status' },
      { status: 500 }
    );
  }
}
