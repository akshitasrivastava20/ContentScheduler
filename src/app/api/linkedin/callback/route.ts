import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import LinkedinToken from "../../../models/LinkedinToken";

export async function GET(req: NextRequest) {
  console.log("???? LinkedIn OAuth callback received");
  
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Helper function for error redirects
  function redirectWithError(req: NextRequest, error: string, description: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scheduler.akshita.xyz';
    return NextResponse.redirect(
      `${baseUrl}/schedule?error=${error}&message=${encodeURIComponent(description)}`
    );
  }

  try {
    // Handle LinkedIn OAuth errors
    if (error) {
      console.error("??? LinkedIn OAuth error:", error, errorDescription);
      return redirectWithError(req, "linkedin_oauth_error", `${error}: ${errorDescription || 'Authorization denied'}`);
    }

    // Check if authorization code exists
    if (!code) {
      console.error("??? No authorization code received");
      return redirectWithError(req, "missing_code", "No authorization code received from LinkedIn");
    }

    // Verify state parameter (CSRF protection)
    console.log("???? Verifying state parameter...");
    
    const storedState = req.cookies.get("linkedin_oauth_state")?.value;
    if (!storedState || storedState !== state) {
      console.error("??? State mismatch - potential CSRF attack");
      return redirectWithError(req, "state_mismatch", "Security validation failed. Please try again.");
    }

    console.log("??? State parameter verified");

    // Exchange authorization code for access token
    console.log("???? Exchanging code for access token...");
    
    const tokenData = {
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    };

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenData),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("??? Token exchange failed:", errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
    }

    const tokenResult = await tokenResponse.json();
    console.log("??? Access token obtained");

    // Get user profile information
    console.log("???? Fetching user profile...");
    
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenResult.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("??? Failed to fetch user profile");
      throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    console.log("??? User profile obtained:", profile.name);

    // Connect to database
    await connectDB();

    // Create unique userId from LinkedIn profile
    const userId = `linkedin_${profile.sub}`;

    // Store or update LinkedIn token
    console.log("???? Storing LinkedIn token...");
    
    await LinkedinToken.findOneAndUpdate(
      { userId: userId },
      {
        userId: userId,
        accessToken: tokenResult.access_token,
        refreshToken: tokenResult.refresh_token,
        expiresIn: tokenResult.expires_in,
        expiresAt: new Date(Date.now() + tokenResult.expires_in * 1000),
        userProfile: {
          linkedInId: profile.sub,
          name: profile.name,
          email: profile.email,
          profilePicture: profile.picture
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log("??? LinkedIn token stored successfully");

    // Create success redirect response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scheduler.akshita.xyz';
    const response = NextResponse.redirect(
      `${baseUrl}/schedule?success=linkedin_connected&user=${encodeURIComponent(profile.name)}&userId=${encodeURIComponent(userId)}`
    );

    // Clear the state cookie
    response.cookies.delete("linkedin_oauth_state");

    return response;

  } catch (error) {
    console.error("??? LinkedIn OAuth callback failed:", error);
    return redirectWithError(req, "callback_error", "Authentication failed. Please try again.");
  }
}
