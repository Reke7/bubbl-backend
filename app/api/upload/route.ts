import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth, verifyToken } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const responseHeaders = new Headers();
  responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  try {
    // Try to get userId from session first, then from token
    let userId;
    
    const authResult = await auth();
    userId = authResult.userId;
    
    // If no session, try to verify token from header
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Verify token with Clerk - need to pass request as second argument
        try {
          const verified = await verifyToken(token, {
            jwtKey: process.env.CLERK_JWT_KEY
          });
          userId = verified.sub;
        } catch (err) {
          console.error('Token verification failed:', err);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: responseHeaders }
      );
    }

    // Get the file from form data
    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}/vid-${timestamp}-${randomStr}.webm`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    // Return success response with CORS headers
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
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add Authorization here too
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new NextResponse(null, { status: 200, headers: responseHeaders });
}