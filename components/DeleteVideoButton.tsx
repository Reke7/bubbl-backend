'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteVideoButton({ videoUrl }: { videoUrl: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    setShowConfirm(false);

    // Use startTransition to wrap the async operation.
    // This tells Next.js that the subsequent router refresh is a low-priority update.
    startTransition(async () => {
        try {
            const res = await fetch('/api/videos/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl }),
            });

            if (!res.ok) throw new Error('Failed to delete');

            // Refresh the current route to reload the server data and update the UI
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to delete video. Please try again.");
        }
    });
  };

  // State 1: Confirmation Dialog
  if (showConfirm) {
    return (
      <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
        <p className="text-white font-medium mb-3">Are you sure? This cannot be undone.</p>
        <div className="flex gap-2">
            <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
                disabled={isPending}
            >
                Cancel
            </button>
            <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition flex items-center"
                disabled={isPending}
            >
                {isPending ? (
                    // Simple loading spinner
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    "Delete"
                )}
            </button>
        </div>
      </div>
    );
  }

  // State 2: The Trash Icon Button
  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600/80 z-10"
      title="Delete Video"
      disabled={isPending}
    >
      {isPending ? (
         <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}