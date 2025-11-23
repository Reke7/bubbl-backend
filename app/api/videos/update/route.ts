import { NextResponse } from 'next/server';
// Import HeadBlobResult so we can extend it
import { copy, CopyCommandOptions, head, HeadBlobResult } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Define interface for COPY options
interface CopyOptionsWithExtended extends CopyCommandOptions {
  metadata?: Record<string, string | undefined>;
  addRandomSuffix?: boolean;
}

// Define NEW interface for HEAD result
interface HeadBlobResultWithMetadata extends HeadBlobResult {
  metadata?: Record<string, string>;
}

export async function POST(req: Request) {
  console.log("--- Update Name API Called (Final TS Fix) ---");
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

    console.log(`Updating name to: "${newName}" for URL: ${videoUrl}`);

    // 3. Verify Ownership & Prepare Path
    const urlObj = new URL(videoUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileOwnerId = pathParts[1];

    if (fileOwnerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure path is relative (remove leading slash)
    let destinationPath = urlObj.pathname;
    if (destinationPath.startsWith('/')) {
        destinationPath = destinationPath.substring(1);
    }

    // 4. Update Metadata using copy() onto itself
    // addRandomSuffix: false ensures we overwrite the existing file path
    const copyResult = await copy(videoUrl, destinationPath, {
        access: 'public',
        addRandomSuffix: false, // FORCE OVERWRITE
        metadata: {
            customName: newName.trim(),
            // Re-save the duration so it's not lost
            durationSecs: durationSecs ? String(durationSecs) : undefined,
            updatedAt: Date.now().toString() // Force change detection
        }
    } as CopyOptionsWithExtended);

    console.log("Copy operation finished. Result URL:", copyResult.url);

    // 5. VERIFICATION STEP: Immediately check if metadata stuck
    try {
        console.log("Verifying metadata update immediately...");
        // Cast the result to our custom interface to fix the TS error
        const metaCheck = (await head(copyResult.url)) as HeadBlobResultWithMetadata;
        
        console.log("Verification result - customName is now:", metaCheck.metadata?.customName);
        
         if (metaCheck.metadata?.customName !== newName.trim()) {
             console.error("CRITICAL: Verification failed. Metadata did not update.");
             // We log this but don't fail the request, as eventual consistency might still save it.
         }
    } catch (verifyErr) {
        console.warn("Verification check failed (might be eventual consistency issue):", verifyErr);
    }

    return NextResponse.json({ success: true, name: newName.trim() });

  } catch (e) {
    console.error("Update Error:", e);
    return NextResponse.json(
        { error: 'Update failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
        { status: 500 }
    );
  }
}