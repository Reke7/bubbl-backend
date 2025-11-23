'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  initialName?: string;
  videoUrl: string;
  durationSecs?: string;
}

export default function VideoNameEditor({ initialName, videoUrl, durationSecs }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  // Use initialName or a default if it's missing (for old videos)
  const displayName = initialName || "Untitled Recording";
  const [name, setName] = useState(displayName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // If name is empty or hasn't changed, just cancel editing
    if (!name.trim() || name.trim() === displayName) {
        setIsEditing(false);
        setName(displayName);
        return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/videos/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            videoUrl,
            newName: name,
            // We must send duration back so it's not lost during update
            durationSecs: durationSecs
        }),
      });

      if (!res.ok) throw new Error('Failed to update name');

      // Refresh the page so the server fetches the new name
      router.refresh();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save video name. Please try again.");
      // Reset name on error
      setName(displayName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission behaviour
        (e.currentTarget as HTMLInputElement).blur(); // Trigger onBlur to save
    } else if (e.key === 'Escape') {
        // Cancel editing
        setIsEditing(false);
        setName(displayName);
    }
  };

  if (isEditing) {
    return (
        <div className="flex items-center flex-1 mr-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
                className="text-sm font-medium text-gray-900 border-b-2 border-blue-500 outline-none px-1 py-0.5 w-full bg-transparent"
            />
            {isLoading && (
                 // Simple loading spinner
                 <svg className="animate-spin h-4 w-4 text-blue-500 ml-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            )}
        </div>
    );
  }

  return (
    <div
        onClick={() => setIsEditing(true)}
        className="group flex items-center cursor-pointer flex-1 mr-2 min-w-0"
        title="Click to edit name"
    >
        <span className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {displayName}
        </span>
        {/* Tiny edit pencil icon that shows on hover */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
    </div>
  );
}