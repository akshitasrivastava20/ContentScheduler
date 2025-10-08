import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Check if request has API key (for cron/external calls) or allow internal calls
    const apiKey = req.headers.get('x-api-key');
    const isInternalCall = !apiKey; // Frontend calls won't have API key
    
    if (apiKey && apiKey !== process.env.X_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the publish endpoint
    const publishResponse = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://scheduler.akshita.xyz' : 'http://localhost:3000'}/api/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include API key when calling publish endpoint
        'X-API-KEY': process.env.X_API_KEY || ''
      },
    });

    const result = await publishResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Manual publish triggered',
      publishResult: result
    });

  } catch (error) {
    console.error("❌ Manual publish trigger failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Manual publish trigger endpoint',
    usage: 'POST with x-api-key header to trigger publishing'
  });
}
