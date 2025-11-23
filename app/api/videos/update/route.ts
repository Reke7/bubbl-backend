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

    // 3. Verify Ownership (Security) & Prepare Path
    const urlObj = new URL(videoUrl);
    // Pathname is like "/user_123/vid-abc.webm"
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // EXTRACT THE DESTINATION PATH
    // Remove the leading "/" from the pathname to get the relative path
    // e.g., converts "/user_123/vid-abc.webm" to "user_123/vid-abc.webm"
    const destinationPath = urlObj.pathname.substring(1);


    // 4. Update Metadata using copy()
    // Pass 'destinationPath' as the second argument instead of 'videoUrl'
    await copy(videoUrl, destinationPath, {
        access: 'public',
        contentType: 'video/webm',
        metadata: {
            customName: newName.trim(),
            // Re-save the duration so it's not lost
            durationSecs: durationSecs ? String(durationSecs) : undefined,
        }
    } as CopyOptionsWithMetadata);

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("Update Error:", e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}