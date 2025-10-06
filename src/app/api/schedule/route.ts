import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "../../models/Post";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newPost = await Post.create(body);
    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error("❌ Schedule API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to schedule post" },
      { status: 500 }
    );
  }
}

