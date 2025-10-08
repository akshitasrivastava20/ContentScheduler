import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import UserSession from "@/models/UserSession";
import { cookies } from "next/headers";

interface AuthenticatedUser {
  linkedInId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
}

async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    if (!sessionCookie) {
      return null;
    }

    await connectDB();
    
    const session = await UserSession.findOne({
      sessionId: sessionCookie.value,
      isActive: true
    });

    if (!session) {
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    return {
      linkedInId: session.linkedInId,
      userName: session.userName,
      userEmail: session.userEmail,
      sessionId: session.sessionId
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please connect your LinkedIn account first',
        requiresAuth: true
      }, { status: 401 });
    }

    await connectDB();
    
    const { content, scheduledTime } = await req.json();
    
    if (!content || !scheduledTime) {
      return NextResponse.json({
        success: false,
        error: 'Content and scheduled time are required'
      }, { status: 400 });
    }

    // Create post with user information
    const newPost = await Post.create({
      content,
      scheduledTime: new Date(scheduledTime),
      userId: user.linkedInId,
      authorName: user.userName,
      authorEmail: user.userEmail,
      status: 'pending'
    });

    console.log(`✅ Post scheduled by ${user.userName}: "${content.substring(0, 50)}..."`);

    return NextResponse.json({ 
      success: true, 
      post: {
        id: newPost._id,
        content: newPost.content,
        scheduledTime: newPost.scheduledTime,
        authorName: newPost.authorName,
        status: newPost.status
      }
    });

  } catch (error) {
    console.error("❌ Schedule API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to schedule post"
    }, { status: 500 });
  }
}

