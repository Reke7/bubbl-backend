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

    // Pathname is like "/user_123/vid-abc.webm". We check if userId matches.
    const pathParts = urlObj.pathname.split('/');
    // pathParts[0] is empty, pathParts[1] is the userId folder
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        console.error(`Security alert: User ${userId} tried to modify video belonging to ${fileOwnerId}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- EXTRACT THE DESTINATION PATH (THE FIX) ---
    // We need the relative path from the root of the bucket.
    // urlObj.pathname gives us "/user_id/filename.webm"
    // We MUST remove the leading "/" to make it relative.
    let destinationPath = urlObj.pathname;
    if (destinationPath.startsWith('/')) {
        destinationPath = destinationPath.substring(1);
    }

    console.log(`Attempting to update metadata for: ${videoUrl}`);
    console.log(`Target destination path: ${destinationPath}`);


    // 4. Update Metadata using copy()
    // We copy the file onto itself to update metadata.
    await copy(videoUrl, destinationPath, {
        access: 'public',
        contentType: 'video/webm', // Good practice to re-state content type
        metadata: {
            customName: newName.trim(),
            // Re-save the duration so it's not lost during the copy
            durationSecs: durationSecs ? String(durationSecs) : undefined,
        }
    } as CopyOptionsWithMetadata); // <-- Cast to our extended interface

    console.log("Metadata update successful");

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("Update Error Detailed:", e);
    // Return a more specific error message if possible
    return NextResponse.json(
        { error: 'Update failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
        { status: 500 }
    );
  }
}