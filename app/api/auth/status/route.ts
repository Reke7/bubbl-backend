import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  // 1. Check if there is an active session cookies
  const { userId } = await auth();

  if (!userId) {
    // Not logged in
    return NextResponse.json({ isAuthenticated: false });
  }

  // 2. Get user details (like their email or name) for the UI
  const user = await currentUser();

  // Logged in! Return their info.
  return NextResponse.json({
    isAuthenticated: true,
    user: {
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress,
      firstName: user?.firstName,
    }
  });
}