import { NextApiRequest } from 'next';
import { connectDB } from '../lib/mongodb';
import UserSession from '../models/UserSession';
import LinkedinToken from '../models/LinkedinToken';

export interface AuthenticatedUser {
  linkedInId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
}

export async function getCurrentUser(req: NextApiRequest): Promise<AuthenticatedUser | null> {
  try {
    const sessionCookie = req.cookies.user_session;
    if (!sessionCookie) {
      return null;
    }

    await connectDB();
    
    const session = await UserSession.findOne({
      sessionId: sessionCookie,
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

export async function getUserLinkedInToken(linkedInId: string) {
  await connectDB();
  
  const token = await LinkedinToken.findOne({
    linkedInId: linkedInId,
    expiresAt: { $gt: new Date() }
  });

  return token;
}
