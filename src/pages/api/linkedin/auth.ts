import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Generate cryptographically secure state parameter for OAuth
function generateSecureState(): string {
  return crypto.randomBytes(32).toString('hex');
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

// Build LinkedIn authorization URL with secure state
function buildAuthUrl(config: any, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: state
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate secure state parameter to prevent CSRF attacks
    const state = generateSecureState();
    
    // Store state in secure HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `linkedin_oauth_state=${state}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=600` // 10 minutes
    ]);

    // Get LinkedIn OAuth configuration
    const config = getLinkedInConfig();
    
    // Build authorization URL
    const authUrl = buildAuthUrl(config, state);
    
    console.log('🔗 LinkedIn OAuth initiated with secure state parameter');
    
    // Redirect to LinkedIn OAuth
    res.redirect(302, authUrl);
    
  } catch (error) {
    console.error('❌ LinkedIn OAuth initiation failed:', error);
    res.status(500).json({ 
      error: 'Failed to initiate LinkedIn OAuth',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
