import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Vercel Blob Storage
    // "access: 'public'" means the video can be viewed by anyone with the link
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Return the direct cloud URL (e.g., public.blob.vercel-storage.com/...)
    return NextResponse.json({ url: blob.url });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}