import { NextResponse } from 'next/server';
// Need to import PutCommandOptions to extend it
import { put, PutCommandOptions } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Define a new interface that adds 'metadata' to the existing options
interface PutOptionsWithMetadata extends PutCommandOptions {
  metadata?: Record<string, string>;
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // Added X-Video-Duration to allowed headers
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-Video-Duration');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  try {
    // 1. Authentication Check
    let userId;
    const authResult = await auth();
    userId = authResult.userId;

    console.log('Upload - userId from session:', userId);

    if (!userId) {
      userId = req.headers.get('x-user-id');
      console.log('Upload - userId from header:', userId);
    }

    if (!userId) {
      console.error('Upload - No userId found');
      return NextResponse.json(
        { error: 'Unauthorized - No user ID' },
        { status: 401, headers: responseHeaders }
      );
    }

    // 2. Get Files and Duration info from request
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    // Try to get thumbnail file
    const thumbnailFile = formData.get('thumbnail') as File;
    // Get duration header (default to "0" if missing)
    const durationStr = req.headers.get('x-video-duration') || "0";

    if (!videoFile) {
      console.error('Upload - No video file in request');
      return NextResponse.json(
        { error: 'No video file uploaded' },
        { status: 400, headers: responseHeaders }
      );
    }

    console.log('Upload - Video received:', videoFile.name, videoFile.size);
    if (thumbnailFile) {
        console.log('Upload - Thumbnail received:', thumbnailFile.name, thumbnailFile.size);
    }
    console.log('Upload - Duration received:', durationStr);


    // 3. Generate a shared base filename (without extension)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const baseFilename = `${userId}/vid-${timestamp}-${randomStr}`;

    // 4. Upload Thumbnail first (if it exists)
    if (thumbnailFile) {
        console.log('Upload - Uploading thumbnail .jpg');
        await put(`${baseFilename}.jpg`, thumbnailFile, {
            access: 'public',
            contentType: 'image/jpeg',
            // No specific metadata needed for thumbnail currently
        });
    }

    // 5. Upload Video, attaching duration metadata
    console.log('Upload - Uploading video .webm with metadata');
    // Use the specific type we defined above
    const videoBlob = await put(`${baseFilename}.webm`, videoFile, {
      access: 'public',
      contentType: 'video/webm',
      metadata: {
        durationSecs: durationStr
      }
    } as PutOptionsWithMetadata);

    console.log('Upload - Success:', videoBlob.url);

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
  // Added X-Video-Duration to allowed headers here too
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-Video-Duration');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new NextResponse(null, { status: 200, headers: responseHeaders });
}