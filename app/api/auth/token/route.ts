import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    
    console.log('Token endpoint - userId:', userId);
    
    if (!userId) {
      console.log('Token endpoint - No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Clerk session token
    const token = await getToken();
    
    console.log('Token endpoint - token generated:', token ? 'Yes' : 'No');
    
    // IMPORTANT: Return BOTH token and userId
    return NextResponse.json({ 
      token: token,
      userId: userId  // Make sure this is included!
    });
    
  } catch (error) {
    console.error('Token endpoint error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}