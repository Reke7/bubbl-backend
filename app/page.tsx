import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { list, ListBlobResultBlob } from '@vercel/blob';
import Link from 'next/link';
import VideoThumbnail from '@/components/VideoThumbnail';
import DeleteVideoButton from '@/components/DeleteVideoButton';
// 1. Import the new editor component
import VideoNameEditor from '@/components/VideoNameEditor';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

// 2. Update interface to include customName
interface BlobWithMetadata extends ListBlobResultBlob {
  metadata?: {
    durationSecs?: string;
    customName?: string; // Add this new field
  }
}

function formatDuration(secondsStr: string | undefined): string {
  if (!secondsStr) return "";
  const totalSeconds = parseInt(secondsStr, 10);
  if (isNaN(totalSeconds) || totalSeconds === 0) return "";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default async function Dashboard() {
  noStore();
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { blobs } = await list({
    prefix: user.id + '/',
    limit: 100,
    mode: 'folded',
  });

  const videoBlobs = blobs.filter(blob => blob.pathname.endsWith('.webm'));
  videoBlobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Recordings</h1>
            <p className="text-gray-600">Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}</p>
          </div>
          <div id="clerk-user-button"></div>
        </div>

        {/* Video Grid */}
        {videoBlobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <p className="text-gray-500 mb-2 text-lg font-medium">No recordings yet</p>
            <p className="text-sm text-gray-400">Click the Bubbl extension icon to start recording.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoBlobs.map((blobRaw) => {
              const blob = blobRaw as BlobWithMetadata;
              const thumbnailUrl = blob.url.replace('.webm', '.jpg');
              // 3. Extract metadata fields
              const durationStr = blob.metadata?.durationSecs;
              const customName = blob.metadata?.customName;
              const formattedDuration = formatDuration(durationStr);

              return (
              <div key={blob.url} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group relative">
                {/* THUMBNAIL AREA */}
                <div className="relative h-48 bg-gray-200">
                   <VideoThumbnail src={thumbnailUrl} alt="Video thumbnail" />
                   <DeleteVideoButton videoUrl={blob.url} />

                   {/* Play icon overlay */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                        <svg className="w-6 h-6 text-red-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                      </div>
                   </div>
                   {/* Duration Badge - This will show for new videos! */}
                   {formattedDuration && (
                     <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                       {formattedDuration}
                     </div>
                   )}
                </div>

                {/* CARD FOOTER */}
                <div className="p-4">
                   <div className="flex items-center justify-between mb-3">
                    {/* 4. Use the new editor component here */}
                    <VideoNameEditor
                        initialName={customName}
                        videoUrl={blob.url}
                        durationSecs={durationStr}
                    />
                    <span className="text-sm text-gray-500 flex-shrink-0">
                        {new Date(blob.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                   </div>
                   <Link href={`/watch?v=${encodeURIComponent(blob.url)}`} className="block w-full text-center py-2.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition border border-red-100">
                     Watch Video
                   </Link>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </main>
  );
}