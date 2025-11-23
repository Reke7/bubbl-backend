import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server'; // New import

export async function POST(req: Request) {
  try {
    // 1. Get the User ID from Clerk by AWAITING the promise
    const { userId } = await auth();

    // If no user is logged in, kick them out
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Create a specific folder for this user
    // e.g. "user_2aXy9.../vid-12345.webm"
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}/vid-${timestamp}-${randomStr}.webm`;

    // 3. Upload to that specific folder path
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });

  } catch (e) {
    console.error("Upload Error:", e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}