import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import LinkedinToken from '../../../models/LinkedinToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Find the most recent valid token
    const tokenDoc = await LinkedinToken.findOne({
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (tokenDoc) {
      return res.json({
        connected: true,
        userName: tokenDoc.userName,
        userEmail: tokenDoc.userEmail,
        expiresAt: tokenDoc.expiresAt
      });
    } else {
      return res.json({
        connected: false
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking LinkedIn status:', error);
    return res.status(500).json({
      error: 'Failed to check LinkedIn status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
