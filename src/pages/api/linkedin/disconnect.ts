import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import LinkedinToken from '../../../models/LinkedinToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Remove all LinkedIn tokens (single-user app)
    const result = await LinkedinToken.deleteMany({});
    
    console.log('✅ LinkedIn tokens removed from database:', result.deletedCount);
    
    return res.json({
      success: true,
      message: 'LinkedIn disconnected successfully',
      tokensRemoved: result.deletedCount
    });
    
  } catch (error) {
    console.error('❌ Error disconnecting LinkedIn:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to disconnect LinkedIn',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
