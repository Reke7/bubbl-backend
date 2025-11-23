import Link from 'next/link';

// This ensures the page handles query parameters correctly in Next.js 13+ app dir
export const dynamic = 'force-dynamic';

export default function WatchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Get the video URL from the ?v= query parameter
  const videoUrl = searchParams.v as string;

  // If no video URL is provided, show a basic error
  if (!videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Video not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          <span className="font-bold text-xl text-gray-900">Bubbl</span>
        </Link>
        <div>
           {/* Future: Add "Sign Up to Record Your Own" button here */}
        </div>
      </header>

      {/* Video Player Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white p-4 rounded-2xl shadow-lg max-w-4xl w-full border border-gray-100">
          <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden bg-black">
             {/* The Video Player */}
            <video
              src={videoUrl}
              controls
              autoPlay
              className="absolute top-0 left-0 w-full h-full"
              style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}
            ></video>
          </div>
          <div className="mt-6 mb-2 px-2">
             <h1 className="text-2xl font-bold text-gray-900">Video Message</h1>
             <p className="text-gray-500 text-sm mt-1">Recorded with Bubbl</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Bubbl. All rights reserved.</p>
      </footer>
    </main>
  );
}