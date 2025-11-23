import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // 1. Get the origin from the request headers
  const origin = req.headers.get('origin');

  // 2. Create a base response with CORS headers
  // You might want to validate the origin against a list of allowed domains for better security.
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*'); // Set to the requesting origin
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true'); // Required for cookies

  try {
    // 3. Perform authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: responseHeaders }
      );
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400, headers: responseHeaders }
      );
    }

    // 4. Upload to Vercel Blob
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}/vid-${timestamp}-${randomStr}.webm`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    // 5. Return success response with CORS headers
    return NextResponse.json({ url: blob.url }, { headers: responseHeaders });

  } catch (e) {
    console.error("Upload Error:", e);
    return NextResponse.json(
      { error: 'Upload failed' },
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
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new NextResponse(null, { status: 200, headers: responseHeaders });
}