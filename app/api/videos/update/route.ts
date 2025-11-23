import { NextResponse } from 'next/server';
// 1. Import PutCommandOptions so we can extend it
import { put, del, head, HeadBlobResult, PutCommandOptions } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// 2. Define interface for PUT options to include metadata
interface PutOptionsWithMetadata extends PutCommandOptions {
  metadata?: Record<string, string | undefined>;
}

// Interface for TypeScript to know about metadata in head() result
interface HeadBlobResultWithMetadata extends HeadBlobResult {
  metadata?: Record<string, string>;
}

export async function POST(req: Request) {
  console.log("--- Update Name API Called (The 'Replace' Strategy - Final TS Fix) ---");
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

    console.log(`Replacing video entry to update name: "${newName}" for URL: ${videoUrl}`);

    // 3. Verify Ownership & Prepare Path
    const urlObj = new URL(videoUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get relative destination path (e.g., "user_123/vid-abc.webm")
    let destinationPath = urlObj.pathname;
    if (destinationPath.startsWith('/')) {
        destinationPath = destinationPath.substring(1);
    }


    // --- THE NEW STRATEGY STARTS HERE ---

    // A. Fetch existing metadata to preserve duration
    console.log("Fetching existing metadata...");
    // Use our custom Head interface here
    const currentMetadata = (await head(videoUrl)) as HeadBlobResultWithMetadata;
    const existingDuration = currentMetadata.metadata?.durationSecs;

    // B. Download the actual file content from Vercel Blob into memory
    console.log("Downloading file into memory...");
    const fileResponse = await fetch(videoUrl);
    if (!fileResponse.ok) throw new Error("Failed to fetch existing video file");
    const fileBuffer = await fileResponse.arrayBuffer();


    // C. Delete the old file
    console.log("Deleting old file...");
    await del(videoUrl);


    // D. Upload the file back to the same path with NEW metadata
    console.log("Uploading file with new metadata...");
    await put(destinationPath, fileBuffer, {
        access: 'public',
        contentType: 'video/webm',
        addRandomSuffix: false, // Ensure we reuse the exact same path
        metadata: {
            customName: newName.trim(),
            // Ensure duration is preserved. If none existed, keep it undefined.
            durationSecs: existingDuration || undefined,
            updatedAt: Date.now().toString() // Helps bust caches
        }
    // 3. Cast to our new Put interface here
    } as PutOptionsWithMetadata);

    console.log("Replacement operation complete.");

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("Update Error:", e);
    return NextResponse.json(
        { error: 'Update failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
        { status: 500 }
    );
  }
}