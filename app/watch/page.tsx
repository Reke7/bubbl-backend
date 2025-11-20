'use client'; // We use client side to grab the search params easily

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VideoPlayer() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('v');

  if (!videoUrl) return <div className="p-10 text-center">No video found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Video Message for You</h1>
        </div>
        
        <div className="aspect-video bg-black w-full">
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-full" 
            autoPlay
          />
        </div>
        
        <div className="p-6 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-500">Recorded with Bubbl</p>
          <a 
            href={videoUrl} 
            download 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoPlayer />
    </Suspense>
  );
}