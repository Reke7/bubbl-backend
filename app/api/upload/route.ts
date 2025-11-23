import { NextResponse } from 'next/server';
// Import PutCommandOptions so we can extend it
import { put, PutCommandOptions } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Define a new interface that adds our custom metadata fields
interface PutOptionsWithMetadata extends PutCommandOptions {
  metadata?: {
    durationSecs?: string;
    customName?: string; // Add this new field
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-Video-Duration');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  try {
    // 1. Authentication Check
    let userId;
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      userId = req.headers.get('x-user-id');
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: responseHeaders });
    }

    // 2. Get Files and Duration info from request
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;
    const durationStr = req.headers.get('x-video-duration') || "0";

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file uploaded' }, { status: 400, headers: responseHeaders });
    }

    // 3. Generate a shared base filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const baseFilename = `${userId}/vid-${timestamp}-${randomStr}`;

    // 4. Upload Thumbnail first (if it exists)
    if (thumbnailFile) {
        await put(`${baseFilename}.jpg`, thumbnailFile, {
            access: 'public',
            contentType: 'image/jpeg',
        });
    }

    // 5. Upload Video, attaching duration AND name metadata
    // Use the specific type we defined above
    const videoBlob = await put(`${baseFilename}.webm`, videoFile, {
      access: 'public',
      contentType: 'video/webm',
      metadata: {
        durationSecs: durationStr,
        customName: "Untitled Recording" // Set the default name here
      }
    } as PutOptionsWithMetadata);

    // Return success response with CORS headers
    return NextResponse.json({ url: videoBlob.url }, { headers: responseHeaders });

  } catch (e) {
    console.error("Upload Error:", e);
    return NextResponse.json(
      { error: 'Upload failed: ' + (e instanceof Error ? e.message : 'Unknown error') },
      { status: 500, headers: responseHeaders }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-Video-Duration');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');
  return new NextResponse(null, { status: 200, headers: responseHeaders });
}