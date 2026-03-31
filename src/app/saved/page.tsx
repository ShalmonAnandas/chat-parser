'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SavedChat {
  id: string;
  title: string;
  createdAt?: number;
  totalMessages: number;
  model?: string;
  savedAt: string;
}

function formatDate(ts?: number | string): string {
  if (!ts) return 'Unknown date';
  const date = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SavedChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch('/api/chats');
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (!res.ok) throw new Error('Failed to load saved chats');
        const data = await res.json();
        setChats(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading saved chats…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <span className="text-xs text-zinc-600 font-medium tracking-wide">Chat Parser</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Saved Chats</h1>
          <p className="text-zinc-400 text-sm">Your previously saved chat sessions</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {chats.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-zinc-500">No saved chats yet</p>
            <p className="text-zinc-600 text-sm mt-1">Upload a chat and click &quot;Save&quot; to keep it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  // Store in session and navigate to viewer
                  fetch(`/api/chats/${chat.id}`)
                    .then((res) => res.json())
                    .then((data) => {
                      sessionStorage.setItem('chat-session', JSON.stringify(data));
                      router.push('/viewer');
                    });
                }}
                className="w-full text-left rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{chat.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-zinc-500">{chat.totalMessages} messages</span>
                      {chat.model && (
                        <span className="text-xs bg-zinc-800 border border-zinc-700/50 text-zinc-500 px-2 py-0.5 rounded-md">
                          {chat.model}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">Saved {formatDate(chat.savedAt)}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
