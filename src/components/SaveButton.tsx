'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ParsedSession } from '@/types/chat';

interface SaveButtonProps {
  session: ParsedSession;
}

export default function SaveButton({ session }: SaveButtonProps) {
  const { data: authSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!authSession?.user) {
      setError('Please sign in to save chats');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (res.status === 401) {
        setError('Please sign in to save chats');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <button
        disabled
        className="button-success flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Saved
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={loading}
        className="button-secondary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
            Saving…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            Save
          </>
        )}
      </button>
      {error && (
        <span className="tone-text tone-red text-xs">{error}</span>
      )}
    </div>
  );
}
