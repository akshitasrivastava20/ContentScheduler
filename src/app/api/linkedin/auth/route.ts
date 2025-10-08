import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  try {
    // Generate secure state parameter using crypto.randomBytes
    const stateBuffer = randomBytes(32);
    const state = stateBuffer.toString('base64url');
    
    console.log("???? Generated secure state parameter:", state.substring(0, 10) + "...");

    // LinkedIn OAuth parameters
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      scope: "openid profile email w_member_social",
      state: state,
    });

    const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    console.log("???? LinkedIn OAuth URL generated");
    
    // Create response with redirect and set secure state cookie
    const response = NextResponse.redirect(linkedInAuthURL);
    
    // Set state as HttpOnly cookie for CSRF protection
    response.cookies.set("linkedin_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });

    console.log("???? State cookie set securely");
    
    return response;
    
  } catch (error) {
    console.error("??? LinkedIn OAuth initiation error:", error);
    
    // Get base URL for error redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scheduler.akshita.xyz';
    
    // Redirect to schedule page with error
    return NextResponse.redirect(
      `${baseUrl}/schedule?error=oauth_init_failed&message=${encodeURIComponent('Failed to initiate LinkedIn authentication')}`
    );
  }
}
