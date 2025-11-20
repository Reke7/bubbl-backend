import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // FIX: Generate a unique name every time (Timestamp + Random String)
    const uniqueName = `vid-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;

    // Upload with the new unique name
    const blob = await put(uniqueName, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });

  } catch (e) {
    console.error("Upload Error:", e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}