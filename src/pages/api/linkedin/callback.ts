import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { connectDB } from '../../../lib/mongodb';
import LinkedinToken from '../../../models/LinkedinToken';

// Constant-time comparison to prevent timing attacks
function verifyState(providedState: string, storedState: string): boolean {
  if (!providedState || !storedState) {
    return false;
  }
  
  if (providedState.length !== storedState.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(providedState, 'utf8'),
    Buffer.from(storedState, 'utf8')
  );
}

// Get LinkedIn OAuth configuration from environment
function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing LinkedIn OAuth configuration. Please check environment variables.');
  }
  
  return {
    clientId,
    clientSecret,
    redirectUri,
    scope: 'openid profile email w_member_social'
  };
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string, config: any) {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Get LinkedIn user profile
async function getLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Profile fetch failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;

    // Handle OAuth error
    if (error) {
      console.log('❌ LinkedIn OAuth error:', error);
      return res.redirect('/schedule?error=oauth_error&message=' + encodeURIComponent(error as string));
    }

    // Validate required parameters
    if (!code || !state) {
      console.log('❌ Missing OAuth parameters');
      return res.redirect('/schedule?error=invalid_request&message=Missing code or state parameter');
    }

    // Get stored state from cookie
    const storedState = req.cookies.linkedin_oauth_state;
    
    // Verify state parameter using constant-time comparison to prevent CSRF attacks
    if (!storedState || !verifyState(state as string, storedState)) {
      console.log('❌ Invalid OAuth state - potential CSRF attack');
      return res.redirect('/schedule?error=invalid_state&message=Security validation failed');
    }

    console.log('✅ OAuth state verified successfully');

    // Get LinkedIn configuration
    const config = getLinkedInConfig();

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code as string, config);
    console.log('✅ Access token obtained from LinkedIn');

    // Get user profile
    const profile = await getLinkedInProfile(tokenResponse.access_token);
    console.log('✅ LinkedIn profile retrieved:', profile.name);

    // Connect to database and save token
    await connectDB();
    
    // Remove any existing tokens for this user (single-user app)
    await LinkedinToken.deleteMany({});

    // Save new token
    const tokenDoc = new LinkedinToken({
      accessToken: tokenResponse.access_token,
      expiresIn: tokenResponse.expires_in,
      obtainedAt: new Date(),
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
      userName: profile.name,
      userEmail: profile.email,
      linkedInId: profile.sub
    });

    await tokenDoc.save();
    console.log('✅ LinkedIn token saved to database');

    // Clear the state cookie
    res.setHeader('Set-Cookie', [
      'linkedin_oauth_state=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ]);

    // Redirect back to scheduler with success message
    res.redirect('/schedule?success=linkedin_connected&name=' + encodeURIComponent(profile.name));

  } catch (error) {
    console.error('❌ LinkedIn OAuth callback failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.redirect('/schedule?error=oauth_callback_failed&message=' + encodeURIComponent(message));
  }
}
