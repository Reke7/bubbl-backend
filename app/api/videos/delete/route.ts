import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the URL to delete from the request body
    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
        return NextResponse.json({ error: 'Invalid Video URL' }, { status: 400 });
    }

    // 3. SECURITY CRITICAL: Verify ownership
    // Parse the URL to ensure the file path starts with the current userId.
    // URL looks like: https://store.../userId/vid-....webm
    const urlObj = new URL(videoUrl);
    // pathname will be like "/userId/vid-....webm"
    const pathParts = urlObj.pathname.split('/');
    // pathParts[0] is empty, pathParts[1] should be userId
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        console.error(`Security Alert: User ${userId} tried to delete file belonging to ${fileOwnerId}`);
        // Return a generic forbidden error don't leak details
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Derive the thumbnail URL
    const thumbnailUrl = videoUrl.replace('.webm', '.jpg');

    console.log(`Deleting video for user ${userId}:`, videoUrl);

    // 5. Delete both files from Vercel Blob
    // We use Promise.all to do them in parallel
    await Promise.all([
        del(videoUrl),
        del(thumbnailUrl)
    ]);

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error("Delete Error:", e);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}