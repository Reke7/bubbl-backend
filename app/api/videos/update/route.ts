import { NextResponse } from 'next/server';
// Import CopyCommandOptions so we can extend it
import { copy, CopyCommandOptions } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Define a new interface that adds 'metadata' to the copy options
interface CopyOptionsWithMetadata extends CopyCommandOptions {
  metadata?: Record<string, string | undefined>;
}

export async function POST(req: Request) {
  console.log("--- Update Name API Called ---");
  try {
    // 1. Check Authentication
    const { userId } = await auth();
    if (!userId) {
      console.log("Auth failed: No userId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get data from request body
    const body = await req.json();
    const { videoUrl, newName, durationSecs } = body;

    console.log(`Attempting to update video: ${videoUrl}`);
    console.log(`New name: ${newName}, Duration to preserve: ${durationSecs}`);

    if (!videoUrl || typeof videoUrl !== 'string' || !newName || typeof newName !== 'string') {
        console.log("Validation failed: Missing data");
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 3. Verify Ownership & Prepare Path
    const urlObj = new URL(videoUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        console.error(`Security alert: User ${userId} tried to modify video belonging to ${fileOwnerId}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure path is relative (remove leading slash)
    let destinationPath = urlObj.pathname;
    if (destinationPath.startsWith('/')) {
        destinationPath = destinationPath.substring(1);
    }

    console.log(`Source URL: ${videoUrl}`);
    console.log(`Destination Path for copy: ${destinationPath}`);


    // 4. Update Metadata using copy()
    console.log("Starting Vercel Blob copy operation...");

    await copy(videoUrl, destinationPath, {
        access: 'public',
        // contentType: 'video/webm', // REMOVED THIS LINE - Let Vercel detect it
        metadata: {
            customName: newName.trim(),
            // Re-save the duration so it's not lost
            durationSecs: durationSecs ? String(durationSecs) : undefined,
            updatedAt: Date.now().toString() // Add timestamp to force update
        }
    } as CopyOptionsWithMetadata);

    console.log("Vercel Blob copy operation completed successfully.");

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("CRITICAL UPDATE ERROR:", e);
    // Return the actual error message to the frontend for easier debugging
    return NextResponse.json(
        { error: 'Update failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
        { status: 500 }
    );
  }
}