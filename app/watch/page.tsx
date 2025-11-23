'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VideoPlayer() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('v');

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         <Header />
         <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
               <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <h1 className="text-xl font-semibold text-gray-800 mb-2">Video Not Found</h1>
               <p className="text-gray-500 mb-6">This video link might be invalid or expired.</p>
               <Link href="/" className="text-red-500 hover:text-red-600 font-medium">Go to Homepage</Link>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Brand Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl shadow-gray-200/40 overflow-hidden border border-gray-100">
          
          {/* Video Header */}
          <div className="p-6 border-b border-gray-100 bg-white relative z-10">
            <h1 className="text-2xl font-bold text-gray-900">A Video Message for You</h1>
          </div>
          
          {/* Video Player Container */}
          <div className="relative bg-black w-full" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
            <video 
              src={videoUrl} 
              controls 
              autoPlay
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }}
            />
          </div>
          
          {/* Action Footer */}
          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               Recorded with Bubbl
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
               {/* Secondary Action: Download */}
               <a 
                 href={videoUrl} 
                 download 
                 className="flex-1 sm:flex-none justify-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 <span>Download</span>
               </a>

                {/* Primary Action: Conversion CTA */}
               <Link 
                 href="/" 
                 target="_blank"
                 className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 shadow-sm transition flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 <span>Record a Reply (Free)</span>
               </Link>
            </div>
          </div>
        </div>
        
        <footer className="mt-8 text-gray-400 text-sm">
           © {new Date().getFullYear()} Bubbl. Simple video messaging.
        </footer>
      </main>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function Header() {
   return (
      <header className="bg-white border-b border-gray-200 py-4 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <div className="w-7 h-7 bg-gradient-to-tr from-red-500 to-orange-500 rounded-lg shadow-sm transform -rotate-6"></div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Bubbl</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
           Get the Chrome Extension
        </Link>
      </header>
   );
}

function LoadingSkeleton() {
   return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         <Header />
         <div className="flex-1 flex flex-col items-center py-10 px-4 animate-pulse">
            <div className="max-w-4xl w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 h-[80px]">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
               </div>
               <div className="bg-gray-200 w-full" style={{ paddingBottom: '56.25%' }}></div>
               <div className="p-6 bg-gray-50 flex justify-between h-[88px]">
                  <div className="h-6 bg-gray-200 rounded w-1/4 my-auto"></div>
                  <div className="flex gap-3 my-auto">
                     <div className="h-10 bg-gray-200 rounded w-28"></div>
                     <div className="h-10 bg-gray-300 rounded w-40"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

// --- MAIN PAGE COMPONENT ---

export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VideoPlayer />
    </Suspense>
  );
}