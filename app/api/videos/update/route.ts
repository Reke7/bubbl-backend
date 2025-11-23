import { NextResponse } from 'next/server';
// Import CopyCommandOptions so we can extend it
import { copy, CopyCommandOptions } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Define a new interface that adds 'metadata' to the copy options
interface CopyOptionsWithMetadata extends CopyCommandOptions {
  metadata?: Record<string, string | undefined>;
}

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get data from request body
    const body = await req.json();
    const { videoUrl, newName, durationSecs } = body;

    if (!videoUrl || typeof videoUrl !== 'string' || !newName || typeof newName !== 'string') {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 3. Verify Ownership (Security)
    const urlObj = new URL(videoUrl);
    // Path is like /userId/video-id.webm. We check if userId matches.
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Update Metadata using copy()
    // We copy the file onto itself with new metadata.
    // IMPORTANT: We must re-provide ALL metadata we want to keep, including duration.
    await copy(videoUrl, videoUrl, {
        access: 'public',
        contentType: 'video/webm', // Good practice to re-state content type
        metadata: {
            customName: newName.trim(),
            // Re-save the duration so it's not lost
            durationSecs: durationSecs ? String(durationSecs) : undefined,
        }
    } as CopyOptionsWithMetadata); // <-- Cast to our new interface

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("Update Error:", e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}