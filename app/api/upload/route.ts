import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  try {
    let userId;
    
    // First try to get from session (if user is on the site)
    const authResult = await auth();
    userId = authResult.userId;
    
    console.log('Upload - userId from session:', userId);
    
    // If no session, get from custom header
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

    // Get the file from form data
    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      console.error('Upload - No file in request');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400, headers: responseHeaders }
      );
    }

    console.log('Upload - File received:', file.name, file.size);

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}/vid-${timestamp}-${randomStr}.webm`;

    console.log('Upload - Uploading to blob:', filename);

    const blob = await put(filename, file, {
      access: 'public',
    });

    console.log('Upload - Success:', blob.url);

    // Return success response with CORS headers
    return NextResponse.json({ url: blob.url }, { headers: responseHeaders });
    
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
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new NextResponse(null, { status: 200, headers: responseHeaders });
}