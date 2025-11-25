import { NextResponse } from 'next/server';
import { copy, del, head, HeadBlobResult } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Interface for TypeScript to know about metadata in head() result
interface HeadBlobResultWithMetadata extends HeadBlobResult {
  metadata?: Record<string, string>;
}

export async function POST(req: Request) {
  console.log("--- Update Name API Called (Using copy() method) ---");
  try {
    // 1. Check Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get data from request body
    const body = await req.json();
    const { videoUrl, newName } = body;

    if (!videoUrl || typeof videoUrl !== 'string' || !newName || typeof newName !== 'string') {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    console.log(`Updating video name to: "${newName}" for URL: ${videoUrl}`);

    // 3. Verify Ownership
    const urlObj = new URL(videoUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Fetch existing metadata to preserve duration
    console.log("Fetching existing metadata...");
    const currentMetadata = (await head(videoUrl)) as HeadBlobResultWithMetadata;
    const existingDuration = currentMetadata.metadata?.durationSecs;

    console.log("Existing metadata:", currentMetadata.metadata);
    console.log("Existing duration:", existingDuration);

    // 5. Use copy() to create a new blob with updated metadata
    // This is more reliable than the delete+reupload approach
    console.log("Creating copy with new metadata...");
    
    const newBlob = await copy(videoUrl, videoUrl, {
      addRandomSuffix: false,
      metadata: {
        customName: newName.trim(),
        durationSecs: existingDuration || undefined,
        updatedAt: Date.now().toString()
      }
    });

    console.log("Copy operation complete. New metadata:", newBlob.metadata);

    return NextResponse.json({ 
      success: true, 
      name: newName.trim(),
      metadata: newBlob.metadata // Return this for debugging
    });

  } catch (e) {
    console.error("Update Error:", e);
    return NextResponse.json(
        { error: 'Update failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
        { status: 500 }
    );
  }
}