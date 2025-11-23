import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // 1. Identify the user by AWAITING the promise
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ask Vercel Blob: "Give me all files that start with my UserID"
    const { blobs } = await list({
      prefix: userId + '/', // This filters the results to ONLY this user's folder
      limit: 20, // Pagination (optional, keeps it fast)
    });

    // 3. Return the list
    return NextResponse.json({ videos: blobs });

  } catch (e) {
    console.error("List Error:", e);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}