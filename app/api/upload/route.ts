import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

// Helper function to add CORS headers to a response
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*'); // Allow any domain
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Important for cookies:
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  // If allowing credentials, Origin cannot be '*'. We must echo back the requesting origin.
  // For simplicity in this fix, we'll set origin dynamically.
  const origin = response.headers.get("Origin") || "*";
  response.headers.set('Access-Control-Allow-Origin', origin);
  
  return response;
}

// Handle the OPTIONS preflight request that browsers send before a POST
export async function OPTIONS() {
  return cors(NextResponse.json({}, { status: 200 }));
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      // Even for errors, we must return CORS headers so the browser can see the error
      return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return cors(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}/vid-${timestamp}-${randomStr}.webm`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    // Success! Return the URL with CORS headers
    return cors(NextResponse.json({ url: blob.url }));

  } catch (e) {
    console.error("Upload Error:", e);
    return cors(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
  }
}