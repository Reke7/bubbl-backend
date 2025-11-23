import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { list } from '@vercel/blob';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Get the current user. If not logged in, send to sign-in.
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // 2. Fetch ONLY this user's videos directly from Blob storage
  const { blobs } = await list({
    prefix: user.id + '/',
    limit: 50,
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Recordings</h1>
            <p className="text-gray-600">Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}</p>
          </div>
          {/* Clerk handles the User Button / Sign Out UI automatically */}
          <div id="clerk-user-button"></div>
        </div>

        {/* Video Grid */}
        {blobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-2">You haven&apos;t recorded anything yet.</p>
            <p className="text-sm text-gray-400">Use the Bubbl extension to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blobs.map((blob) => (
              <div key={blob.url} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                {/* We use a generic placeholder because generating real thumbnails is complex */}
                <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                </div>
                <div className="p-4">
                   <div className="text-sm text-gray-500 mb-2">{new Date(blob.uploadedAt).toLocaleDateString()}</div>
                   <Link href={`/watch?v=${encodeURIComponent(blob.url)}`} className="block w-full text-center py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition">
                     Watch Video
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}